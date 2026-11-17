/**
 * Where the home film rests, and its hard stops (DESIGN.md, "Home film"):
 * pure, no DOM.
 *
 * The browser scrolls the page natively and nothing here ever blocks it. The
 * scroll position is only an input. During a gesture the film follows the
 * scroll, held between the gates on either side of where the film was when
 * the gesture began; when the gesture is over this module picks the stop to
 * rest on, the film goes there, and the engine quietly sets the scroll
 * position to that stop (the screen is pinned, so nothing on screen moves).
 *
 * A gesture is a touch (finger down to the end of its glide), a run of wheel
 * events or key presses, or a scroll nothing explains ("foreign": a scrollbar
 * drag, find in page, Home, End, a link), which has no limits and ends on the
 * nearest stop. A gate is passed only by a gesture that starts once the film
 * has arrived on it. One wheel notch, one key press or one small swipe moves
 * on by at least one stop.
 *
 * Below the last stop the page is an ordinary page: no rebase, no gestures.
 * `run` says when html.film-run (40 more screens of film, film.css) belongs
 * on the page, so a fling that runs on past the film's end stays inside the
 * pinned screen.
 *
 * Whatever goes wrong, the worst case is a film that simply follows the
 * scroll: every public call is guarded.
 */

/** y: the scroll position of the stop, in px; t: its film time, in seconds. */
export type RestStop = { y: number; t: number; gate: boolean }
/** 'foreign': an input whose scroll has no limits (Home, End, a link the page follows). */
export type RestInput = 'touchstart' | 'touchend' | 'wheel' | 'key' | 'foreign'
export type RestOptions = {
  /** A gesture ends after this long with no finger down, no scroll and no input. */
  IDLE_MS: number
  /** A wheel event or key press this long after the last one starts a new gesture. */
  GESTURE_GAP_MS: number
  /** A gesture that travels this far never ends on the stop it started from. */
  MIN_PX: number
  /** Going on, the next stop once this fraction of the way to it; going back, likewise. */
  BIAS: number
  /** A wheel event at least this big is a notch (a mouse wheel, not a trackpad). */
  DISCRETE_PX: number
  /** Below the last stop by this many screens, the page is an ordinary page. */
  PAST: number
  /** The screen's height in px. */
  vh: number
}
export type RestFrame = {
  /** The film time to chase. */
  target: number
  /** A scroll position to set now (scrollTo, instant), or null. */
  rebase: number | null
  /** The stop the film rests on when no gesture is live, else -1. */
  rest: number
  /** Whether html.film-run belongs on the page. */
  run: boolean
}
type Kind = 'touch' | 'wheel' | 'key' | 'foreign'
export type RestGesture = {
  kind: Kind
  /** The stop it started from, and that stop's y (u0). */
  from: number
  u0: number
  /** The scroll position when it started. */
  y0: number
  /** The gates it may not pass, as stop indices. */
  lo: number
  hi: number
  /** The stop it has committed to, or null. */
  commit: number | null
  /** The time of its last input. */
  last: number
  /** A wheel gesture with a notch in it. */
  discrete: boolean
  /** The direction of its last wheel event or key press. */
  dir: number
  /** The direction it last moved in (u), and the furthest u reached that way. */
  mdir: number
  ext: number
  /** Not yet anchored on a frame (see anchor). */
  anchor?: boolean
}
export interface Rest {
  input(kind: RestInput, now: number, delta?: number): void
  scroll(y: number, now: number): void
  frame(y: number, now: number, shownT: number): RestFrame
  setStops(stops: RestStop[], y: number, vh?: number): void
  /** The state, for tests and tools. */
  peek(): { offset: number; gesture: RestGesture | null; restIdx: number; page: boolean }
}

/** The starting values; they will be tuned. */
export const REST = {
  IDLE_MS: 140,
  GESTURE_GAP_MS: 160,
  MIN_PX: 28,
  BIAS: 0.15,
  DISCRETE_PX: 50,
  PAST: 0.3,
} as const

/** A gate counts as reached within this many film seconds. */
const TOL = 0.02
/** An input this recent explains a scroll event. */
const EXPLAINS_MS = 250
/** A gesture has turned round once it has come back this many px. */
const TURN_PX = 6
/** How long the scroll events of the engine's own write are waited for. */
const ECHO_MS = 1000

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

export function createRest(stops: RestStop[], y: number, timeAt: (y: number) => number, opts: Partial<RestOptions> = {}): Rest {
  const o: RestOptions = { ...REST, vh: 800, ...opts }
  let S = stops.slice()
  const L = () => S.length - 1
  const ok = (v: number) => Number.isFinite(v)
  let lastY = ok(y) ? y : 0
  const nearest = (at: number) => {
    let k = 0
    for (let i = 1; i < S.length; i++) if (Math.abs(S[i].y - at) < Math.abs(S[k].y - at)) k = i
    return k
  }
  const past = () => S[L()].y + o.PAST * o.vh

  let offset = 0
  let g: RestGesture | null = null
  let finger = false
  let lastScroll = -Infinity
  let lastInput = -Infinity
  let lastKind: Kind = 'foreign'
  let restIdx = S.length ? nearest(lastY) : 0
  let shown = S.length ? S[restIdx].t : 0
  /** Below the film: an ordinary page. */
  let page = S.length > 0 && lastY > past()
  /** The scroll position the engine was asked to set, whose scroll event is ours. */
  let expect: { y: number; until: number } | null = null
  /** Put the scroll on restIdx's stop at the next frame (start, resize). */
  let fix = !page

  /** The gates either side of film time t (strictly, within TOL); the ends when there is none. */
  const limits = (t: number) => {
    let lo = 0
    let hi = L()
    for (let k = 0; k <= L(); k++) if (S[k].gate && S[k].t < t - TOL) lo = k
    for (let k = L(); k >= 0; k--) if (S[k].gate && S[k].t > t + TOL) hi = k
    return { lo: Math.min(lo, restIdx), hi: Math.max(hi, restIdx) }
  }
  /** Where the film reads the gesture to be, in px. */
  const uOf = (G: RestGesture, at: number) => (G.kind === 'foreign' ? at : clamp(at - offset, S[G.lo].y, S[G.hi].y))

  /** The direction the gesture last moved in, with TURN_PX of hysteresis (a reversal inside one gesture counts). */
  const track = (G: RestGesture, u: number) => {
    if (G.mdir === 0) { if (Math.abs(u - G.u0) > TURN_PX) { G.mdir = Math.sign(u - G.u0); G.ext = u } return }
    if ((u - G.ext) * G.mdir > 0) G.ext = u
    else if (Math.abs(u - G.ext) > TURN_PX) { G.mdir = -G.mdir; G.ext = u }
  }
  /** Rule 4: a notch, a key press or a lifted finger commits to the next stop once it has travelled MIN_PX. */
  const update = (at: number) => {
    if (!g || g.kind === 'foreign') return
    const u = uOf(g, at)
    track(g, u)
    if (g.commit !== null) return
    const can = g.kind === 'key' || (g.kind === 'wheel' && g.discrete) || (g.kind === 'touch' && !finger)
    if (!can) return
    const d = u - g.u0
    // Only while it still goes the way it travelled: a finger that came back does not commit.
    if (Math.abs(d) < o.MIN_PX || (g.mdir !== 0 && Math.sign(d) !== g.mdir)) return
    const k = clamp(g.from + Math.sign(d), g.lo, g.hi)
    if (k !== g.from) g.commit = k
  }

  /** Rule 6: the stop a gesture ends on. */
  const pick = (G: RestGesture, at: number) => {
    if (G.kind === 'foreign') return nearest(at)
    const u = uOf(G, at)
    track(G, u)
    const net = Math.sign(u - G.u0)
    // A gesture that has not moved leaves the film going where it was going.
    if (Math.abs(u - G.u0) < 1) return clamp(G.from, G.lo, G.hi)
    // "Going down" is the way it last moved.
    const dir = G.mdir || net
    let i = 0
    while (i < L() && S[i + 1].y <= u) i++
    let k = i
    if (i < L()) {
      const f = (u - S[i].y) / (S[i + 1].y - S[i].y)
      k = dir >= 0 ? (f >= o.BIAS ? i + 1 : i) : (f <= 1 - o.BIAS ? i : i + 1)
    }
    if (G.commit !== null) k = G.commit > G.from ? Math.max(k, G.commit) : Math.min(k, G.commit)
    if (k === G.from && net === dir && Math.abs(u - G.u0) >= o.MIN_PX) k = G.from + dir
    return clamp(k, G.lo, G.hi)
  }
  /** The scroll position (px) that shows film time t: the inverse of timeAt between stops. */
  const yOfT = (t: number) => {
    if (t <= S[0].t) return S[0].y
    for (let k = 1; k <= L(); k++) {
      if (t <= S[k].t) {
        const a = S[k - 1]
        const b = S[k]
        return b.t > a.t ? a.y + ((t - a.t) / (b.t - a.t)) * (b.y - a.y) : b.y
      }
    }
    return S[L()].y
  }

  /** Rules 1 and 2: a new gesture, after settling the live one logically. */
  const start = (kind: Kind, at: number, now: number) => {
    if (g) restIdx = pick(g, at)
    expect = null
    fix = false
    if (kind === 'foreign') {
      offset = 0
      g = { kind, from: restIdx, u0: S[restIdx].y, y0: at, lo: 0, hi: L(), commit: null, last: now, discrete: false, dir: 0, mdir: 0, ext: 0 }
      return g
    }
    // Coming back from the page below the film: the film reads the scroll as
    // it is and the gesture ends on the last stop, so the visitor sees the
    // film's last scene whole before going back into it.
    const tail = restIdx === L() && at > S[L()].y
    g = { kind, from: restIdx, u0: 0, y0: at, lo: 0, hi: 0, commit: null, last: now, discrete: false, dir: 0, mdir: 0, ext: 0, anchor: !tail }
    if (tail) { g.lo = g.hi = L(); g.u0 = g.ext = S[L()].y; offset = 0 } else anchor(g)
    return g
  }
  /**
   * The gesture starts from the frame the film shows (on a stop at rest; between
   * two during a move), so a gesture against a move in flight turns the film
   * where it is instead of first finishing the move. Its limits are the gates
   * either side of that frame. Done again at the gesture's first frame, with
   * the frame being drawn (an input can come long after the last frame on a
   * busy machine).
   */
  const anchor = (G: RestGesture) => {
    const { lo, hi } = limits(shown)
    G.lo = lo
    G.hi = hi
    G.u0 = G.ext = clamp(yOfT(shown), S[lo].y, S[hi].y)
    offset = G.y0 - G.u0
  }

  /** Rules 6 to 8: the gesture is over. Returns the rebase, or null. */
  const end = (at: number, now: number): number | null => {
    const G = g!
    g = null
    const last = L()
    const below = at > S[last].y + 1
    const leaves = G.kind === 'foreign'
      ? at > past()
      : G.from === last && at > G.y0 && at - S[last].y >= o.MIN_PX
    if (below && leaves) {
      page = true
      restIdx = last
      offset = 0
      return null
    }
    restIdx = pick(G, at)
    offset = 0
    return place(at, now)
  }
  /** The rebase that puts the scroll on restIdx's stop, if it is not there. */
  const place = (at: number, now: number): number | null => {
    const want = S[restIdx].y
    if (Math.abs(at - want) <= 1) return null
    expect = { y: want, until: now + ECHO_MS }
    lastY = want
    return want
  }

  /** Rule 8: entering the ordinary page below the film. */
  const enterPage = (at: number) => {
    if (page || at <= past()) return
    if (g ? g.kind === 'foreign' || g.from === L() : restIdx === L()) {
      page = true
      g = null
      restIdx = L()
      offset = 0
      expect = null
    }
  }

  const follow = (at: number) => {
    if (page) return S[L()].t
    if (!g) return S[restIdx].t
    if (g.kind === 'foreign') return timeAt(at)
    let t = timeAt(uOf(g, at))
    if (g.commit !== null) t = g.commit > g.from ? Math.max(t, S[g.commit].t) : Math.min(t, S[g.commit].t)
    return t
  }

  const api: Rest = {
    input(kind, now, delta = 0) {
      try {
        if (!S.length) return
        lastInput = now
        if (kind === 'touchstart') {
          finger = true
          lastKind = 'touch'
          if (!page) start('touch', lastY, now)
          return
        }
        if (kind === 'touchend') {
          finger = false
          if (g && g.kind === 'touch') { g.last = now; update(lastY) }
          return
        }
        lastKind = kind
        if (page) return
        if (kind === 'foreign') { start('foreign', lastY, now); return }
        const dir = Math.sign(delta)
        if (!g || g.kind !== kind || now - g.last > o.GESTURE_GAP_MS || (dir !== 0 && g.dir !== 0 && dir !== g.dir)) start(kind, lastY, now)
        const G = g!
        G.last = now
        if (dir) G.dir = dir
        if (kind === 'wheel' && Math.abs(delta) >= o.DISCRETE_PX) G.discrete = true
        update(lastY)
      } catch { /* never block: the film follows the scroll */ }
    },

    scroll(at, now) {
      try {
        if (!S.length || !ok(at)) return
        // The scroll events of the engine's own write are ours: the one that lands on it,
        // and (a smooth write) those heading for it. One moving away from it is not:
        // it is the tail of the last gesture's own scroll, or a new scroll.
        let tail = false
        if (expect) {
          if (Math.abs(at - expect.y) <= 1) { expect = null; lastY = at; return }
          const toward = Math.abs(at - expect.y) < Math.abs(lastY - expect.y)
          if (toward && now < expect.until) { lastY = at; return }
          tail = now < expect.until
          expect = null
        }
        const up = at < lastY - 0.5
        if (Math.abs(at - lastY) < 0.5) return
        const streaming = now - lastScroll <= o.IDLE_MS
        lastY = at
        lastScroll = now
        if (page) {
          // Coming back up to within PAST of the last stop, the film takes over;
          // a stream already under way (a glide too) carries on as a gesture of its kind.
          if (up && at <= past()) {
            page = false
            restIdx = L()
            offset = 0
            start(finger || streaming || now - lastInput <= EXPLAINS_MS ? lastKind : 'foreign', at, now)
          }
          return
        }
        if (!g) start(finger || tail || now - lastInput <= EXPLAINS_MS ? lastKind : 'foreign', at, now)
        else update(at)
      } catch { /* never block */ }
    },

    frame(at, now, shownT) {
      try {
        if (!S.length) return { target: timeAt(at), rebase: null, rest: -1, run: false }
        if (!ok(at)) at = lastY
        lastY = at
        if (ok(shownT)) shown = shownT
        enterPage(at)
        let rebase: number | null = null
        if (g) {
          if (g.anchor) {
            // A commit (a stop) stays; the direction is read again from the new anchor.
            g.anchor = false
            anchor(g)
            g.mdir = 0
            if (g.commit !== null) g.commit = clamp(g.commit, g.lo, g.hi) === g.from ? null : clamp(g.commit, g.lo, g.hi)
          }
          update(at)
          if (!finger && now - Math.max(lastScroll, g.last) >= o.IDLE_MS) rebase = end(at, now)
        } else if (!page && !expect && Math.abs(at - S[restIdx].y) > 1 && (fix || now - lastScroll >= o.IDLE_MS)) {
          // At start, after a resize, and whenever the page has been left off the
          // rest stop with no gesture to explain it: put it back on the stop.
          fix = false
          rebase = place(at, now)
        }
        const target = follow(rebase ?? at)
        // Not resting while the scroll is off the stop (the engine's loop keeps running until it is on it).
        const off = !g && !page && Math.abs((rebase ?? at) - S[restIdx].y) > 1
        return { target, rebase, rest: g || off ? -1 : restIdx, run: !page && (restIdx < L() || (!!g && g.from < L())) }
      } catch {
        return { target: timeAt(at), rebase: null, rest: -1, run: false }
      }
    },

    setStops(next, at, vh) {
      try {
        if (g && S.length) restIdx = pick(g, at)
        g = null
        S = next.slice()
        if (vh && vh > 0) o.vh = vh
        restIdx = clamp(restIdx, 0, Math.max(0, L()))
        offset = 0
        expect = null
        if (ok(at)) lastY = at
        fix = !page && S.length > 0
      } catch { /* never block */ }
    },

    peek: () => ({ offset, gesture: g ? { ...g } : null, restIdx, page }),
  }
  return api
}
