import { createHash, randomUUID } from 'node:crypto'
import { after, NextRequest, NextResponse } from 'next/server'
import { leadSchema } from '@/lib/lead-schema'
import { leadBrief, type LeadBrief } from '@/lib/lead-brief'
import { normalizeLeadSource, type LeadSource } from '@/lib/lead-source'
import { bounded, deadlineIn, LEAD_DEADLINES } from '@/lib/lead-deadline'
import getClientPromise from '@/lib/mongodb'
import { openLeadSheet, type SheetOutcome, type SheetRow } from '@/lib/google-sheets'

const ALLOWED_ORIGINS = [
  'https://adjeet.in',
  'https://www.adjeet.in',
  'https://adjeet.vercel.app',
  'https://www.adjeet.vercel.app',
  'http://localhost:3000',
  // A Vercel preview may post from its own deployment and branch URLs, so the
  // form can be tested before it ships. Production never widens this list.
  ...(process.env.VERCEL_ENV === 'preview'
    ? [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
        .filter((host): host is string => Boolean(host))
        .map((host) => `https://${host}`)
    : []),
]

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
type MongoOutcome = { status: 'saved' | 'replay' | 'conflict' } | { status: 'failed'; reason: string }
type BackupOutcome = SheetOutcome | { status: 'skipped' }

const RECOVERY = 'Please retry, or send your brief on WhatsApp.'

/** A loggable error category: a class name or code, never a message, which can carry personal data or secrets. */
function category(error: unknown): string {
  if (error && typeof error === 'object') {
    const { name, code } = error as { name?: unknown; code?: unknown }
    if (typeof name === 'string' && name !== 'Error') return name
    if (typeof code === 'string' || typeof code === 'number') return `code-${code}`
  }
  return 'error'
}

type Limiter = { limit: (key: string) => Promise<{ success: boolean }> }
let limiters: { perIp: Limiter; perPhone: Limiter } | null = null
let warnedNoLimiter = false

/**
 * Upstash limiters: 5 enquiries an hour per IP, and 3 owner notifications a
 * day per phone number, so a scripted run cannot flood the owner's WhatsApp
 * and email or have the business call one person over and over.
 *
 * Both fail OPEN. A lost enquiry costs more than some extra spam, and
 * Turnstile still gates every submission. Callers bound each check.
 */
async function getLimiters() {
  if (limiters) return limiters
  // The Upstash integration from the Vercel Marketplace names these KV_REST_API_*.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    if (!warnedNoLimiter) console.warn('[lead] Upstash env vars missing, rate limiting disabled')
    warnedNoLimiter = true
    return null
  }
  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({ url, token, retry: false, signal: () => AbortSignal.timeout(LEAD_DEADLINES.limiter) })
  // `timeout: 0` turns off the library's own slow-Redis fallback; the bound
  // around each call decides instead.
  limiters = {
    perIp: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 h'), analytics: false, prefix: 'lead', timeout: 0 }),
    perPhone: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '1 d'), analytics: false, prefix: 'lead-notify', timeout: 0 }),
  }
  return limiters
}

/** True unless the limiter positively says no. Errors and timeouts allow, with a sanitised warning. */
async function withinLimit(pick: (l: { perIp: Limiter; perPhone: Limiter }) => Limiter, key: string, ms: number, label: string) {
  try {
    return await bounded(async () => {
      const configured = await getLimiters()
      return !configured || (await pick(configured).limit(key)).success
    }, ms)
  } catch (error) {
    console.warn(`[lead] ${label} rate limiter unavailable, allowing: ${category(error)}`)
    return true
  }
}

class BodyTooLarge extends Error {}

/** Enforce the size limit on the bytes actually sent, not on a header a client controls. */
async function readBody(req: NextRequest, ms: number) {
  const reader = req.body?.getReader()
  if (!reader) throw new Error('Empty body')
  const chunks: Uint8Array[] = []
  let bytes = 0
  try {
    return await bounded(async signal => {
      signal.addEventListener('abort', () => { void reader.cancel().catch(() => {}) }, { once: true })
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > MAX_BODY_SIZE) { void reader.cancel().catch(() => {}); throw new BodyTooLarge() }
        chunks.push(value)
      }
      return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
    }, ms)
  } finally {
    try { reader.releaseLock() } catch {}
  }
}

// Cloudflare's documented test secrets (always pass, always fail, spent token)
// answer with a placeholder hostname, so the hostname check is for live keys.
const TEST_SECRET = /^[123]x0{30,}AA$/
const ALLOWED_HOSTNAMES = new Set(ALLOWED_ORIGINS.map(origin => new URL(origin).hostname))

async function verifyCaptcha(token: string, ip: string, secret: string, ms: number) {
  return bounded(async signal => {
    const form = new URLSearchParams({ secret, response: token })
    if (ip !== 'unknown') form.set('remoteip', ip)
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', signal, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString(),
    })
    if (!response.ok) return false
    const result = await response.json() as { success?: unknown; hostname?: unknown }
    if (result.success !== true) return false
    // A token solved on another site that embeds our public site key is not ours.
    return TEST_SECRET.test(secret) || (typeof result.hostname === 'string' && ALLOWED_HOSTNAMES.has(result.hostname))
  }, ms)
}

async function saveToMongo(record: LeadRecord, ms: number): Promise<MongoOutcome> {
  if (!process.env.MONGODB_URI) return { status: 'failed', reason: 'unconfigured' }
  const stage = deadlineIn(ms)
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
        const previous = await leads.findOne({ _id: record._id }, { timeoutMS: stage.left() })
        if (!previous) throw error
        return { status: previous.payloadHash === record.payloadHash ? 'replay' : 'conflict' }
      }
    }, ms)
  } catch (error) {
    return { status: 'failed', reason: category(error) }
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
      if (stored.status === 'replay' || stored.status === 'conflict') return { status: 'skipped' }
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
  // Keyed by a hash so Redis never holds the number itself.
  const phoneKey = createHash('sha256').update(`lead-notify:${record.phone}`).digest('hex')
  if (!(await withinLimit(l => l.perPhone, phoneKey, LEAD_DEADLINES.limiter, 'Per-phone notification'))) {
    console.warn(`[lead:${id}] Owner notification skipped: this phone number reached its daily notification cap; the enquiry is stored`)
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
    `Message: ${record.message || '(none)'}`,
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

  // Origin / CSRF check: browsers always send Origin on this POST, so direct
  // hits from curl and scrapers without it are refused.
  if (!ALLOWED_ORIGINS.includes(req.headers.get('origin') ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (Number(req.headers.get('content-length')) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (!(await withinLimit(l => l.perIp, ip, clock.left(LEAD_DEADLINES.limiter), 'Per-IP'))) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await readBody(req, clock.left(LEAD_DEADLINES.body))
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
