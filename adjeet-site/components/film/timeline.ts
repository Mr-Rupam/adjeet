/**
 * The home film's timeline (DESIGN.md, "Home film"): pure functions, no DOM.
 *
 * The page scrolls natively. The scroll distance (in screens) gives a film
 * time (in seconds, `timeAt`), and the film time gives the chapter on screen
 * and its progress p (`frameAt`). The film does not jump to that time: it
 * follows it with `chase`, a critically damped spring with a speed cap and an
 * acceleration limit, so a flick plays as a move of designed speed and a slow
 * drag follows the finger.
 */

/** One stop of the film, as content/home-film.ts filmStops() gives it. */
export type TimelineStop = {
  i: number
  ch: string
  /** The chapter's index. */
  ci: number
  p: number
  gate: boolean
  /** The designed time of the move into this stop, in ms (0 for the first). */
  ms: number
  /** The scroll distance of that move, in screens (0 for the first). */
  dy: number
}
/** A stop with its film time t (seconds) and its scroll distance y (screens). */
export type PlacedStop = TimelineStop & { t: number; y: number }
export type Frame = { ci: number; p: number }
export type Timeline = {
  stops: PlacedStop[]
  /** The film time of the last stop, in seconds. */
  duration: number
  /** The scroll distance of the last stop, in screens. */
  length: number
  timeAt: (y: number) => number
  frameAt: (t: number) => Frame
  /** The first film time that shows chapter ci at progress p. */
  timeOf: (ci: number, p: number) => number
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/**
 * `chapters[ci].dur` is the seconds the chapter's whole timeline (p 0 to 1)
 * takes; it weights the two sides of a move across a chapter boundary.
 */
export function buildTimeline(stops: readonly TimelineStop[], chapters: readonly { dur: number }[]): Timeline {
  let t = 0
  let y = 0
  const S: PlacedStop[] = stops.map((s, k) => {
    if (k > 0) { t += s.ms / 1000; y += s.dy }
    return { ...s, t, y }
  })
  const last = S[S.length - 1]

  const timeAt = (at: number) => {
    if (!(at > 0)) return 0
    if (at >= last.y) return last.t
    let k = 1
    while (k < S.length - 1 && S[k].y < at) k++
    const a = S[k - 1]
    const b = S[k]
    return b.y > a.y ? a.t + ((at - a.y) / (b.y - a.y)) * (b.t - a.t) : b.t
  }

  const frameAt = (at: number): Frame => {
    if (!(at > 0)) return { ci: S[0].ci, p: S[0].p }
    if (at >= last.t) return { ci: last.ci, p: last.p }
    let k = 1
    while (k < S.length - 1 && S[k].t <= at) k++
    const a = S[k - 1]
    const b = S[k]
    if (at <= a.t) return { ci: a.ci, p: a.p }
    const u = (at - a.t) / (b.t - a.t)
    if (u >= 1) return { ci: b.ci, p: b.p }
    if (a.ci === b.ci) return { ci: a.ci, p: a.p + u * (b.p - a.p) }
    // Across chapters: each part takes its share of the move by the chapter's
    // own time (the old chapter to p = 1, any chapter between whole, the new
    // one from p = 0).
    const parts: Array<{ ci: number; from: number; to: number; w: number }> = []
    for (let ci = a.ci; ci <= b.ci; ci++) {
      const from = ci === a.ci ? a.p : 0
      const to = ci === b.ci ? b.p : 1
      parts.push({ ci, from, to, w: (to - from) * (chapters[ci]?.dur || 1) })
    }
    const W = parts.reduce((sum, x) => sum + x.w, 0)
    let at2 = u * W
    for (let n = 0; n < parts.length; n++) {
      const x = parts[n]
      // The end of a part (the flat light at the boundary) belongs to the old chapter.
      if (at2 <= x.w || n === parts.length - 1) {
        return { ci: x.ci, p: clamp(x.w > 0 ? x.from + (at2 / x.w) * (x.to - x.from) : x.to, 0, 1) }
      }
      at2 -= x.w
    }
    return { ci: b.ci, p: b.p }
  }

  /** The first film time that shows chapter ci at progress p (clamped to the film). */
  const timeOf = (ci: number, p: number): number => {
    const key = ci + p
    const ord = (s: PlacedStop) => s.ci + s.p
    if (key <= ord(S[0])) return 0
    if (key >= ord(last)) return last.t
    let k = 1
    while (k < S.length - 1 && ord(S[k]) < key) k++
    const a = S[k - 1]
    const b = S[k]
    if (a.ci === b.ci) return a.t + ((key - ord(a)) / (ord(b) - ord(a))) * (b.t - a.t)
    let before = 0
    let W = 0
    for (let n = a.ci; n <= b.ci; n++) {
      const from = n === a.ci ? a.p : 0
      const to = n === b.ci ? b.p : 1
      const w = (to - from) * (chapters[n]?.dur || 1)
      if (n < ci) before += w
      else if (n === ci) before += clamp(p - from, 0, to - from) * (chapters[n]?.dur || 1)
      W += w
    }
    return W > 0 ? a.t + (before / W) * (b.t - a.t) : a.t
  }

  return { stops: S, duration: last.t, length: last.y, timeAt, frameAt, timeOf }
}

/* ---------- The chase ---------- */

/**
 * The chase's starting values, in one place because they will be tuned.
 * omega: the spring's stiffness (per second), on a touch screen (coarse
 * pointer) and elsewhere. rate: the speed cap near the target, in film
 * seconds per second; the cap grows by `grow` for every film second the
 * target is further than `slack`. accel: the most the speed may grow per
 * second (slowing down is never limited).
 */
export const CHASE = {
  omegaCoarse: 16,
  omegaFine: 10,
  rate: 2.4,
  grow: 2.0,
  slack: 1.5,
  accel: 12,
} as const

export type ChaseOptions = { omega: number; rate: number; grow: number; slack: number; accel: number }
export type ChaseState = { t: number; v: number }

export const chaseOptions = (coarse: boolean): ChaseOptions => ({
  omega: coarse ? CHASE.omegaCoarse : CHASE.omegaFine,
  rate: CHASE.rate,
  grow: CHASE.grow,
  slack: CHASE.slack,
  accel: CHASE.accel,
})

/** Close enough to the target to stand on it exactly. */
const NEAR_T = 0.0015
const NEAR_V = 0.02
const STEP = 1 / 120

/**
 * One frame of the chase: from `state` towards `target` over `dt` seconds
 * (held to 0.1 s), in sub-steps of at most 1/120 s. It never passes the
 * target, and once it is close and slow it returns exactly { t: target, v: 0 }.
 */
export function chase(state: ChaseState, target: number, dt: number, opts: ChaseOptions = chaseOptions(false)): ChaseState {
  let { t, v } = state
  const near = () => Math.abs(target - t) < NEAR_T && Math.abs(v) < NEAR_V
  if (near()) return { t: target, v: 0 }
  dt = clamp(dt, 0, 0.1)
  const n = Math.max(1, Math.ceil(dt / STEP - 1e-9))
  const h = dt / n
  const { omega, rate, grow, slack, accel } = opts
  for (let k = 0; k < n; k++) {
    const d = target - t
    if (d === 0 || near()) return { t: target, v: 0 }
    let w = v + (omega * omega * d - 2 * omega * v) * h
    // Speed gained is held to the acceleration limit (from v, or from 0 when it turns round).
    const base = Math.sign(w) === Math.sign(v) ? Math.abs(v) : 0
    if (Math.abs(w) > base) w = Math.sign(w) * Math.min(Math.abs(w), base + accel * h)
    // The cap; slowing to it is immediate.
    const cap = rate + grow * Math.max(0, Math.abs(d) - slack)
    if (Math.abs(w) > cap) w = Math.sign(w) * cap
    const t2 = t + w * h
    // Never past the target.
    if (d !== 0 && Math.sign(target - t2) !== Math.sign(d)) return { t: target, v: 0 }
    t = t2
    v = w
  }
  return near() ? { t: target, v: 0 } : { t, v }
}
