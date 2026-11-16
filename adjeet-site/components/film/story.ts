/**
 * The home film's engine (DESIGN.md, "Home film"), ported from the storyboard
 * prototype's engine/story.js. It switches beats (`.on` once a chapter's
 * progress passes an element's `--at`), loads and decodes the pictures ahead,
 * fits the visitor's name to every board, and writes the current chapter and
 * its tone on <html> for the header, the rail and the dock.
 *
 * The stepper (stepper-contract.md) is its input layer: a gesture is an
 * intent, never a distance. One swipe, one wheel gesture or one key press
 * moves the film to the next stop (a chapter's `data-stops`); input during a
 * move is ignored, and the film rests only on stops.
 *
 * The player. A move does not scroll the page. Each chapter's keyframes are
 * paused one-second animations (`drv-play`); a move from stop a to stop b over
 * T ms sets every animation's time to a, its rate to (b - a) / T and plays it,
 * so transforms and opacity run on the compositor with no script per frame.
 * Beats fire from timers at their place in the move, each once. The page
 * scroll is the source of truth between moves: at the end of a move (and at
 * the flat light where one chapter hands over to the next) the page jumps to
 * the stop's place, so anchors, the rail, restored positions and the native
 * scroll after the film work as before. Only the playing chapters' stages are
 * rendered.
 *
 * Before the engine starts, and with no stepper, the native scroll timelines
 * (or the requestAnimationFrame driver) drive the same keyframes.
 *
 * `startStory` returns its teardown: every listener and timer removed and
 * everything it set on <html> taken off, so leaving the page and coming back
 * starts clean.
 */

import { DEFAULT_SHOP_NAME, SHOP_NAME_MAX } from '@/content/shop-name'

/** Classes and attributes the film sets on <html>. */
export const FILM_ROOT_CLASSES = ['story', 'drv-native', 'drv-js', 'drv-play', 'stepper', 'step-end', 'settled', 'has-cta'] as const
export const FILM_ROOT_ATTRIBUTES = ['data-film-ch', 'data-film-tone', 'data-film-moving'] as const
/** Session storage only: the name never leaves the device. */
export const NAME_KEY = 'adj-name'
/** Elements whose own scrolling the stepper leaves alone. */
const NATIVE = '[role="dialog"], .chatbot-window, [data-native-scroll]'

export type StopStory = () => void

type Beat = { b: HTMLElement; at: number; off: number; on: boolean; cta: boolean; pl: boolean }
type Stack = HTMLElement & { t?: number }
type Stop = { p: number; ms: number }
type Chapter = {
  el: HTMLElement; id: string; i: number; st: HTMLElement; rest: number; dur: number; stops: Stop[]; beats: Beat[]
  marks: number[]; top: number; pin: number; H: number; ld?: boolean; was?: boolean; near?: boolean; ok?: boolean
  im?: HTMLImageElement[]; an?: Animation[] | null
}
/** A rest in page pixels, its chapter and p; ms: a showpiece's own duration for the move into it. */
type Rest = { y: number; ms: number; c: Chapter; p: number }
/** One chapter's part of a move: p from a to b over ms. */
type Seg = { c: Chapter; a: number; b: number; ms: number }

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
/** An ordinary move takes 0.8 to 1.6 s (a showpiece sets its own). */
const MOVE_MIN = 800
const MOVE_MAX = 1600

export function startStory(film: HTMLElement): StopStory {
  const d = document
  const h = d.documentElement
  const all = <T extends Element = HTMLElement>(s: string, e: ParentNode = film) => [...e.querySelectorAll<T>(s)]
  const story = h.classList.contains('story')
  const js = h.classList.contains('drv-js')
  // The stepper and the player run with the film; reduced motion and still mode have neither.
  const on = story
  const touch = matchMedia('(pointer: coarse)').matches
  // Beats are written inline, so they are read from the style attribute: no style recalculation.
  const num = (e: HTMLElement, k: string) => parseFloat(e.style.getPropertyValue(k))
  const C: Chapter[] = all('.ch').map((el, i) => {
    const st = el.querySelector<HTMLElement>('.stage')!
    const beats = all('[style*="--at"]', el).map(b => ({
      b, at: num(b, '--at') || 0, off: num(b, '--off') || 9, on: false, cta: !!b.querySelector('.cta'), pl: b.classList.contains('planes'),
    }))
    // Every p where something changes on screen besides the keyframes: beats, tones, .settled.
    const marks = [...new Set([0.06, ...beats.flatMap(t => [t.at, t.off]), ...(st.dataset.toneAt || '').split(' ').filter(Boolean).map(Number)])]
      .filter(x => x > 0 && x <= 1)
    return {
      el, id: el.id, i, st, beats, marks,
      rest: parseFloat(el.dataset.rest ?? ''),
      dur: (parseFloat(el.dataset.dur ?? '') || 4) * 1000,
      // "0.14 0.78:3500": a stop's p, and a showpiece's duration.
      stops: (el.dataset.stops || '').split(' ').filter(Boolean).map(s => { const [p, ms] = s.split(':'); return { p: +p, ms: +ms || 0 } }),
      top: 0, pin: 1, H: 1,
    }
  })
  const rail = all<HTMLAnchorElement>('.rail a')
  let raf = 0
  let cur: Chapter | null | undefined
  let idle = false
  let tok = 0
  let idleId = 0
  let R: Rest[] = []
  const timers = new Set<number>()
  const later = (f: () => void, ms: number) => { const t = window.setTimeout(() => { timers.delete(t); f() }, ms); timers.add(t) }

  /* Depth planes: fetched only in the film, never with Save-Data or on a
     touch screen (for now: a phone's frames go to the scenes); the hero's only
     once the page has loaded and gone idle. .ready once all decoded. */
  const WIDE = matchMedia('(min-width: 1024px) and (min-aspect-ratio: 5/4)')
  const save = !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  const planes = (c?: Chapter) => {
    // Never under the requestAnimationFrame driver: there the planes cost more
    // frames than they add depth, so the flat plate does every move.
    if (!story || js || touch || save || !c || (c === C[0] && !idle)) return
    for (const s of all<Stack>('.planes', c.el)) {
      if (s.t) continue
      const k = WIDE.matches ? 'srcw' : 'src'
      const n = h.dataset.theme === 'dark'
      const t = (s.t = ++tok)
      const imgs = all<HTMLImageElement>('.pl', s)
      for (const i of imgs) i.src = (n && i.dataset[k + 'N']) || i.dataset[k] || ''
      Promise.all(imgs.map(i => i.decode())).then(() => { if (s.t === t) { s.classList.add('ready'); c.an = null } }, () => {})
    }
  }
  const reset = () => {
    for (const s of all<Stack>('.planes')) { s.t = 0; s.classList.remove('ready') }
    for (const c of C) { c.an = null; if (c.ld) planes(c) }
  }

  /* A stop's place on the page: a pixel past the exact frame, so a beat that
     starts on the stop is on (the hero's stop is the top of the page). */
  const at = (c: Chapter, p: number) => (c === C[0] && p === 0 ? 0 : Math.ceil(c.top + c.pin * p) + 1)
  const measure = () => {
    const y = scrollY
    for (const c of C) {
      c.top = c.el.getBoundingClientRect().top + y
      // Every stage is one screen; a chapter the browser is skipping
      // (content-visibility) reports no layout inside it, so the first
      // chapter's stage gives the height for all.
      c.H = C[0].st.offsetHeight
      c.pin = Math.max(1, c.el.offsetHeight - c.H)
    }
    R = []
    for (const c of C) for (const s of c.stops) R.push({ y: at(c, s.p), ms: s.ms, c, p: s.p })
    R.sort((a, b) => a.y - b.y)
    frame()
  }
  // Pictures are fetched and decoded ahead. .ok: decoded, or 4 s passed; a
  // move into a chapter waits for it (the stepper's gate).
  const load = (c?: Chapter) => {
    // Nothing after the hero starts loading before the page has: the hero's
    // picture keeps the network to itself (the load event measures again).
    if (!c || c.ld || (c !== C[0] && d.readyState !== 'complete')) return
    c.ld = true
    c.el.classList.add('ld')
    // Only pictures that are laid out: the other theme's or size's copy stays unfetched.
    const im = (c.im = all<HTMLImageElement>('img[loading=lazy]:not([data-keep-lazy]):not(.pl)', c.el).filter(i => i.getClientRects().length))
    for (const i of im) i.loading = 'eager'
    // The lit plate the hills' and the junction's lamps paint as a background:
    // decoded with the pictures, so a move never waits on it mid-frame.
    const lit = c.st.style.getPropertyValue(WIDE.matches ? '--lit-w' : '--lit-t').match(/url\("?([^")]+)/)?.[1]
    if (lit) { const i = new Image(); i.src = lit; im.push(i) }
    planes(c)
    Promise.race([Promise.all(im.map(i => i.decode().catch(() => undefined))), new Promise(r => setTimeout(r, 4000))])
      .then(() => { c.ok = true })
  }

  /* Beats: on from --at until --off. */
  const beats = (c: Chapter, pr: number) => {
    let changed = false
    for (const t of c.beats) {
      const on = story ? pr >= t.at && pr < t.off : true
      if (on !== t.on) {
        t.on = on
        changed = true
        // A stack that is not ready when its move begins sits this pass out.
        if (on && t.pl) t.b.classList.toggle('late', !t.b.classList.contains('ready'))
        t.b.classList.toggle('on', on)
      }
    }
    return changed
  }

  /* The chapter's CSS animations (only on a chapter that is near: film.css),
     each set to the frame for progress p and paused. */
  const anims = (c: Chapter) => {
    // A chapter the browser is still skipping (content-visibility) has none
    // yet, so an empty list is never kept.
    // Only the film's keyframes (.cam, .tl, .pl): a loading shimmer, a light's
    // own loop or the Malda days that run on by themselves keep their time.
    if (!c.an?.length) {
      c.an = c.el.getAnimations({ subtree: true }).filter(a => 'animationName' in a && !(a.effect as KeyframeEffect | null)?.pseudoElement
        && !!((a.effect as KeyframeEffect | null)?.target as Element | null)?.matches?.('.cam, .tl, .pl'))
    }
    return c.an
  }
  const seat = (c: Chapter, p: number) => {
    if (!h.classList.contains('drv-play')) return
    for (const a of anims(c)) { a.pause(); a.currentTime = clamp(p, 0, 1) * 1000 }
  }

  /* Root attributes are written only when they change. */
  const set = (k: string, v: string) => { if (h.getAttribute(k) !== v) h.setAttribute(k, v) }
  const last = () => (R.length ? R[R.length - 1].y : 0)
  /** The header's, the rail's and the dock's view of the film: chapter c at progress pr. */
  const mark = (now: Chapter | null, pr: number) => {
    let tone: string | undefined
    if (now) {
      const s = now.st.dataset
      tone = s.tone
      const marks = (s.toneAt || '').split(' ')
      const late = (s.toneLate || '').split(' ')
      marks.forEach((a, i) => { if (a && pr >= +a) tone = late[i] })
    }
    set('data-film-ch', now ? now.id : 'after')
    set('data-film-tone', tone || 'page')
    // .settled: past the first moments of a chapter (its light handoff);
    // .has-cta: a gold action of the chapter's own is showing.
    h.classList.toggle('settled', !now || pr >= 0.06)
    h.classList.toggle('has-cta', !!now && now.beats.some(t => t.on && t.cta))
    if (now !== cur) {
      cur = now
      for (const a of rail) a.toggleAttribute('aria-current', !!now && a.hash === '#' + now.id)
    }
  }

  /* Live: the chapters whose stages are rendered (film.css). At rest, the one
     on screen; during a move, the ones it plays. */
  const live = (ks: Chapter[]) => { for (const c of C) c.el.classList.toggle('live', ks.includes(c)) }

  const frame = () => {
    raf = 0
    const y = scrollY
    let now: Chapter | null = null
    for (let i = 0; i < C.length; i++) {
      const c = C[i]
      const r = y - c.top
      const pr = r / c.pin
      const p = Math.min(1, Math.max(0, pr))
      if (r >= 0) now = c
      const near = r > -2 * c.H && r < c.pin + c.H
      c.el.classList.toggle('pin', story ? r >= 0 && r < c.pin + c.H : true)
      // Scroll-bound animations exist only on chapters near the screen (film.css);
      // under the player a chapter that comes near is seated on its frame.
      if (near !== c.near) {
        c.near = near
        c.el.classList.toggle('near', near)
        c.an = null
        if (near && !moving) requestAnimationFrame(() => { if (!moving) seat(c, (scrollY - c.top) / c.pin) })
      }
      if (!near && !c.was) continue
      c.was = near
      if (story && js && !h.classList.contains('drv-play')) c.el.style.setProperty('--p', p.toFixed(4))
      if (near) { load(c); if (r >= 0) { load(C[i + 1]); load(C[i + 2]) } }
      if (!moving) beats(c, pr)
    }
    const end = C[C.length - 1]
    if (now === end && y - end.top > end.pin + end.H * 0.5) now = null
    if (!moving) {
      mark(now, now ? (y - now.top) / now.pin : 1)
      if (h.classList.contains('drv-play')) live(now ? [now] : [])
    }
    if (on) h.classList.toggle('step-end', y >= last() - 2)
  }
  const tick = () => { if (!raf) raf = requestAnimationFrame(frame) }

  /* ---------- The player ---------- */
  let moving = false
  let ended = 0 // when the last move ended
  let past = false // the page went below the last stop
  let settleT = 0
  const jump = (y: number) => { past = false; scrollTo({ top: y, behavior: 'instant' }) }
  const nearest = (y: number) => R.reduce((a, b) => (Math.abs(b.y - y) < Math.abs(a.y - y) ? b : a), R[0])
  // The page is in the stepper's hands up to the last stop.
  const inFilm = (y: number) => y <= last() + 2
  /** The chapter on top at a scroll position, and its progress. */
  const where = (y: number) => {
    let c = C[0]
    for (const k of C) if (k.top <= y + 0.5) c = k
    return { c, p: clamp((y - c.top) / c.pin, 0, 1) }
  }

  /** Plays one chapter from a to b over ms; calls done at the end. */
  const play = (s: Seg, done: () => void) => {
    const { c, a, b, ms } = s
    if (!c.near) { c.near = true; c.el.classList.add('near'); c.an = null }
    const list = anims(c)
    const rate = ((b - a) * 1000) / ms
    // .rev: the chapter plays backwards (film.css: the hills' lights go out together).
    c.el.classList.toggle('rev', b < a)
    for (const x of list) { x.pause(); x.currentTime = a * 1000; x.playbackRate = rate; x.play() }
    // Every mark crossed fires once, at its place in the move, in order.
    const fwd = b > a
    for (const m of c.marks) {
      if (fwd ? !(m > a && m <= b) : !(m > b && m <= a)) continue
      const after = fwd ? m : m - 1e-4
      later(() => { beats(c, after); mark(c, after) }, (Math.abs(m - a) / Math.abs(b - a)) * ms)
    }
    later(() => {
      for (const x of list) { x.pause(); x.currentTime = b * 1000; x.playbackRate = 1 }
      c.el.classList.remove('rev')
      beats(c, b)
      done()
    }, ms)
  }

  /** The move from where the page is to a rest, as a list of chapter parts. */
  const route = (r: Rest) => {
    const from = where(scrollY)
    const i = from.c.i
    const j = r.c.i
    const segs: Array<Omit<Seg, 'ms'>> = []
    // Jumps: [y to jump to before the part] for each part.
    const jumps: Array<number | null> = []
    if (i === j) { segs.push({ c: r.c, a: from.p, b: r.p }); jumps.push(null) }
    else if (j === i + 1) {
      segs.push({ c: from.c, a: from.p, b: 1 }, { c: r.c, a: 0, b: r.p })
      jumps.push(null, r.c.top)
    } else if (j === i - 1) {
      segs.push({ c: from.c, a: from.p, b: 0 }, { c: r.c, a: 1, b: r.p })
      // The flat light at the boundary is the same place for both chapters.
      jumps.push(null, from.c.top)
    } else {
      // Further: cut to the target chapter's handoff light, then play into it.
      const a = j > i ? 0 : 1
      segs.push({ c: r.c, a, b: r.p })
      jumps.push(j > i ? r.c.top : r.c.top + r.c.pin)
    }
    return { segs: segs.map((s, k) => ({ ...s, jump: jumps[k] })).filter(s => Math.abs(s.b - s.a) > 1e-4 || s.jump !== null) }
  }

  /** One timed move to a rest. It holds where it is (a stop, or the
      handoff light) until every chapter it plays has its pictures decoded,
      4 s at most, then plays the chapters in turn and lands on the stop. */
  const go = (r: Rest, ms?: number) => {
    if (moving) return
    moving = true
    // data-film-moving: for tools and tests (nothing styles it): "hold" while
    // the pictures decode, "play" while the move plays.
    h.setAttribute('data-film-moving', 'hold')
    clearTimeout(settleT)
    const { segs } = route(r)
    const base = segs.map(s => Math.abs(s.b - s.a) * s.c.dur)
    const sum = base.reduce((x, y) => x + y, 0)
    const show = ms === undefined ? r.ms : ms
    const total = show || clamp(sum, MOVE_MIN, MOVE_MAX)
    const parts: Array<Seg & { jump: number | null }> = segs.map((s, k) => ({ ...s, ms: sum ? (base[k] / sum) * total : total / segs.length }))
    const ks = [...new Set(parts.map(s => s.c))]
    for (const k of ks) load(k)
    live([...new Set([where(scrollY).c, ...ks])])
    let ready = false
    Promise.race([
      Promise.all(ks.flatMap(k => (k.im || []).map(i => i.decode().catch(() => undefined)))),
      new Promise(done => setTimeout(done, 4000)),
    ]).then(() => { ready = true })
    const asked = performance.now()
    const wait = () => {
      // Before the page has loaded a chapter may not have started loading: wait for it too.
      if (!ready || (ks.some(k => k !== C[0] && !k.ok) && performance.now() - asked < 4000)) { later(wait, 50); return }
      h.setAttribute('data-film-moving', 'play')
      next(0)
    }
    const next = (k: number) => {
      if (k === parts.length) {
        jump(r.y)
        live([r.c])
        moving = false
        h.removeAttribute('data-film-moving')
        ended = performance.now()
        tick()
        // A chapter that came near during the move is seated once the frame has run.
        requestAnimationFrame(() => requestAnimationFrame(seatAll))
        return
      }
      const s = parts[k]
      if (s.jump !== null) { jump(s.jump); seat(s.c, s.a); beats(s.c, s.a); mark(s.c, s.a) }
      if (s.ms < 1 || Math.abs(s.b - s.a) < 1e-4) { next(k + 1); return }
      play(s, () => next(k + 1))
    }
    wait()
  }
  /** The next stop in a direction, from where the page is (stateless). */
  const step = (dir: number) => {
    if (moving || !R.length) return
    const y = scrollY
    if (dir > 0) {
      const r = R.find(r => r.y > y + 2)
      if (r) go(r)
    } else {
      let i = -1
      for (let k = 0; k < R.length; k++) if (R[k].y < y - 2) i = k
      // A move up takes the time of the showpiece it leaves.
      if (i >= 0) go(R[i], R[i + 1] && Math.abs(R[i + 1].y - y) <= 2 ? R[i + 1].ms : 0)
    }
  }
  const skip = (t: EventTarget | null) =>
    d.body.style.overflow === 'hidden' || !!(t as Element | null)?.closest?.(NATIVE)

  /* Wheel: one step per gesture. Disarmed after a step until the move has
     ended and either the wheel went quiet (150 ms) and a delta did not
     shrink, or three deltas in a row did not shrink (a notched wheel held
     spinning), or it turned round, or 600 ms passed. A trackpad's inertia
     tail decays, so it never fires a second step. */
  let armed = true
  let acc = 0
  let wDir = 0
  let wT = 0
  let wAbs = 0
  let grow = 0
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || skip(e.target)) return
    const dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1)
    if (!dy) return
    const dir = Math.sign(dy)
    const y = scrollY
    const end = last()
    // Past the last stop the page is native; coming back up into the film lands on the last stop.
    if (y > end + 2) {
      if (dir < 0 && y + dy < end + 2) { e.preventDefault(); if (!moving) go(R[R.length - 1]) }
      return
    }
    if (y >= end - 2 && dir > 0 && !moving) return
    e.preventDefault()
    const t = e.timeStamp
    const abs = Math.abs(dy)
    const gap = t - wT
    // Only events made after the move count towards re-arming (a busy page
    // can hand over a burst late, stamped with when it was made).
    grow = !moving && t > ended && abs >= wAbs ? grow + 1 : 0
    if (!moving && !armed && t > ended) {
      if (dir !== wDir || gap > 600 || (gap >= 150 && abs >= wAbs) || grow >= 3) armed = true
    }
    if (dir !== wDir) acc = 0
    wDir = dir
    wT = t
    wAbs = abs
    if (moving || !armed) return
    acc += dy
    if (Math.abs(acc) >= 40) { armed = false; acc = 0; grow = 0; step(dir) }
  }

  /* Touch: the first move past 24 px that is more vertical than horizontal
     fires one step and the gesture is spent. No finger-follow. The browser's
     own pan is cancelled from the first cancelable move. */
  let g: { x: number; y: number; done: boolean; nat: boolean } | null = null
  const onStart = (e: TouchEvent) => {
    g = null
    if (e.touches.length !== 1 || skip(e.target)) return
    g = { x: e.touches[0].clientX, y: e.touches[0].clientY, done: false, nat: false }
  }
  const onMove = (e: TouchEvent) => {
    if (!g || g.nat || e.touches.length !== 1) return
    const dx = g.x - e.touches[0].clientX
    const dy = g.y - e.touches[0].clientY
    const y = scrollY
    const end = last()
    if (!g.done && !moving) {
      // Past the last stop, or at it and going on down: the page's own scroll.
      if (y > end + 2 || (y >= end - 2 && dy > 0)) { g.nat = true; return }
      if (y >= end - 2 && dy === 0) return
    }
    if (e.cancelable) e.preventDefault()
    if (g.done || moving) return
    if (Math.abs(dy) > 24 && Math.abs(dy) > Math.abs(dx)) { g.done = true; step(Math.sign(dy)) }
    else if (Math.abs(dx) > 24) g.done = true
  }
  // A native pan that brought the page back up into the film lands on the last stop.
  const onEnd = () => { g = null; if (past && !moving && scrollY < last() - 2) settle() }

  /* Keys go through the same step and lock. */
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement
    const k = e.key
    if (e.altKey || e.ctrlKey || e.metaKey || skip(t) || /INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable) return
    if (k === ' ' && /BUTTON|A|SUMMARY/.test(t.tagName)) return
    const dn = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)
    const up = k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)
    if (!dn && !up) return
    const y = scrollY
    const end = last()
    if (y > end + 2 || (dn && y >= end - 2 && !moving)) return
    e.preventDefault()
    step(dn ? 1 : -1)
  }

  /* Any other scroll (a scrollbar drag, find in page, a restored position, a
     script): coming up from below the film lands on the last stop; inside the
     film, once it is quiet, the page settles at once on the nearest stop. */
  const settle = () => {
    settleT = 0
    // data-film-free on <html>: a tool or a test that needs a frame between stops.
    if (moving || g || !R.length) return
    if (h.hasAttribute('data-film-free')) { seatAll(); return }
    const y = scrollY
    if (!inFilm(y)) return
    if (past) { go(R[R.length - 1]); return }
    const r = nearest(y)
    if (Math.abs(r.y - y) > 2) jump(r.y)
    else seatAll()
  }
  /** Every near chapter on its frame for the page's place (after a jump that was not a move). */
  const seatAll = () => { for (const c of C) if (c.near) seat(c, (scrollY - c.top) / c.pin) }
  const onScroll = () => {
    tick()
    if (!on || moving) return
    const y = scrollY
    const end = last()
    if (y > end + 2) past = true
    // Back up from below the film (after the finger has lifted): the last stop.
    else if (past && y < end - 2 && R.length && !g) { go(R[R.length - 1]); return }
    clearTimeout(settleT)
    settleT = window.setTimeout(settle, 150)
  }

  /* Lettering: --em is the name's width in em, measured on its own line. */
  const fit = () => {
    for (const e of all('[data-name]')) {
      const n = e.firstElementChild as HTMLElement | null
      if (!n) continue
      const w = n.offsetWidth
      const f = parseFloat(getComputedStyle(e).fontSize)
      if (w && f) e.style.setProperty('--em', (w / f).toFixed(3))
    }
  }
  const name = (v: string) => {
    v = v.trim().slice(0, SHOP_NAME_MAX) || DEFAULT_SHOP_NAME
    for (const e of all('[data-name]')) (e.firstElementChild || e).textContent = v
    fit()
    try { sessionStorage.setItem(NAME_KEY, v === DEFAULT_SHOP_NAME ? '' : v) } catch {}
  }
  const inputs = all<HTMLInputElement>('[data-name-input]')
  const onInput = (e: Event) => name((e.target as HTMLInputElement).value)

  /* Anchors land on the chapter's rest, focus on the first stop at or after
     its beat; both through the same move and lock. */
  const restOf = (c: Chapter) => (isNaN(c.rest) ? 0 : c.rest)
  const stopIn = (c: Chapter, p: number) => {
    const s = c.stops.find(s => s.p >= p - 0.001) || c.stops[c.stops.length - 1]
    return R.find(r => r.c === c && s && r.p === s.p)
  }
  const goto = (c: Chapter, p: number, instant = false) => {
    const r = stopIn(c, p)
    if (!r) return jump(at(c, p))
    if (instant) { jump(r.y); requestAnimationFrame(seatAll) }
    else go(r)
  }
  const byHash = (hash: string) => C.find(c => '#' + c.id === hash)
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
    const c = a && a.hash.length > 1 ? byHash(a.hash) : undefined
    if (c && story) { e.preventDefault(); goto(c, restOf(c)); history.replaceState(history.state, '', a!.hash) }
  }
  // Tabbing into a chapter brings its beat on screen; a form field never
  // moves the page (the keyboard opening must not jerk it).
  const onFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement
    if (!story || /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return
    const c = C.find(c => c.el.contains(target))
    if (!c) return
    const b = c.beats.filter(t => t.b.contains(target)).pop()
    const p = b ? b.at : restOf(c)
    const pr = (scrollY - c.top) / c.pin
    if (pr < p - 0.001 || pr > 1) requestAnimationFrame(() => goto(c, Math.min(1, p)))
  }

  const stopMove = () => { for (const t of timers) clearTimeout(t); timers.clear(); for (const c of C) c.el.classList.remove('rev'); moving = false; h.removeAttribute('data-film-moving') }
  const onResize = () => {
    if (moving) stopMove()
    measure()
    fit()
    if (on) settle()
  }
  const onIdle = () => { idle = true; planes(C[0]) }
  const onLoad = () => {
    measure()
    if (on) settle()
    idleId = typeof requestIdleCallback === 'function' ? requestIdleCallback(onIdle, { timeout: 3000 }) : window.setTimeout(onIdle, 1500)
  }
  // A theme change lays out the other theme's pictures and swaps the hero's planes.
  const themes = new MutationObserver(() => requestAnimationFrame(() => { measure(); fit(); reset(); seatAll() }))

  // A chapter the browser had skipped letters its boards once it renders.
  const onShown = (e: Event) => {
    if ((e as Event & { skipped?: boolean }).skipped) return
    fit()
    const c = C.find(c => c.el === e.currentTarget)
    if (c) { c.an = null; if (!moving) seat(c, (scrollY - c.top) / c.pin) }
  }
  for (const c of C) c.el.addEventListener('contentvisibilityautostatechange', onShown)
  for (const i of inputs) i.addEventListener('input', onInput)
  d.addEventListener('click', onClick)
  d.addEventListener('focusin', onFocus)
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onResize)
  addEventListener('load', onLoad)
  WIDE.addEventListener('change', reset)
  themes.observe(h, { attributes: true, attributeFilter: ['data-theme'] })
  let live0 = true
  d.fonts?.ready.then(() => { if (live0) onResize() })

  measure()
  load(C[0])
  if (d.readyState === 'complete') onLoad()
  let saved = ''
  try { saved = sessionStorage.getItem(NAME_KEY) || '' } catch {}
  if (saved) { for (const i of inputs) i.value = saved; name(saved) } else fit()

  if (on) {
    addEventListener('wheel', onWheel, { passive: false })
    addEventListener('touchstart', onStart, { passive: true })
    addEventListener('touchmove', onMove, { passive: false })
    addEventListener('touchend', onEnd, { passive: true })
    addEventListener('touchcancel', onEnd, { passive: true })
    addEventListener('keydown', onKey)
    // Last, with every listener in place: the player takes over the
    // keyframes from the scroll, and the page's panning from the browser
    // (film.css: .drv-play, .stepper). If anything above threw, neither class
    // is set and the page keeps native scrolling on the scroll timelines.
    h.classList.remove('drv-native', 'drv-js')
    h.classList.add('drv-play', 'stepper')
    for (const c of C) c.an = null
    frame()
    seatAll()
  }
  const hash = byHash(location.hash)
  if (hash && story) goto(hash, restOf(hash), true)
  else if (on) settle()

  return () => {
    live0 = false
    if (raf) cancelAnimationFrame(raf)
    stopMove()
    clearTimeout(settleT)
    for (const c of C) { c.el.removeEventListener('contentvisibilityautostatechange', onShown); c.el.classList.remove('live') }
    for (const i of inputs) i.removeEventListener('input', onInput)
    d.removeEventListener('click', onClick)
    d.removeEventListener('focusin', onFocus)
    removeEventListener('scroll', onScroll)
    removeEventListener('resize', onResize)
    removeEventListener('load', onLoad)
    removeEventListener('wheel', onWheel)
    removeEventListener('touchstart', onStart)
    removeEventListener('touchmove', onMove)
    removeEventListener('touchend', onEnd)
    removeEventListener('touchcancel', onEnd)
    removeEventListener('keydown', onKey)
    WIDE.removeEventListener('change', reset)
    if (idleId) { if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idleId); clearTimeout(idleId) }
    themes.disconnect()
    h.classList.remove(...FILM_ROOT_CLASSES)
    for (const a of FILM_ROOT_ATTRIBUTES) h.removeAttribute(a)
  }
}
