import { createHash, randomUUID } from 'node:crypto'
import { after, NextRequest, NextResponse } from 'next/server'
import { callTimeLabel, leadSchema } from '@/lib/lead-schema'
import { leadBrief, type LeadBrief } from '@/lib/lead-brief'
import { normalizeLeadSource, type LeadSource } from '@/lib/lead-source'
import { bounded, deadlineIn, LEAD_DEADLINES } from '@/lib/lead-deadline'
import { clientIp, rateKey } from '@/lib/client-ip'
import { allowedHostnames, allowedOrigins } from '@/lib/allowed-origins'
import { admitNotification, admitVisitor, category } from '@/lib/lead-limits'
import { BodyTooLarge, readJsonBody } from '@/lib/request-body'
import getClientPromise from '@/lib/mongodb'
import { openLeadSheet, type SheetOutcome, type SheetRow } from '@/lib/google-sheets'

const ALLOWED_ORIGINS = allowedOrigins()

// Max request body size: 10KB, generous for this form.
const MAX_BODY_SIZE = 10_000

// Next reads this statically, so it stays a literal. lib/lead-deadline.ts
// keeps the response and the notifications after it inside this budget.
export const maxDuration = 10

/**
 * Receipt contract: the visitor sees success only after MongoDB or the
 * private Sheet acknowledges the complete brief. Email and WhatsApp
 * notifications run after the response and never decide it.
 */
type LeadRecord = LeadBrief & {
  _id: string
  receiptId: string
  payloadHash: string
  source: LeadSource
  stage: 'received'
  createdAt: Date
}
type MongoOutcome = { status: 'saved' | 'replay' | 'conflict' } | { status: 'failed' | 'reference-unverified'; reason: string }
type BackupOutcome = SheetOutcome | { status: 'skipped' }

const RECOVERY = 'Please retry, or send your brief on WhatsApp.'

// Cloudflare's documented test secrets (always pass, always fail, spent token)
// answer with placeholder hostname and action values, so both checks are for live keys.
const TEST_SECRET = /^[123]x0{30,}AA$/
const ALLOWED_HOSTNAMES = allowedHostnames()
/** The action LeadForm's widget declares. */
const TURNSTILE_ACTION = 'lead'

async function verifyCaptcha(token: string, ip: string | null, secret: string, ms: number) {
  return bounded(async signal => {
    const form = new URLSearchParams({ secret, response: token })
    if (ip) form.set('remoteip', ip)
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', signal, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString(),
    })
    if (!response.ok) return false
    const result = await response.json() as { success?: unknown; hostname?: unknown; action?: unknown }
    if (result.success !== true) return false
    if (TEST_SECRET.test(secret)) return true
    // A token solved on another site that embeds our public site key is not ours.
    if (typeof result.hostname !== 'string' || !ALLOWED_HOSTNAMES.has(result.hostname)) return false
    // A token solved for another action was not solved on this form. A token
    // with no action is still accepted for now (2026-11-15): pages cached
    // before the widget declared its action send one, and those visitors must
    // not lose an enquiry. Require the action once those caches have expired.
    return result.action === undefined || result.action === null || result.action === '' || result.action === TURNSTILE_ACTION
  }, ms)
}

/** Carriage returns, line feeds and Unicode line breaks, which would start a new line in the owner's notification. */
const LINE_BREAKS = /[\r\n\v\f\u0085\p{Zl}\p{Zp}]+/gu

/** The visitor's free text on one line, so it cannot add lines that look like the notification's own. */
function oneLine(text: string) {
  return text.replace(LINE_BREAKS, ' ').trim()
}

async function saveToMongo(record: LeadRecord, ms: number): Promise<MongoOutcome> {
  if (!process.env.MONGODB_URI) return { status: 'failed', reason: 'unconfigured' }
  const stage = deadlineIn(ms)
  let duplicateObserved = false
  try {
    return await bounded<MongoOutcome>(async () => {
      const client = await getClientPromise()
      const leads = client.db('adjeet').collection<LeadRecord>('leads')
      try {
        const result = await leads.insertOne(record, { timeoutMS: stage.left() })
        return result.acknowledged ? { status: 'saved' } : { status: 'failed', reason: 'unacknowledged' }
      } catch (error) {
        // The reference is the _id, so a retry of a saved enquiry lands here.
        if ((error as { code?: unknown } | null)?.code !== 11000) throw error
        duplicateObserved = true
        const previous = await leads.findOne({ _id: record._id }, { timeoutMS: stage.left() })
        if (!previous) throw error
        return { status: previous.payloadHash === record.payloadHash ? 'replay' : 'conflict' }
      }
    }, ms)
  } catch (error) {
    // Keep this state outside the bounded task: a failed or timed-out lookup
    // must not let a different brief reach the fallback with an existing ID.
    return { status: duplicateObserved ? 'reference-unverified' : 'failed', reason: category(error) }
  }
}

/**
 * Prepare the Sheet while Mongo is writing, then append unless Mongo shows the
 * reference was already handled, so a retried enquiry does not add a row.
 * Mongo has its own shorter deadline, so a stalled Mongo cannot use up the
 * time Sheets needs.
 */
async function saveToSheet(row: SheetRow, mongo: Promise<MongoOutcome>, ms: number): Promise<BackupOutcome> {
  try {
    return await bounded<BackupOutcome>(async signal => {
      const sheet = await openLeadSheet(signal)
      const stored = await mongo
      if (stored.status === 'replay' || stored.status === 'conflict' || stored.status === 'reference-unverified') return { status: 'skipped' }
      return sheet.ready ? sheet.append(row, signal) : sheet.outcome
    }, ms)
  } catch (error) {
    return { status: 'failed', reason: category(error) }
  }
}

function sheetRow(record: LeadRecord): SheetRow {
  return {
    'Enquiry ID': record.receiptId,
    Date: record.createdAt.toISOString(),
    Name: record.name,
    Phone: record.phone,
    City: record.city,
    Services: record.serviceInterest.join(', '),
    Timeline: record.timeline,
    Message: record.message,
    // Left out when the visitor chose nothing, so the Sheet gains this column
    // only once someone uses it, and a row without it is still a complete brief.
    ...(record.bestTimeToCall ? { 'Best time to call': callTimeLabel(record.bestTimeToCall) } : {}),
    'Landing page': record.source.landingPage,
    Source: record.source.source,
    Medium: record.source.medium,
    Campaign: record.source.campaign,
    Status: record.stage,
  }
}

function describe(outcome: MongoOutcome | BackupOutcome) {
  if ('reason' in outcome) return `${outcome.status}:${outcome.reason}`
  if ('missing' in outcome && outcome.missing.length) return `${outcome.status}(no column: ${outcome.missing.join(', ')})`
  return outcome.status
}

/** Best effort, after the response. The stores, not these messages, are the record. */
async function notifyOwner(record: LeadRecord, confirmed: boolean) {
  const id = record.receiptId
  // Paid messages fail closed: past a cap, or when the caps cannot be
  // counted, the owner finds this enquiry in the register and the Sheet instead.
  const verdict = await admitNotification(record.phone)
  if (!verdict.send) {
    console.warn(`[lead:${id}] Owner notification skipped (${verdict.reason}); the enquiry is ${confirmed ? 'stored' : 'NOT confirmed as stored'}`)
    return
  }
  const text = [
    confirmed
      ? `Enquiry ID: ${id}`
      : `Enquiry ID: ${id}\nNOT CONFIRMED: the website could not save this enquiry and asked the visitor to retry or use WhatsApp. Search the register for this ID before treating it as lost.`,
    `Name: ${record.name}`,
    `Phone: ${record.phone}`,
    `City: ${record.city}`,
    `Services: ${record.serviceInterest.join(', ')}`,
    `Timeline: ${record.timeline}`,
    `Best time to call: ${record.bestTimeToCall ? `${callTimeLabel(record.bestTimeToCall)} (a request, not a booked slot)` : '(not given)'}`,
    `Message: ${oneLine(record.message ?? '') || '(none)'}`,
  ].join('\n')
  const tasks: { channel: string; send: Promise<unknown> }[] = []

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    // `onboarding@resend.dev` is Resend's sandbox sender: it only delivers to
    // the Resend account owner. Verify adjeet.in in Resend and set
    // LEAD_EMAIL_FROM to reach anyone else.
    const from = process.env.LEAD_EMAIL_FROM ?? 'onboarding@resend.dev'
    if (process.env.NODE_ENV === 'production' && from.endsWith('@resend.dev')) {
      console.warn(`[lead:${id}] Sending from Resend's sandbox address; set LEAD_EMAIL_FROM to a verified sender`)
    }
    tasks.push({ channel: 'email', send: bounded(async () => {
      const { Resend } = await import('resend')
      const { error } = await new Resend(apiKey).emails.send({
        from,
        to: process.env.LEAD_EMAIL_TO ?? 'ranjitadjeet@gmail.com',
        subject: confirmed ? `AD JEET enquiry ${id}` : `AD JEET enquiry NOT CONFIRMED ${id}`,
        text,
      }, { idempotencyKey: `lead-${confirmed ? 'saved' : 'unconfirmed'}/${id}` })
      if (error) throw Object.assign(new Error('Email rejected'), { name: 'ResendRejected' })
    }, LEAD_DEADLINES.notify) })
  }

  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_WHATSAPP_FROM: from, RUPAM_WHATSAPP_NUMBER: to } = process.env
  if (sid && token && from && to) {
    tasks.push({ channel: 'whatsapp', send: bounded(async () => {
      const { Twilio } = await import('twilio')
      await new Twilio(sid, token, { timeout: LEAD_DEADLINES.notify - 300, autoRetry: false }).messages.create({ from, to, body: text })
    }, LEAD_DEADLINES.notify) })
  }

  const results = await Promise.allSettled(tasks.map(task => task.send))
  const failures = results.flatMap((result, i) => (result.status === 'rejected' ? [`${tasks[i].channel}=${category(result.reason)}`] : []))
  if (failures.length) console.warn(`[lead:${id}] Owner notification failed: ${failures.join(' ')}`)
}

export async function POST(req: NextRequest) {
  const started = Date.now()
  const clock = deadlineIn(LEAD_DEADLINES.response)

  // Origin / CSRF check: a browser sets Origin itself on this POST, so a page
  // on another site cannot post here with a visitor's browser. It does not
  // block curl or any other script, which can send whatever Origin it likes:
  // Turnstile and the rate limits, not this, are what stop scripted traffic.
  if (!ALLOWED_ORIGINS.includes(req.headers.get('origin') ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (Number(req.headers.get('content-length')) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
  }

  // The address itself goes to Turnstile. The limiter counts an IPv6 visitor by
  // /64, so rotating through addresses in one connection's range gains nothing,
  // and stores only a hash of it.
  const ip = clientIp(req.headers)
  if (!(await admitVisitor(ip && rateKey(ip), clock.left(LEAD_DEADLINES.limiter)))) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await readJsonBody(req, MAX_BODY_SIZE, clock.left(LEAD_DEADLINES.body))
  } catch (error) {
    return error instanceof BodyTooLarge
      ? NextResponse.json({ error: 'Request too large.' }, { status: 413 })
      : NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid form data.' }, { status: 422 })
  const lead = parsed.data
  // Older cached pages send no reference; give the enquiry one anyway.
  const receiptId = lead.submissionId ?? randomUUID()

  // Turnstile: fail closed in production if the secret is missing. The dev
  // test key is only used outside production.
  const secret = process.env.TURNSTILE_SECRET_KEY
    || (process.env.NODE_ENV !== 'production' ? '1x0000000000000000000000000000000AA' : '')
  if (!secret) {
    console.error('[lead] TURNSTILE_SECRET_KEY missing in production, blocking submission')
    return NextResponse.json({ error: `The enquiry service is temporarily unavailable. ${RECOVERY}` }, { status: 503 })
  }
  try {
    if (!(await verifyCaptcha(lead.cfTurnstileResponse, ip, secret, clock.left(LEAD_DEADLINES.captcha)))) {
      return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 400 })
    }
  } catch (error) {
    console.warn(`[lead:${receiptId}] CAPTCHA check unavailable: ${category(error)}`)
    return NextResponse.json({ error: `The CAPTCHA check is unavailable right now. ${RECOVERY}` }, { status: 503 })
  }

  const brief = leadBrief(lead)
  const record: LeadRecord = {
    _id: `web:${receiptId}`,
    receiptId,
    payloadHash: createHash('sha256').update(JSON.stringify(brief)).digest('hex'),
    ...brief,
    source: normalizeLeadSource(lead.source),
    stage: 'received',
    createdAt: new Date(),
  }

  const mongo = saveToMongo(record, Math.min(LEAD_DEADLINES.mongo, clock.left() - LEAD_DEADLINES.sheetsReserve))
  const [stored, backup] = await Promise.all([mongo, saveToSheet(sheetRow(record), mongo, clock.left())])
  const summary = `[lead:${receiptId}] mongo=${describe(stored)} sheets=${describe(backup)} ms=${Date.now() - started}`

  if (stored.status === 'replay') {
    console.info(`${summary} (retry of a saved enquiry)`)
    return NextResponse.json({ ok: true, receiptId })
  }
  if (stored.status === 'conflict') {
    console.warn(`${summary} (reference reused for a different brief)`)
    return NextResponse.json({ error: 'This reference was already used for a different brief. Please send the brief again.', receiptId }, { status: 409 })
  }
  if (stored.status === 'reference-unverified') {
    console.warn(`${summary} (existing reference could not be compared)`)
    return NextResponse.json({
      error: `We could not confirm the details saved under this reference. Keep this reference. ${RECOVERY}`,
      receiptId,
    }, { status: 503 })
  }

  const confirmed = stored.status === 'saved' || backup.status === 'saved'
  if (!confirmed) console.error(`${summary} NOT CONFIRMED`)
  else if (stored.status !== 'saved' || backup.status !== 'saved' || backup.missing.length) console.warn(summary)
  else console.info(summary)

  // Runs after the response, inside maxDuration. When nothing was saved the
  // owner is still told, marked as unconfirmed, so the enquiry can be chased.
  after(() => notifyOwner(record, confirmed))

  if (!confirmed) {
    return NextResponse.json({
      error: `We could not confirm that your enquiry reached us. Keep this reference. ${RECOVERY}`,
      receiptId,
    }, { status: 503 })
  }
  return NextResponse.json({ ok: true, receiptId })
}
