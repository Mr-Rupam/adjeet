import { limiterKey } from '@/lib/client-ip'
import { bounded } from '@/lib/lead-deadline'

/**
 * Cost control for /api/chatbot, which spends money on every reply.
 *
 * Two Upstash limits apply to each request: a share per visitor (by client
 * key, so an IPv6 visitor counts by /64) and a budget for the whole site per
 * UTC day, so a crowd of addresses cannot run the bill up either.
 *
 * Unlike the enquiry form, this fails CLOSED. When the limiter is not
 * configured, errors or is slow, the chat is declined: a lost chat costs
 * nothing because the visitor still has WhatsApp, while a chat that cannot be
 * counted could cost without limit.
 */
export const CHATBOT_LIMITS = {
  /** Requests one visitor may make in an hour. */
  perVisitorPerHour: 20,
  /**
   * Requests across all visitors in one UTC day unless CHATBOT_DAILY_BUDGET
   * says otherwise. One sender can spend it and switch the chat off for the
   * day, which is acceptable because the fallback is WhatsApp.
   */
  dailyBudget: 200,
} as const

export const CHATBOT_DEADLINES = {
  /** The whole check, including loading the Upstash client on a cold start. */
  limiter: 2500,
  /** Each Redis command inside it. */
  redis: 1800,
  /** The request body. */
  body: 1500,
  /** The OpenAI call, inside the route's 30 second maxDuration. */
  openai: 20_000,
} as const

export type ChatAllowance = 'allowed' | 'visitor-limit' | 'daily-budget' | 'unavailable'

type Limiter = { limit: (key: string) => Promise<{ success: boolean }> }
type Limiters = { perVisitor: Limiter; daily: Limiter }

let limiters: Limiters | null = null

/** CHATBOT_DAILY_BUDGET when it is a positive whole number, otherwise the default. */
export function dailyBudget(env: string | undefined = process.env.CHATBOT_DAILY_BUDGET): number {
  const value = Number(env)
  return Number.isInteger(value) && value > 0 ? value : CHATBOT_LIMITS.dailyBudget
}

async function getLimiters(): Promise<Limiters | null> {
  if (limiters) return limiters
  // The Upstash integration from the Vercel Marketplace names these KV_REST_API_*.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({ url, token, retry: false, signal: () => AbortSignal.timeout(CHATBOT_DEADLINES.redis) })
  // `timeout: 0` turns off the library's own fallback, which answers
  // "allowed" when Redis is slow. The bound around the check decides instead.
  limiters = {
    perVisitor: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(CHATBOT_LIMITS.perVisitorPerHour, '1 h'), analytics: false, prefix: 'chatbot', timeout: 0 }),
    // A fixed window of one day starts at 00:00 UTC.
    daily: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(dailyBudget(), '1 d'), analytics: false, prefix: 'chatbot-day', timeout: 0 }),
  }
  return limiters
}

/** A loggable error category: a class name, never a message, which can carry secrets. */
function category(error: unknown): string {
  return error instanceof Error && error.name !== 'Error' ? error.name : 'error'
}

/**
 * Count this request against the visitor's share and the day's budget.
 * Anything but a clear yes is a no.
 */
export async function checkChatAllowance(visitorKey: string): Promise<ChatAllowance> {
  try {
    return await bounded<ChatAllowance>(async () => {
      const configured = await getLimiters()
      if (!configured) {
        console.error('[chatbot] Upstash is not configured, so the chat is switched off')
        return 'unavailable'
      }
      // Redis keeps a hash of the visitor key, never the address.
      if (!(await configured.perVisitor.limit(limiterKey(visitorKey))).success) return 'visitor-limit'
      if (!(await configured.daily.limit('all-visitors')).success) return 'daily-budget'
      return 'allowed'
    }, CHATBOT_DEADLINES.limiter)
  } catch (error) {
    console.error(`[chatbot] Rate limiter unavailable, declining the chat: ${category(error)}`)
    return 'unavailable'
  }
}

/** Forget the cached clients. For tests. */
export function resetChatbotGuard() {
  limiters = null
}
