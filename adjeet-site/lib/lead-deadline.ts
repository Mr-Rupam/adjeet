/**
 * Time budgets for /api/lead, in milliseconds.
 *
 * The route's `maxDuration` is 10 seconds, and work scheduled with `after()`
 * runs inside that same budget. The visitor gets an answer by `response`;
 * after it, the per-phone cap check gets `limiter` and the owner
 * notifications get `notify`, leaving a margin for a cold start. A unit test
 * keeps `response + limiter + notify + 1000` within it.
 */
export const LEAD_DEADLINES = {
  /** From the start of the request to the response the visitor sees. */
  response: 6000,
  limiter: 1000,
  body: 1500,
  captcha: 2000,
  /** Mongo's share. Sheets keeps at least `sheetsReserve` after it to append. */
  mongo: 3000,
  sheetsReserve: 1500,
  /** Each owner notification, after the response. They run in parallel. */
  notify: 1500,
} as const

export class DeadlineError extends Error {
  override name = 'DeadlineError'
  constructor() { super('Stage deadline exceeded') }
}

/** Bound caller latency even when a provider does not honour cancellation. */
export async function bounded<T>(work: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new DeadlineError())
    }, Math.max(1, ms))
  })
  try { return await Promise.race([Promise.resolve().then(() => work(controller.signal)), timeout]) }
  finally { clearTimeout(timer) }
}

/** A fixed end time, so each stage can take at most what is left of the total. */
export function deadlineIn(ms: number) {
  const end = Date.now() + ms
  return {
    /** What is left of the total, capped at `cap`, never less than 1ms. */
    left: (cap = Infinity) => Math.max(1, Math.min(cap, end - Date.now())),
  }
}
