import { limiterKey } from '@/lib/client-ip'
import { bounded, LEAD_DEADLINES } from '@/lib/lead-deadline'

/**
 * Volume limits for /api/lead, counted in Upstash.
 *
 * Two different rules apply:
 *
 * - Storing an enquiry fails OPEN. The per-visitor limit refuses a visitor who
 *   positively went over it, but when the limiter is missing, errors or is slow
 *   the enquiry is still stored. A lost enquiry costs more than some extra spam,
 *   Turnstile still gates every submission, and the receipt contract in the
 *   route promises an answer only once a store acknowledges the brief.
 * - Owner notifications (email through Resend, WhatsApp through Twilio) cost
 *   money and can flood the owner, so they are capped. Past any cap below the
 *   enquiry stays stored and receipted and only the notification is skipped;
 *   the register and the Sheet still hold it. When the caps cannot be counted
 *   (Upstash missing, erroring or slow), a real enquiry the owner never hears
 *   about costs more than a bounded burst, so notifications still go out,
 *   bounded per server instance by `LEAD_FALLBACK`.
 *
 * Every key is an HMAC digest (`limiterKey`), so Redis never holds a visitor's
 * address or phone number.
 */
export const LEAD_LIMITS = {
  /** Enquiries one visitor (IPv4 address or IPv6 /64) may send in an hour. */
  perVisitorPerHour: 5,
  /**
   * Enquiries per hour across every request that carries no client address.
   * Vercel always sets one, so this bucket should stay empty. It is wider than
   * a visitor's share so one sender cannot lock out everyone in it.
   */
  noAddressPerHour: 30,
  /** Owner notifications per phone number per day, so no one number is called over and over. */
  perPhonePerDay: 3,
  /** Enquiries across the whole site per UTC day before notifications stop. LEAD_DAILY_CAP overrides. */
  sitePerDay: 300,
  /** Owner notifications per hour, whatever the phone number. LEAD_NOTIFY_HOURLY_CAP overrides. */
  notifyPerHour: 20,
  /** Owner notifications per UTC day, whatever the phone number. LEAD_NOTIFY_DAILY_CAP overrides. */
  notifyPerDay: 60,
} as const

/**
 * The bound on owner notifications while Upstash cannot answer. It is counted
 * in memory, so each running server instance (a warm Vercel function) has its
 * own: a burst across several instances can reach a few times this, and a new
 * instance starts at zero. It applies only when the limiter fails; when it
 * answers, `LEAD_LIMITS` decides alone.
 */
export const LEAD_FALLBACK = {
  /** Notifications one instance may send in any `windowMs`. */
  maxNotifications: 6,
  /** Ten minutes. */
  windowMs: 10 * 60 * 1000,
} as const

/** When this instance sent each fallback notification still inside the window. */
const fallbackSent: number[] = []
let warnedFallback = false

/** Take one fallback notification slot if the window has one free. */
function takeFallbackSlot(now = Date.now()): boolean {
  while (fallbackSent.length && fallbackSent[0] <= now - LEAD_FALLBACK.windowMs) fallbackSent.shift()
  if (fallbackSent.length >= LEAD_FALLBACK.maxNotifications) return false
  fallbackSent.push(now)
  return true
}

/** `value` when it is a positive whole number, otherwise `fallback`. */
export function capFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return value && Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

type Limiter = { limit: (key: string) => Promise<{ success: boolean }> }
type Limiters = {
  perVisitor: Limiter
  noAddress: Limiter
  perPhone: Limiter
  siteDay: Limiter
  notifyHour: Limiter
  notifyDay: Limiter
}

let limiters: Limiters | null = null
let warnedNoLimiter = false
let warnedNoAddress = false

/** A loggable error category: a class name or code, never a message, which can carry personal data or secrets. */
export function category(error: unknown): string {
  if (error && typeof error === 'object') {
    const { name, code } = error as { name?: unknown; code?: unknown }
    if (typeof name === 'string' && name !== 'Error') return name
    if (typeof code === 'string' || typeof code === 'number') return `code-${code}`
  }
  return 'error'
}

async function getLimiters(): Promise<Limiters | null> {
  if (limiters) return limiters
  // The Upstash integration from the Vercel Marketplace names these KV_REST_API_*.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    if (!warnedNoLimiter) console.warn('[lead] Upstash env vars missing: enquiries are stored without rate limits')
    warnedNoLimiter = true
    return null
  }
  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({ url, token, retry: false, signal: () => AbortSignal.timeout(LEAD_DEADLINES.limiter) })
  // `timeout: 0` turns off the library's own slow-Redis fallback, which answers
  // "allowed"; the bound around each check decides instead.
  const make = (prefix: string, limiter: ReturnType<typeof Ratelimit.slidingWindow>) =>
    new Ratelimit({ redis, limiter, analytics: false, prefix, timeout: 0 })
  // A fixed window of one day starts at 00:00 UTC.
  limiters = {
    perVisitor: make('lead', Ratelimit.slidingWindow(LEAD_LIMITS.perVisitorPerHour, '1 h')),
    noAddress: make('lead-noip', Ratelimit.slidingWindow(LEAD_LIMITS.noAddressPerHour, '1 h')),
    perPhone: make('lead-notify', Ratelimit.slidingWindow(LEAD_LIMITS.perPhonePerDay, '1 d')),
    siteDay: make('lead-site-day', Ratelimit.fixedWindow(capFromEnv(process.env.LEAD_DAILY_CAP, LEAD_LIMITS.sitePerDay), '1 d')),
    notifyHour: make('lead-notify-hour', Ratelimit.slidingWindow(capFromEnv(process.env.LEAD_NOTIFY_HOURLY_CAP, LEAD_LIMITS.notifyPerHour), '1 h')),
    notifyDay: make('lead-notify-day', Ratelimit.fixedWindow(capFromEnv(process.env.LEAD_NOTIFY_DAILY_CAP, LEAD_LIMITS.notifyPerDay), '1 d')),
  }
  return limiters
}

/**
 * May this visitor send an enquiry? `visitor` is the key from `rateKey` in
 * lib/client-ip.ts, or null when the request carried no address. True unless
 * the limiter positively says no: errors and timeouts allow, with a warning.
 */
export async function admitVisitor(visitor: string | null, ms: number): Promise<boolean> {
  if (!visitor && !warnedNoAddress) {
    console.warn('[lead] A request carried no client address; counting such requests in their own bucket')
    warnedNoAddress = true
  }
  try {
    return await bounded(async () => {
      const configured = await getLimiters()
      if (!configured) return true
      const verdict = visitor
        ? await configured.perVisitor.limit(limiterKey(visitor))
        : await configured.noAddress.limit('no-address')
      return verdict.success
    }, ms)
  } catch (error) {
    console.warn(`[lead] Per-visitor rate limiter unavailable, allowing: ${category(error)}`)
    return true
  }
}

export type NotifyVerdict =
  | { send: true }
  | { send: false; reason: 'phone-cap' | 'site-daily-cap' | 'notify-hourly-cap' | 'notify-daily-cap' | 'fallback-cap' }

/** The limiter could not answer: send under the in-process bound. */
function degraded(cause: string): NotifyVerdict {
  if (!warnedFallback) {
    console.warn(`[lead] Notification limiter unavailable (${cause}): owner notifications continue under the in-process fallback of ${LEAD_FALLBACK.maxNotifications} per ${LEAD_FALLBACK.windowMs / 60_000} minutes on this instance`)
    warnedFallback = true
  }
  return takeFallbackSlot() ? { send: true } : { send: false, reason: 'fallback-cap' }
}

/**
 * May the owner be notified about this enquiry? Counts the enquiry against the
 * site's daily total and the phone number's share, then the notification
 * against the hourly and daily totals. A clear no from the limiter is a no;
 * no answer at all falls back to `LEAD_FALLBACK`.
 */
export async function admitNotification(phone: string): Promise<NotifyVerdict> {
  let verdict: NotifyVerdict | 'unconfigured'
  try {
    verdict = await bounded<NotifyVerdict | 'unconfigured'>(async () => {
      const configured = await getLimiters()
      if (!configured) return 'unconfigured'
      const phoneKey = limiterKey(`phone:${phone}`)
      const [site, perPhone] = await Promise.all([configured.siteDay.limit('all-enquiries'), configured.perPhone.limit(phoneKey)])
      if (!site.success) return { send: false, reason: 'site-daily-cap' }
      if (!perPhone.success) return { send: false, reason: 'phone-cap' }
      const [hour, day] = await Promise.all([configured.notifyHour.limit('all-notifications'), configured.notifyDay.limit('all-notifications')])
      if (!hour.success) return { send: false, reason: 'notify-hourly-cap' }
      if (!day.success) return { send: false, reason: 'notify-daily-cap' }
      return { send: true }
    }, LEAD_DEADLINES.limiter)
  } catch (error) {
    return degraded(category(error))
  }
  return verdict === 'unconfigured' ? degraded('unconfigured') : verdict
}
