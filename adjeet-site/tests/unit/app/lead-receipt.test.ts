// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const fakes = vi.hoisted(() => ({
  insert: vi.fn(), find: vi.fn(), open: vi.fn(), sheet: vi.fn(), email: vi.fn(), limit: vi.fn(), whatsapp: vi.fn(),
  scheduled: [] as Promise<unknown>[],
  /** Each limiter's window by prefix, as the route configured it. */
  windows: new Map<string, { kind: string; tokens: number; window: string }>(),
}))
vi.mock('@/lib/mongodb', () => ({ default: async () => ({ db: () => ({ collection: () => ({ insertOne: fakes.insert, findOne: fakes.find }) }) }) }))
vi.mock('@/lib/google-sheets', () => ({ openLeadSheet: fakes.open }))
vi.mock('resend', () => ({ Resend: class { emails = { send: fakes.email } } }))
vi.mock('twilio', () => ({ Twilio: class { messages = { create: fakes.whatsapp } } }))
// Only the real Sheets writer uses it, in the "best time to call" tests below.
vi.mock('google-auth-library', () => ({ JWT: class { async getAccessToken() { return { token: 'test-token' } } } }))
// Each limiter is told apart by its prefix: 'lead' per IP, 'lead-noip' for
// requests without one, 'lead-notify' per phone, 'lead-site-day' for every
// enquiry, 'lead-notify-hour' and 'lead-notify-day' for notifications.
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow(tokens: number, window: string) { return { kind: 'sliding', tokens, window } }
    static fixedWindow(tokens: number, window: string) { return { kind: 'fixed', tokens, window } }
    constructor(private readonly config: { prefix: string; limiter: { kind: string; tokens: number; window: string } }) {
      fakes.windows.set(config.prefix, config.limiter)
    }
    limit = (key: string) => fakes.limit(this.config.prefix, key)
  },
}))
vi.mock('@upstash/redis', () => ({ Redis: class {} }))
vi.mock('next/server', async importOriginal => ({
  ...await importOriginal<typeof import('next/server')>(),
  after: (work: () => Promise<unknown>) => { fakes.scheduled.push(Promise.resolve().then(work)) },
}))

const brief = {
  name: 'Local Buyer', phone: '9876543210', city: 'Siliguri',
  serviceInterest: ['glow-sign-boards'], timeline: 'exploring',
  message: 'A new shopfront', cfTurnstileResponse: 'test-token',
  submissionId: '391d4b38-a519-4faf-947d-037c5678e723',
}
const PERSONAL = [brief.name, brief.phone, brief.message]
const saved = { status: 'saved', missing: [] }
const sheetDown = { status: 'failed', reason: 'http-503' }

// Vercel always sets the visitor's address; `withoutAddress` drops it.
const request = (body: unknown = brief, { withoutAddress = false } = {}) => new NextRequest('https://adjeet.in/api/lead', {
  method: 'POST',
  headers: { origin: 'https://adjeet.in', 'content-type': 'application/json', ...(withoutAddress ? {} : { 'x-forwarded-for': '198.51.100.20' }) },
  body: JSON.stringify(body),
})
async function submit(body: unknown = brief, options?: { withoutAddress?: boolean }) {
  const { POST } = await import('@/app/api/lead/route')
  return POST(request(body, options))
}
async function notificationsSettled() { await Promise.allSettled(fakes.scheduled) }
function logged() {
  return [console.log, console.info, console.warn, console.error]
    .flatMap(spy => (spy as unknown as ReturnType<typeof vi.fn>).mock.calls.flat())
    .map(arg => (arg instanceof Error ? `${arg.message} ${arg.stack}` : typeof arg === 'string' ? arg : JSON.stringify(arg)))
    .join('\n')
}

beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks()
  fakes.scheduled.length = 0
  fakes.windows.clear()
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv('MONGODB_URI', 'mongodb://example.test/adjeet')
  vi.stubEnv('RESEND_API_KEY', '')
  // Configured by default: owner notifications are only sent once the volume
  // caps have been counted. Tests of an unconfigured limiter clear these.
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test')
  vi.stubEnv('KV_REST_API_URL', '')
  vi.stubEnv('KV_REST_API_TOKEN', '')
  for (const name of ['LEAD_DAILY_CAP', 'LEAD_NOTIFY_HOURLY_CAP', 'LEAD_NOTIFY_DAILY_CAP', 'LIMITER_KEY_SECRET', 'TURNSTILE_SECRET_KEY']) vi.stubEnv(name, '')
  vi.stubEnv('TWILIO_ACCOUNT_SID', '')
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response(JSON.stringify({ success: true, hostname: 'adjeet.in' }))))
  for (const method of ['log', 'info', 'warn', 'error'] as const) vi.spyOn(console, method).mockImplementation(() => {})
  fakes.insert.mockResolvedValue({ acknowledged: true })
  fakes.find.mockResolvedValue(null)
  fakes.open.mockImplementation(async () => ({ ready: true, append: fakes.sheet }))
  fakes.sheet.mockResolvedValue(sheetDown)
  fakes.email.mockResolvedValue({ data: { id: 'notification' }, error: null })
  fakes.limit.mockResolvedValue({ success: true })
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks() })

describe('durable lead receipt', () => {
  it('does not report receipt when every durable destination fails and email is unconfigured', async () => {
    fakes.insert.mockRejectedValue(new Error('database offline'))
    const response = await submit()
    expect(response.status).toBe(503)
    const body = await response.json()
    expect(body).toMatchObject({ receiptId: brief.submissionId })
    expect(body.ok).toBeUndefined()
    expect(body.error).toMatch(/WhatsApp/)
  })

  it('reports receipt when Sheets saves even though Mongo and email fail', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    fakes.insert.mockRejectedValue(new Error('database offline'))
    fakes.sheet.mockResolvedValue(saved)
    fakes.email.mockResolvedValue({ error: { message: 'unavailable' } })
    const response = await submit()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, receiptId: brief.submissionId })
  })

  it('reports receipt when Mongo saves even though Sheets fails', async () => {
    const response = await submit()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, receiptId: brief.submissionId })
  })

  it('does not count a Sheet row missing part of the brief as a receipt', async () => {
    fakes.insert.mockRejectedValue(new Error('database offline'))
    fakes.sheet.mockResolvedValue({ status: 'partial', missing: ['Message'] })
    expect((await submit()).status).toBe(503)
  })

  it('requires an acknowledged Mongo write', async () => {
    fakes.insert.mockResolvedValue({ acknowledged: false })
    expect((await submit()).status).toBe(503)
  })

  it('stores the receipt reference and initial stage without storing CAPTCHA', async () => {
    fakes.sheet.mockResolvedValue(saved)
    const response = await submit()
    expect(response.status).toBe(200)
    expect(fakes.insert.mock.calls[0][0]).toMatchObject({ _id: `web:${brief.submissionId}`, receiptId: brief.submissionId, stage: 'received' })
    expect(fakes.insert.mock.calls[0][0]).not.toHaveProperty('cfTurnstileResponse')
    expect(fakes.sheet.mock.calls[0][0]).toMatchObject({ 'Enquiry ID': brief.submissionId, Name: 'Local Buyer', Status: 'received' })
  })

  it('treats a replayed reference as the same enquiry: no second Sheet row and no second notification', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    fakes.sheet.mockResolvedValue(saved)
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    const stored = fakes.insert.mock.calls[0][0]
    fakes.insert.mockRejectedValue({ code: 11000 })
    fakes.find.mockResolvedValue(stored)
    const replay = await submit({ ...brief, cfTurnstileResponse: 'fresh-token' })
    expect(replay.status).toBe(200)
    expect(await replay.json()).toEqual({ ok: true, receiptId: brief.submissionId })
    await notificationsSettled()
    expect(fakes.sheet).toHaveBeenCalledTimes(1)
    expect(fakes.email).toHaveBeenCalledTimes(1)
  })

  it('rejects a reused reference carrying a different brief, without writing or notifying', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    await submit()
    await notificationsSettled()
    const stored = fakes.insert.mock.calls[0][0]
    fakes.insert.mockRejectedValue({ code: 11000 })
    fakes.find.mockResolvedValue(stored)
    const response = await submit({ ...brief, message: 'A different project' })
    expect(response.status).toBe(409)
    await notificationsSettled()
    expect(fakes.sheet).toHaveBeenCalledTimes(1)
    expect(fakes.email).toHaveBeenCalledTimes(1)
  })

  it('still alerts the owner when nothing could be saved, marked as unconfirmed', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    fakes.insert.mockRejectedValue(new Error('database offline'))
    expect((await submit()).status).toBe(503)
    await notificationsSettled()
    expect(fakes.email).toHaveBeenCalledTimes(1)
    expect(fakes.email.mock.calls[0][0].subject).toMatch(/not confirmed/i)
  })

  it('does not accept an oversized body without a content-length header', async () => {
    expect((await submit({ ...brief, ignored: 'x'.repeat(11000) })).status).toBe(413)
    expect(fakes.insert).not.toHaveBeenCalled()
  })

  it.each(['rejects', 'missing', 'times out'])('does not append or notify when an existing reference comparison %s', async failure => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    fakes.insert.mockRejectedValue({ code: 11000 })
    fakes.sheet.mockResolvedValue(saved)
    if (failure === 'rejects') fakes.find.mockRejectedValue(new Error('lookup unavailable'))
    else if (failure === 'missing') fakes.find.mockResolvedValue(null)
    else fakes.find.mockImplementation(() => new Promise(() => {}))
    const { POST } = await import('@/app/api/lead/route')
    vi.useFakeTimers()
    const pending = POST(request({ ...brief, message: 'Possibly a changed brief' }))
    await vi.advanceTimersByTimeAsync(6500)
    const response = await pending
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ receiptId: brief.submissionId })
    await notificationsSettled()
    expect(fakes.sheet).not.toHaveBeenCalled()
    expect(fakes.email).not.toHaveBeenCalled()
  })

  it('rejects an invalid brief before any write', async () => {
    expect((await submit({ ...brief, phone: '123' })).status).toBe(422)
    expect(fakes.insert).not.toHaveBeenCalled()
    expect(fakes.open).not.toHaveBeenCalled()
  })
})

describe('rate limiter dependency (fails open: Turnstile still gates every enquiry)', () => {
  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test')
  })

  it('still refuses a visitor over the per-IP limit', async () => {
    fakes.limit.mockImplementation(async (prefix: string) => ({ success: prefix !== 'lead' }))
    expect((await submit()).status).toBe(429)
    expect(fakes.insert).not.toHaveBeenCalled()
  })

  it('keeps accepting enquiries when the limiter throws, and logs only a category', async () => {
    fakes.limit.mockRejectedValue(new Error('Upstash rejected token SECRET-TOKEN for example.upstash.io'))
    const response = await submit()
    expect(response.status).toBe(200)
    expect(fakes.insert).toHaveBeenCalledTimes(1)
    expect(logged()).toMatch(/rate limiter unavailable/i)
    expect(logged()).not.toContain('SECRET-TOKEN')
  })

  it('keeps accepting enquiries when the limiter stalls, within the deadline', async () => {
    const { POST } = await import('@/app/api/lead/route')
    const { LEAD_DEADLINES } = await import('@/lib/lead-deadline')
    vi.useFakeTimers()
    fakes.limit.mockImplementation(() => new Promise(() => {}))
    let settled = false
    const pending = POST(request()).finally(() => { settled = true })
    await vi.advanceTimersByTimeAsync(LEAD_DEADLINES.limiter + 100)
    expect(settled).toBe(true)
    expect((await pending).status).toBe(200)
  })

  it('counts every address in one IPv6 /64 as one visitor, and sends the CAPTCHA check the address itself', async () => {
    const { POST } = await import('@/app/api/lead/route')
    for (const address of ['2401:4900:1c2a:5b3d:1:2:3:4', '2401:4900:1c2a:5b3d:ffff:eeee:dddd:cccc']) {
      const req = new NextRequest('https://adjeet.in/api/lead', {
        method: 'POST',
        headers: { origin: 'https://adjeet.in', 'content-type': 'application/json', 'x-forwarded-for': address },
        body: JSON.stringify(brief),
      })
      expect((await POST(req)).status).toBe(200)
    }
    const visitorKeys = fakes.limit.mock.calls.filter(([prefix]) => prefix === 'lead').map(([, key]) => key)
    expect(visitorKeys).toHaveLength(2)
    expect(visitorKeys[0]).toBe(visitorKeys[1])
    // Redis holds a hash of the /64, never the address.
    expect(visitorKeys[0]).toMatch(/^[0-9a-f]{64}$/)
    const sent = vi.mocked(fetch).mock.calls.map(([, init]) => String((init as RequestInit).body))
    expect(sent[0]).toContain('remoteip=2401%3A4900%3A1c2a%3A5b3d%3A1%3A2%3A3%3A4')
  })

  it('keeps an IPv4 visitor under a hash of the address itself', async () => {
    const { POST } = await import('@/app/api/lead/route')
    const send = (forwarded: string) => POST(new NextRequest('https://adjeet.in/api/lead', {
      method: 'POST',
      headers: { origin: 'https://adjeet.in', 'content-type': 'application/json', 'x-forwarded-for': forwarded },
      body: JSON.stringify(brief),
    }))
    expect((await send('203.0.113.7, 10.0.0.1')).status).toBe(200)
    expect((await send('203.0.113.8')).status).toBe(200)
    const [first, second] = fakes.limit.mock.calls.filter(([prefix]) => prefix === 'lead').map(([, key]) => String(key))
    expect(first).toMatch(/^[0-9a-f]{64}$/)
    expect(first).not.toBe(second)
    expect(JSON.stringify(fakes.limit.mock.calls)).not.toContain('203.0.113')
  })

  it('counts requests without an address in their own bucket, not a shared "unknown" one, and warns once', async () => {
    expect((await submit(brief, { withoutAddress: true })).status).toBe(200)
    expect((await submit(brief, { withoutAddress: true })).status).toBe(200)
    const keys = fakes.limit.mock.calls.filter(([prefix]) => prefix === 'lead' || prefix === 'lead-noip')
    expect(keys.map(([prefix]) => prefix)).toEqual(['lead-noip', 'lead-noip'])
    expect(keys.map(([, key]) => key)).not.toContain('unknown')
    // Generous enough that one sender cannot lock out every visitor without an address.
    expect(fakes.windows.get('lead-noip')!.tokens).toBeGreaterThan(fakes.windows.get('lead')!.tokens)
    const warnings = vi.mocked(console.warn).mock.calls.flat().filter(line => /no client address/i.test(String(line)))
    expect(warnings).toHaveLength(1)
    // Turnstile is not told an address it does not have.
    const sent = vi.mocked(fetch).mock.calls.map(([, init]) => String((init as RequestInit).body))
    expect(sent[0]).not.toContain('remoteip')
  })

  it('still refuses a request without an address once that bucket is spent', async () => {
    fakes.limit.mockImplementation(async (prefix: string) => ({ success: prefix !== 'lead-noip' }))
    expect((await submit(brief, { withoutAddress: true })).status).toBe(429)
    expect(fakes.insert).not.toHaveBeenCalled()
  })

  it('keeps accepting enquiries when production has no limiter configured, as before', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'live-secret')
    expect((await submit()).status).toBe(200)
  })
})

describe('owner notification cap per phone', () => {
  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test')
    vi.stubEnv('RESEND_API_KEY', 'test-key')
  })

  it('saves the enquiry but sends no notification once that phone reaches the cap, keyed by a hash', async () => {
    fakes.limit.mockImplementation(async (prefix: string) => ({ success: prefix !== 'lead-notify' }))
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    expect(fakes.insert).toHaveBeenCalledTimes(1)
    expect(fakes.email).not.toHaveBeenCalled()
    const phoneKey = fakes.limit.mock.calls.find(([prefix]) => prefix === 'lead-notify')?.[1]
    expect(phoneKey).toMatch(/^[0-9a-f]{64}$/)
    expect(phoneKey).not.toContain(brief.phone)
  })

  it('keys the phone and the visitor with HMAC under LIMITER_KEY_SECRET, so neither can be brute-forced from Redis', async () => {
    vi.stubEnv('LIMITER_KEY_SECRET', 'limiter-secret')
    const { createHmac } = await import('node:crypto')
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    const keyOf = (prefix: string) => fakes.limit.mock.calls.find(([p]) => p === prefix)?.[1]
    expect(keyOf('lead-notify')).toBe(createHmac('sha256', 'limiter-secret').update(`adjeet-limiter:phone:${brief.phone}`).digest('hex'))
    expect(keyOf('lead')).toBe(createHmac('sha256', 'limiter-secret').update('adjeet-limiter:198.51.100.20').digest('hex'))
    expect(logged()).not.toContain('limiter-secret')
  })

  // Changed again on 2026-11-15: when the caps cannot be counted, the owner
  // is still told, under the in-process fallback bound.
  it('stores the enquiry and still notifies, under the fallback bound, when the cap cannot be checked', async () => {
    fakes.limit.mockImplementation(async (prefix: string) => {
      if (prefix === 'lead-notify') throw new Error('offline')
      return { success: true }
    })
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    expect(fakes.insert).toHaveBeenCalledTimes(1)
    expect(fakes.email).toHaveBeenCalledTimes(1)
  })
})

describe('owner notification volume caps (no phone dimension)', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    vi.stubEnv('TWILIO_ACCOUNT_SID', 'AC-test')
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'twilio-test')
    vi.stubEnv('TWILIO_WHATSAPP_FROM', 'whatsapp:+10000000000')
    vi.stubEnv('RUPAM_WHATSAPP_NUMBER', 'whatsapp:+910000000000')
  })
  const twilio = fakes.whatsapp
  beforeEach(() => { twilio.mockResolvedValue({ sid: 'SM-test' }) })

  it('notifies by email and WhatsApp while under every cap, counting each cap once', async () => {
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    expect(fakes.email).toHaveBeenCalledTimes(1)
    expect(twilio).toHaveBeenCalledTimes(1)
    const counted = fakes.limit.mock.calls.map(([prefix]) => prefix)
    for (const prefix of ['lead-site-day', 'lead-notify', 'lead-notify-hour', 'lead-notify-day']) {
      expect(counted.filter(p => p === prefix), prefix).toHaveLength(1)
    }
    // The site and notification counters are one bucket each, with no phone or address in them.
    for (const prefix of ['lead-site-day', 'lead-notify-hour', 'lead-notify-day']) {
      const key = String(fakes.limit.mock.calls.find(([p]) => p === prefix)![1])
      expect(key).not.toContain(brief.phone)
      expect(key).not.toMatch(/^[0-9a-f]{64}$/)
    }
  })

  it.each([
    ['site-wide daily enquiry cap', 'lead-site-day'],
    ['hourly notification cap', 'lead-notify-hour'],
    ['daily notification cap', 'lead-notify-day'],
  ])('past the %s, still stores and receipts the enquiry, sends nothing, and logs one warning', async (_label, capped) => {
    fakes.limit.mockImplementation(async (prefix: string) => ({ success: prefix !== capped }))
    fakes.sheet.mockResolvedValue(saved)
    const response = await submit()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, receiptId: brief.submissionId })
    await notificationsSettled()
    expect(fakes.insert).toHaveBeenCalledTimes(1)
    expect(fakes.sheet).toHaveBeenCalledTimes(1)
    expect(fakes.email).not.toHaveBeenCalled()
    expect(twilio).not.toHaveBeenCalled()
    const warnings = vi.mocked(console.warn).mock.calls.flat().map(String).filter(line => /notification skipped/i.test(line))
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain(brief.submissionId)
  })

  it('a fresh phone number does not get past the hourly cap', async () => {
    fakes.limit.mockImplementation(async (prefix: string) => ({ success: prefix !== 'lead-notify-hour' }))
    expect((await submit({ ...brief, phone: '9123456780', submissionId: '6f1c2c9e-1d5b-4d8e-9a59-2f3a6f0f6b11' })).status).toBe(200)
    await notificationsSettled()
    expect(fakes.email).not.toHaveBeenCalled()
  })

  const fallbackWarnings = () => vi.mocked(console.warn).mock.calls.flat().map(String).filter(line => /in-process fallback/i.test(line))

  it('still notifies by email and WhatsApp when the limiter errors, warns once, and logs no secret', async () => {
    fakes.limit.mockImplementation(async (prefix: string) => {
      if (prefix === 'lead') return { success: true }
      throw new Error('Upstash rejected token SECRET-TOKEN')
    })
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    expect(fakes.insert).toHaveBeenCalledTimes(1)
    expect(fakes.email).toHaveBeenCalledTimes(1)
    expect(twilio).toHaveBeenCalledTimes(1)
    expect(fallbackWarnings()).toHaveLength(1)
    expect(logged()).not.toContain('SECRET-TOKEN')
  })

  it('still notifies when the limiter stalls', async () => {
    const { POST } = await import('@/app/api/lead/route')
    const { LEAD_DEADLINES } = await import('@/lib/lead-deadline')
    fakes.limit.mockImplementation(async (prefix: string) => (prefix === 'lead' ? { success: true } : new Promise(() => {})))
    vi.useFakeTimers()
    const response = await POST(request())
    expect(response.status).toBe(200)
    await vi.advanceTimersByTimeAsync(LEAD_DEADLINES.limiter + 100)
    await notificationsSettled()
    expect(fakes.email).toHaveBeenCalledTimes(1)
  })

  it('still notifies, and stores, when no limiter is configured', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    expect(fakes.insert).toHaveBeenCalledTimes(1)
    expect(fakes.email).toHaveBeenCalledTimes(1)
    expect(twilio).toHaveBeenCalledTimes(1)
  })

  it('bounds degraded notifications per instance, warning once, and opens again when the window passes', async () => {
    const { LEAD_FALLBACK } = await import('@/lib/lead-limits')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-15T10:00:00Z'))
    const runs = LEAD_FALLBACK.maxNotifications + 2
    for (let i = 0; i < runs; i++) expect((await submit()).status).toBe(200)
    await notificationsSettled()
    // Every enquiry is stored; only the notifications past the bound are skipped.
    expect(fakes.insert).toHaveBeenCalledTimes(runs)
    expect(fakes.email).toHaveBeenCalledTimes(LEAD_FALLBACK.maxNotifications)
    expect(twilio).toHaveBeenCalledTimes(LEAD_FALLBACK.maxNotifications)
    expect(fallbackWarnings()).toHaveLength(1)
    const skipped = vi.mocked(console.warn).mock.calls.flat().map(String).filter(line => /notification skipped \(fallback-cap\)/i.test(line))
    expect(skipped).toHaveLength(2)

    vi.setSystemTime(new Date(Date.now() + LEAD_FALLBACK.windowMs + 1000))
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    expect(fakes.email).toHaveBeenCalledTimes(LEAD_FALLBACK.maxNotifications + 1)
  })

  it('keeps the working caps when the limiter answers: the fallback never widens them', async () => {
    fakes.limit.mockImplementation(async (prefix: string) => ({ success: prefix !== 'lead-notify-day' }))
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    expect(fakes.email).not.toHaveBeenCalled()
    expect(fallbackWarnings()).toHaveLength(0)
  })

  it('uses the default caps, and env overrides when they are positive whole numbers', async () => {
    const { LEAD_LIMITS } = await import('@/lib/lead-limits')
    await submit()
    await notificationsSettled()
    expect(fakes.windows.get('lead-site-day')).toEqual({ kind: 'fixed', tokens: LEAD_LIMITS.sitePerDay, window: '1 d' })
    expect(fakes.windows.get('lead-notify-hour')).toEqual({ kind: 'sliding', tokens: LEAD_LIMITS.notifyPerHour, window: '1 h' })
    expect(fakes.windows.get('lead-notify-day')).toEqual({ kind: 'fixed', tokens: LEAD_LIMITS.notifyPerDay, window: '1 d' })

    vi.resetModules(); fakes.windows.clear()
    vi.stubEnv('LEAD_DAILY_CAP', '40')
    vi.stubEnv('LEAD_NOTIFY_HOURLY_CAP', '4')
    vi.stubEnv('LEAD_NOTIFY_DAILY_CAP', 'lots')
    await submit()
    await notificationsSettled()
    expect(fakes.windows.get('lead-site-day')!.tokens).toBe(40)
    expect(fakes.windows.get('lead-notify-hour')!.tokens).toBe(4)
    expect(fakes.windows.get('lead-notify-day')!.tokens).toBe(LEAD_LIMITS.notifyPerDay)
  })
})

describe('notification text', () => {
  it('puts a multi-line message on one line in the email and WhatsApp text, and keeps the original in Mongo and the Sheet', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    const LINE_SEPARATOR = String.fromCharCode(0x2028)
    const message = `Shop board\r\nEnquiry ID: forged\nNOT CONFIRMED: call 9000000000${LINE_SEPARATOR}end`
    expect((await submit({ ...brief, message })).status).toBe(200)
    await notificationsSettled()
    const text = String(fakes.email.mock.calls[0][0].text)
    const lines = text.split('\n')
    expect(lines.filter(line => line.startsWith('Enquiry ID:'))).toEqual([`Enquiry ID: ${brief.submissionId}`])
    expect(lines.filter(line => line.startsWith('NOT CONFIRMED'))).toEqual([])
    expect(lines.find(line => line.startsWith('Message:'))).toBe('Message: Shop board Enquiry ID: forged NOT CONFIRMED: call 9000000000 end')
    expect(text).not.toContain('\r')
    expect(text).not.toContain(LINE_SEPARATOR)
    expect(fakes.insert.mock.calls[0][0].message).toBe(message)
    expect(fakes.sheet.mock.calls[0][0].Message).toBe(message)
  })
})

describe('CAPTCHA', () => {
  it('rejects a token solved on another site when a live secret is configured', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'live-secret')
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response(JSON.stringify({ success: true, hostname: 'evil.example' }))))
    expect((await submit()).status).toBe(400)
    expect(fakes.insert).not.toHaveBeenCalled()
  })

  it('accepts a token solved on the site', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'live-secret')
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response(JSON.stringify({ success: true, hostname: 'www.adjeet.in' }))))
    expect((await submit()).status).toBe(200)
  })

  const answer = (body: Record<string, unknown>) =>
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response(JSON.stringify({ success: true, hostname: 'adjeet.in', ...body }))))

  it('rejects a token solved for another widget action', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'live-secret')
    answer({ action: 'login' })
    expect((await submit()).status).toBe(400)
    expect(fakes.insert).not.toHaveBeenCalled()
  })

  it("accepts a token solved for the 'lead' action", async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'live-secret')
    answer({ action: 'lead' })
    expect((await submit()).status).toBe(200)
  })

  it.each([[undefined], ['']])('accepts a token with no action (%j), as a page cached before the action was set sends', async action => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'live-secret')
    answer({ action })
    expect((await submit()).status).toBe(200)
  })

  it('rejects a token solved on localhost in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'live-secret')
    answer({ hostname: 'localhost' })
    expect((await submit()).status).toBe(400)
    expect(fakes.insert).not.toHaveBeenCalled()
  })
})

describe('deadline', () => {
  it('leaves room for the response and the owner notifications inside the function budget', async () => {
    const { maxDuration } = await import('@/app/api/lead/route')
    const { LEAD_DEADLINES } = await import('@/lib/lead-deadline')
    // After the response: the per-phone cap check, then the notifications in parallel.
    expect(LEAD_DEADLINES.response + LEAD_DEADLINES.limiter + LEAD_DEADLINES.notify + 1000).toBeLessThanOrEqual(maxDuration * 1000)
  })

  it('answers by the response deadline when every provider stalls, keeping the reference', async () => {
    const { POST } = await import('@/app/api/lead/route')
    const { LEAD_DEADLINES } = await import('@/lib/lead-deadline')
    vi.useFakeTimers()
    fakes.insert.mockImplementation(() => new Promise(() => {}))
    fakes.sheet.mockImplementation(() => new Promise(() => {}))
    let settled = false
    const pending = POST(request()).finally(() => { settled = true })
    await vi.advanceTimersByTimeAsync(LEAD_DEADLINES.response)
    expect(settled).toBe(true)
    const response = await pending
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ receiptId: brief.submissionId })
  })

  it('still saves to Sheets before the deadline when Mongo stalls', async () => {
    const { POST } = await import('@/app/api/lead/route')
    const { LEAD_DEADLINES } = await import('@/lib/lead-deadline')
    vi.useFakeTimers()
    fakes.insert.mockImplementation(() => new Promise(() => {}))
    fakes.sheet.mockResolvedValue(saved)
    let settled = false
    const pending = POST(request()).finally(() => { settled = true })
    await vi.advanceTimersByTimeAsync(LEAD_DEADLINES.response)
    expect(settled).toBe(true)
    expect((await pending).status).toBe(200)
  })
})

describe('best time to call', () => {
  const LEGACY_HEADER = ['Date', 'Name', 'Phone', 'City', 'Services', 'Timeline', 'Message', 'Enquiry ID', 'Landing page', 'Source', 'Medium', 'Campaign', 'Status']
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

  /** Run the real Sheets writer against a Sheet whose header is `header`, recording what it is asked to write. */
  function realSheet(header: string[]) {
    const writes: { url: string; method?: string; body?: string }[] = []
    fakes.open.mockImplementation(async (signal?: AbortSignal) =>
      (await vi.importActual<typeof import('@/lib/google-sheets')>('@/lib/google-sheets')).openLeadSheet(signal))
    for (const [name, value] of Object.entries({ GOOGLE_SERVICE_ACCOUNT_EMAIL: 'test@example.test', GOOGLE_PRIVATE_KEY: 'test-key', GOOGLE_SHEET_ID: 'test-sheet' })) {
      vi.stubEnv(name, value)
    }
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = decodeURIComponent(String(input))
      if (url.includes('challenges.cloudflare.com')) return json({ success: true, hostname: 'adjeet.in' })
      writes.push({ url, method: init?.method, body: typeof init?.body === 'string' ? init.body : undefined })
      if (url.includes(':append')) return json({ updates: { updatedRows: 1 } })
      if (url.includes('!1:1')) return json({ values: [header] })
      if (url.includes('?fields=')) return json({ sheets: [{ properties: { title: 'Sheet1', index: 0 } }] })
      return json({ updatedCells: 1 })
    }))
    return {
      headerWrite: () => writes.find(write => write.method === 'PUT'),
      appended: () => JSON.parse(writes.find(write => write.url.includes(':append'))!.body!).values[0] as string[],
    }
  }
  const text = () => String(fakes.email.mock.calls[0][0].text)

  it('lands in the Mongo record, the Sheet row (with its header added) and the owner notification', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    const sheet = realSheet(LEGACY_HEADER)
    const response = await submit({ ...brief, bestTimeToCall: 'evening' })
    expect(response.status).toBe(200)
    expect(fakes.insert.mock.calls[0][0]).toMatchObject({ bestTimeToCall: 'evening' })
    expect(JSON.parse(sheet.headerWrite()!.body!).values).toEqual([['Best time to call']])
    expect(sheet.appended().at(-1)).toBe('Evening')
    expect(logged()).toMatch(/sheets=saved ms=/)
    await notificationsSettled()
    expect(text()).toContain('Best time to call: Evening (a request, not a booked slot)')
  })

  it('leaves no trace when the visitor chose nothing, and the Sheet row is still a complete brief', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    const sheet = realSheet(LEGACY_HEADER)
    const response = await submit()
    expect(response.status).toBe(200)
    const stored = fakes.insert.mock.calls[0][0]
    expect(stored).not.toHaveProperty('bestTimeToCall')
    expect(sheet.headerWrite()).toBeUndefined()
    expect(sheet.appended()).toHaveLength(LEGACY_HEADER.length)
    expect(sheet.appended()).not.toContain('Evening')
    // saved, not partial, and no column reported missing
    expect(logged()).toMatch(/sheets=saved ms=/)
    // The stored brief hashes exactly as it did before the field existed.
    const { createHash } = await import('node:crypto')
    const before = { name: stored.name, phone: stored.phone, city: stored.city, serviceInterest: stored.serviceInterest, timeline: stored.timeline, message: stored.message }
    expect(stored.payloadHash).toBe(createHash('sha256').update(JSON.stringify(before)).digest('hex'))
    await notificationsSettled()
    expect(text()).toContain('Best time to call: (not given)')
  })

  it('still receipts the enquiry when the new column cannot be added to the Sheet', async () => {
    realSheet(LEGACY_HEADER)
    fakes.insert.mockRejectedValue(new Error('database offline'))
    const original = globalThis.fetch
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, init?: RequestInit) =>
      (init?.method === 'PUT' ? json({}, 403) : original(input, init))))
    const response = await submit({ ...brief, bestTimeToCall: 'morning' })
    expect(response.status).toBe(200)
    expect(logged()).toMatch(/sheets=saved\(no column: Best time to call\)/)
  })

  it('treats a change of choice under the same reference as a different brief', async () => {
    await submit({ ...brief, bestTimeToCall: 'evening' })
    const stored = fakes.insert.mock.calls[0][0]
    fakes.insert.mockRejectedValue({ code: 11000 })
    fakes.find.mockResolvedValue(stored)
    expect((await submit({ ...brief, bestTimeToCall: 'evening', cfTurnstileResponse: 'fresh-token' })).status).toBe(200)
    expect((await submit({ ...brief, bestTimeToCall: 'morning' })).status).toBe(409)
    expect((await submit()).status).toBe(409)
  })

  it.each(['night', '', null, 7])('rejects %j before any write', async value => {
    expect((await submit({ ...brief, bestTimeToCall: value })).status).toBe(422)
    expect(fakes.insert).not.toHaveBeenCalled()
    expect(fakes.open).not.toHaveBeenCalled()
  })
})

describe('private data', () => {
  it('keeps names, phone numbers and messages out of the logs on every path', async () => {
    fakes.sheet.mockResolvedValue({ status: 'saved', missing: ['Enquiry ID'] })
    await submit()
    fakes.insert.mockRejectedValue(new Error(`E11000 duplicate key { name: "${brief.name}" }`))
    fakes.sheet.mockResolvedValue(sheetDown)
    await submit()
    await notificationsSettled()
    const text = logged()
    expect(text).toContain(brief.submissionId)
    for (const value of PERSONAL) expect(text).not.toContain(value)
  })

  it('stores only allowlisted source labels', async () => {
    await submit({ ...brief, source: { landingPage: '/contact?phone=9876543210', source: 'Local Buyer', medium: 'organic', campaign: 'x' } })
    expect(fakes.insert.mock.calls[0][0].source).toEqual({ landingPage: '/contact', source: 'unknown', medium: 'organic', campaign: 'unknown' })
  })
})
