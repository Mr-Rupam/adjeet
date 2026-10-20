// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const fakes = vi.hoisted(() => ({
  insert: vi.fn(), find: vi.fn(), open: vi.fn(), sheet: vi.fn(), email: vi.fn(), limit: vi.fn(),
  scheduled: [] as Promise<unknown>[],
}))
vi.mock('@/lib/mongodb', () => ({ default: async () => ({ db: () => ({ collection: () => ({ insertOne: fakes.insert, findOne: fakes.find }) }) }) }))
vi.mock('@/lib/google-sheets', () => ({ openLeadSheet: fakes.open }))
vi.mock('resend', () => ({ Resend: class { emails = { send: fakes.email } } }))
// Each limiter is told apart by its prefix: 'lead' per IP, 'lead-notify' per phone.
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow() { return {} }
    constructor(private readonly config: { prefix: string }) {}
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

const request = (body: unknown = brief) => new NextRequest('https://adjeet.in/api/lead', {
  method: 'POST', headers: { origin: 'https://adjeet.in', 'content-type': 'application/json' },
  body: JSON.stringify(body),
})
async function submit(body: unknown = brief) {
  const { POST } = await import('@/app/api/lead/route')
  return POST(request(body))
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
  vi.stubEnv('NODE_ENV', 'test')
  vi.stubEnv('MONGODB_URI', 'mongodb://example.test/adjeet')
  vi.stubEnv('RESEND_API_KEY', '')
  vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
  vi.stubEnv('KV_REST_API_URL', '')
  vi.stubEnv('KV_REST_API_TOKEN', '')
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
    fakes.limit.mockRejectedValue(new Error('fetch failed https://default:SECRET-TOKEN@example.upstash.io'))
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

  it('still notifies when the cap cannot be checked', async () => {
    fakes.limit.mockImplementation(async (prefix: string) => {
      if (prefix === 'lead-notify') throw new Error('offline')
      return { success: true }
    })
    expect((await submit()).status).toBe(200)
    await notificationsSettled()
    expect(fakes.email).toHaveBeenCalledTimes(1)
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
