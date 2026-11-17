/**
 * The home film's engine (DESIGN.md, "Home film").
 *
 * The browser scrolls the page natively and nothing here blocks it: the
 * wheel, touch and key listeners are passive and only report to the rest
 * module (rest.ts), never preventDefault. The stop markers (HomeFilm, one per
 * stop) give each stop its scroll position and film time. Each frame the rest
 * module turns the scroll position into a target film time: during a gesture
 * the film follows the scroll, held between the gates either side of it; when
 * the gesture is over the module picks the stop to rest on and the engine
 * sets the scroll position to that stop with an instant scrollTo (the screen
 * is pinned, so nothing on screen moves). One requestAnimationFrame loop
 * follows the target with a speed-limited spring (timeline.ts, `chase`). The
 * film time gives the chapter on screen and its progress p; the chapter's
 * keyframes are paused one-second animations whose time the loop sets to p
 * seconds. Chapters are rendered (.live) ahead of time only once the film is
 * still, so a first render never lands in the middle of a move.
 *
 * Around that: beats (`.on` between an element's `--at` and `--off`), the
 * root marks the header, the rail and the dock read (`data-film-ch`,
 * `data-film-tone`, `.settled`, `.has-cta`), the pictures loaded ahead with
 * no hold, the visitor's name lettered on every board, the depth planes,
 * anchors and focus, and `window.__film`, a read-only view for tests and
 * tools.
 *
 * `startStory` returns its teardown: every listener and frame removed and
 * everything it set on <html> taken off, so leaving the page and coming back
 * starts clean.
 */

import { DEFAULT_SHOP_NAME, SHOP_NAME_MAX } from '@/content/shop-name'
import { buildTimeline, chase, chaseOptions, type ChaseState } from './timeline'
import { createRest, type Rest, type RestFrame } from './rest'

/** Classes and attributes the film sets on <html>. */
export const FILM_ROOT_CLASSES = ['story', 'settled', 'has-cta', 'film-run'] as const
export const FILM_ROOT_ATTRIBUTES = ['data-film-ch', 'data-film-tone'] as const
/** Session storage only: the name never leaves the device. */
export const NAME_KEY = 'adj-name'

export type StopStory = () => void

/** The page-side contract (read-only), for tests and tools. */
export type FilmView = {
  version: 2
  /** y: the scrollY at which each stop rests. */
  readonly stops: ReadonlyArray<{ i: number; ch: string; p: number; y: number; gate: boolean }>
  /**
   * ch, p: what is on screen. moving: the film has not caught up with the
   * scroll, or the page scrolled in the last 120 ms. rest: the index of the
   * stop both the scroll (within 2 px) and the film sit on, else -1.
   */
  now: () => { y: number; ch: string; p: number; moving: boolean; rest: number; targetCh: string; targetP: number }
  /** The scrollY at which the film rests on chapter ch at progress p (for tools that need a frame between stops). */
  yAt: (ch: string, p: number) => number
}
declare global {
  interface Window { __film?: FilmView }
}

type Beat = { b: HTMLElement; at: number; off: number; on: boolean; cta: boolean; pl: boolean }
type Stack = HTMLElement & { t?: number }
type Chapter = {
  el: HTMLElement; id: string; i: number; st: HTMLElement; rest: number; dur: number; beats: Beat[]
  ld?: boolean; an?: Animation[] | null
  /** The p its keyframes are seated on; `want`: the p to seat once it has animations. */
  sp?: number; want?: number; tries?: number
}
/** A stop as the engine uses it: its marker and its scroll position in page pixels. */
type Mark = { el: HTMLElement; i: number; c: Chapter; p: number; gate: boolean; ms: number; ys: number; y: number }

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/**
 * Whether a picture is the copy for this theme and screen shape (film.css:
 * only `.day` or `.night`, and only `.tall-only` or `.wide-only`, is laid out).
 */
export function wantedCopy(el: Element, { dark, wide }: { dark: boolean; wide: boolean }): boolean {
  if (el.closest('.night') && !dark) return false
  if (el.closest('.day') && dark) return false
  if (el.closest('.wide-only') && !wide) return false
  if (el.closest('.tall-only') && wide) return false
  return true
}
/**
 * The pictures of a chapter kept lazy at page load (data-keep-lazy: the work
 * wall's later photographs and its closing one) that are this visitor's copy,
 * in document order. They are switched to eager once their chapter, or the
 * one before it, is shown, so the whole wall is asked for at once rather than
 * photo by photo as it rises.
 */
export function keptLazy(root: ParentNode, want: { dark: boolean; wide: boolean }): HTMLImageElement[] {
  return [...root.querySelectorAll<HTMLImageElement>('img[loading=lazy][data-keep-lazy]:not(.pl)')].filter(i => wantedCopy(i, want))
}
/** The page counts as on a stop within this many pixels. */
const ON = 2

export function startStory(film: HTMLElement): StopStory {
  const d = document
  const h = d.documentElement
  const all = <T extends Element = HTMLElement>(s: string, e: ParentNode = film) => [...e.querySelectorAll<T>(s)]
  const story = h.classList.contains('story')
  const coarse = matchMedia('(pointer: coarse)').matches
  const opts = chaseOptions(coarse)
  // Beats are written inline, so they are read from the style attribute: no style recalculation.
  const num = (e: HTMLElement, k: string) => parseFloat(e.style.getPropertyValue(k))
  const C: Chapter[] = all('.ch').map((el, i) => {
    const st = el.querySelector<HTMLElement>('.stage')!
    const beats = all('[style*="--at"]', el).map(b => ({
      b, at: num(b, '--at') || 0, off: num(b, '--off') || 9, on: false, cta: !!b.querySelector('.cta'), pl: b.classList.contains('planes'),
    }))
    return {
      el, id: el.id, i, st, beats,
      rest: parseFloat(el.dataset.rest ?? ''),
      dur: parseFloat(el.dataset.dur ?? '') || 4,
    }
  })
  const byId = (id: string) => C.find(c => c.id === id)
  const M: Mark[] = all('.film-stop[data-i]').map(el => ({
    el, i: +el.dataset.i!, c: byId(el.dataset.ch || '') || C[0], p: +(el.dataset.p || 0), gate: el.hasAttribute('data-gate'),
    ms: +(el.dataset.ms || 0), ys: num(el, '--y') || 0, y: 0,
  }))
  const TL = buildTimeline(
    M.map((m, k) => ({ i: m.i, ch: m.c.id, ci: m.c.i, p: m.p, gate: m.gate, ms: m.ms, dy: k ? m.ys - M[k - 1].ys : 0 })),
    C.map(c => ({ dur: c.dur })),
  )
  const T = TL.stops.map(s => s.t)
  const rail = all<HTMLAnchorElement>('.rail a')
  const timers = new Set<number>()
  const later = (f: () => void, ms: number) => { const t = window.setTimeout(() => { timers.delete(t); f() }, ms); timers.add(t) }
  let idleId = 0
  const idleCb = (f: () => void, timeout: number) => {
    if (typeof requestIdleCallback === 'function') idleId = requestIdleCallback(f, { timeout })
    else later(f, 200)
  }

  /* ---------- Where the stops are ---------- */
  /** The scroll position at which the pinned screen has wholly left the top of the screen. */
  let exitY = Infinity
  let H = innerHeight
  const measure = () => {
    const y = scrollY
    for (const m of M) m.y = Math.round(m.el.getBoundingClientRect().top + y)
    exitY = Math.round(film.getBoundingClientRect().bottom + y)
    H = C[0]?.st.offsetHeight || innerHeight
    // The rest module learns the new places (a gesture in flight is settled).
    try { R?.setStops(restStops(), y, innerHeight) } catch {}
  }
  const lastY = () => (M.length ? M[M.length - 1].y : 0)
  /** The film time for a scroll position: linear in pixels between two stops, exact on a stop. */
  const targetAt = (y: number) => {
    if (!M.length) return 0
    if (y <= M[0].y + ON) return T[0]
    const n = M.length - 1
    if (y >= M[n].y - ON) return T[n]
    let k = 1
    while (k < n && M[k].y < y) k++
    if (Math.abs(y - M[k].y) <= ON) return T[k]
    if (Math.abs(y - M[k - 1].y) <= ON) return T[k - 1]
    const u = (y - M[k - 1].y) / (M[k].y - M[k - 1].y)
    return TL.timeAt(M[k - 1].ys + u * (M[k].ys - M[k - 1].ys))
  }
  /* ---------- Where the film rests (rest.ts) ---------- */
  const restStops = () => M.map((m, k) => ({ y: m.y, t: T[k], gate: m.gate }))
  let R: Rest | null = null
  let out: RestFrame | null = null
  let runOn = false
  const runClass = (on: boolean) => {
    if (on === runOn) return
    runOn = on
    h.classList.toggle('film-run', on)
    exitY = Math.round(film.getBoundingClientRect().bottom + scrollY)
  }
  /**
   * The chase's target film time: the one place the loop asks where the film
   * should go. The rest module's answer, with its rebase applied; if anything
   * in it fails, the film simply follows the scroll.
   */
  const ask = (now: number) => {
    const y = scrollY
    if (!R) return targetAt(y)
    let o: RestFrame
    try { o = R.frame(y, now, s.t) } catch { o = { target: targetAt(y), rebase: null, rest: -1, run: false } }
    out = o
    // film-run on before the write (the page must be long enough for it), off after it.
    if (o.run) runClass(true)
    if (o.rebase !== null) {
      // Below the film the pinned screen is partly scrolled away, so the way back is shown, not cut.
      scrollTo({ top: o.rebase, behavior: y > lastY() + 1 ? 'smooth' : 'instant' })
    }
    if (!o.run) runClass(false)
    return o.target
  }

  /* ---------- Pictures: loaded ahead, never waited for ---------- */
  const WIDE = matchMedia('(min-width: 1024px) and (min-aspect-ratio: 5/4)')
  const save = !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  let idle = false
  /* Depth planes: fetched only in the film, never with Save-Data or on a
     touch screen (for now: a phone's frames go to the scenes); the hero's only
     once its picture is in and the page has gone idle. .ready once all decoded. */
  let tok = 0
  const planes = (c?: Chapter) => {
    if (!story || coarse || save || !c || (c === C[0] && !idle)) return
    for (const s of all<Stack>('.planes', c.el)) {
      if (s.t) continue
      const k = WIDE.matches ? 'srcw' : 'src'
      const n = h.dataset.theme === 'dark'
      const t = (s.t = ++tok)
      const imgs = all<HTMLImageElement>('.pl', s)
      for (const i of imgs) i.src = (n && i.dataset[k + 'N']) || i.dataset[k] || ''
      Promise.all(imgs.map(i => i.decode())).then(() => { if (s.t === t) { s.classList.add('ready'); c.an = null; c.sp = undefined; want(c) } }, () => {})
    }
  }
  const reset = () => {
    for (const s of all<Stack>('.planes')) { s.t = 0; s.classList.remove('ready') }
    for (const c of C) { c.an = null; c.sp = undefined; if (c.ld) planes(c) }
  }
  /** The theme the pictures are for: html[data-theme], else the system's. */
  const dark = () => (h.dataset.theme ? h.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches)
  /** Lazy pictures for this theme and screen shape load now, chosen by rule
      (a skipped chapter has no boxes to measure): the other copy stays unfetched. */
  const eager = (c: Chapter) => {
    const want = { dark: dark(), wide: WIDE.matches }
    // A rendered chapter can also be measured: a copy hidden some other way (the hero's other scene) stays lazy.
    const live = c.el.classList.contains('live')
    for (const i of all<HTMLImageElement>('img[loading=lazy]:not([data-keep-lazy]):not(.pl)', c.el)) {
      if (wantedCopy(i, want) && (!live || i.getClientRects().length)) i.loading = 'eager'
    }
  }
  /** The chapter's kept-lazy pictures, released (see keptLazy). */
  const release = (c?: Chapter) => {
    if (!c) return
    for (const i of keptLazy(c.el, { dark: dark(), wide: WIDE.matches })) i.loading = 'eager'
  }
  const load = (c?: Chapter) => {
    if (!c || c.ld) return
    c.ld = true
    c.el.classList.add('ld')
    eager(c)
    // The lit plate the hills' and the junction's lamps paint as a background, fetched with the pictures.
    const lit = c.st.style.getPropertyValue(WIDE.matches ? '--lit-w' : '--lit-t').match(/url\("?([^")]+)/)?.[1]
    if (lit) { const i = new Image(); i.src = lit }
    planes(c)
  }
  /** After the hero's picture (or 2.5 s): the next two chapters, then one more each time the browser is idle. */
  let ahead = 1
  let aheadOn = true
  const fetchAhead = () => {
    if (!aheadOn || save) return
    load(C[1])
    load(C[2])
    ahead = 3
    const next = () => {
      if (!aheadOn) return
      while (ahead < C.length && C[ahead].ld) ahead++
      if (ahead >= C.length) return
      load(C[ahead++])
      idleCb(next, 2000)
    }
    idleCb(next, 2000)
  }

  /* ---------- Beats, marks, seats ---------- */
  const beats = (c: Chapter, pr: number) => {
    let changed = false
    for (const t of c.beats) {
      const on = story ? pr >= t.at && pr < t.off : true
      if (on !== t.on) {
        t.on = on
        changed = true
        // A stack that is not ready when its beat starts sits this pass out.
        if (on && t.pl) t.b.classList.toggle('late', !t.b.classList.contains('ready'))
        t.b.classList.toggle('on', on)
        if (!on) t.b.classList.remove('lit-in')
      }
    }
    return changed
  }

  /* Root attributes and classes are written only when they change. */
  const set = (k: string, v: string) => { if (h.getAttribute(k) !== v) h.setAttribute(k, v) }
  let marked = ''
  let railCur: Chapter | null | undefined
  /** The header's, the rail's and the dock's view of the film: chapter c at progress pr (null: past the film). */
  const mark = (now: Chapter | null, pr: number) => {
    let tone: string | undefined
    if (now) {
      const s = now.st.dataset
      tone = s.tone
      const marks = (s.toneAt || '').split(' ')
      const late = (s.toneLate || '').split(' ')
      marks.forEach((a, i) => { if (a && pr >= +a) tone = late[i] })
    }
    const settled = !now || pr >= 0.06
    const cta = !!now && now.beats.some(t => t.on && t.cta)
    const key = `${now ? now.id : 'after'}|${tone || 'page'}|${settled}|${cta}`
    if (key === marked) return
    marked = key
    set('data-film-ch', now ? now.id : 'after')
    set('data-film-tone', tone || 'page')
    // .settled: past the first moments of a chapter (its light handoff);
    // .has-cta: a gold action of the chapter's own is showing.
    h.classList.toggle('settled', settled)
    h.classList.toggle('has-cta', cta)
    if (now !== railCur) {
      railCur = now
      for (const a of rail) a.toggleAttribute('aria-current', !!now && a.hash === '#' + now.id)
    }
  }

  /** The chapter's keyframes (.cam, .tl, .pl): a loading shimmer or a light's own loop keep their time. */
  const anims = (c: Chapter) => {
    if (!c.an?.length) {
      c.an = c.el.getAnimations({ subtree: true }).filter(a => 'animationName' in a && !(a.effect as KeyframeEffect | null)?.pseudoElement
        && !!((a.effect as KeyframeEffect | null)?.target as Element | null)?.matches?.('.cam, .tl, .pl'))
    }
    return c.an
  }
  /** Chapters that are live but have no animations yet (the browser has not rendered them): seated on a later frame. */
  const pending = new Set<Chapter>()
  const seat = (c: Chapter, p: number) => {
    p = clamp(p, 0, 1)
    c.want = p
    if (c.sp === p) return
    const list = anims(c)
    if (!list.length) {
      // Tried on the next frames; a chapter with no keyframes at all stops being tried.
      if ((c.tries = (c.tries || 0) + 1) < 30) pending.add(c)
      return
    }
    for (const a of list) {
      a.pause()
      a.currentTime = p * 1000
    }
    c.sp = p
    c.tries = 0
    pending.delete(c)
  }
  const want = (c: Chapter) => { if (c.want !== undefined && c.el.classList.contains('live')) { pending.add(c); kick() } }

  /* Lettering: --em is the name's width in em, measured on its own line. */
  const fit = (scope: ParentNode = film) => {
    for (const e of all('[data-name]', scope)) {
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

  /* ---------- The loop ---------- */
  let s: ChaseState = { t: 0, v: 0 }
  let shown: Chapter | null = null
  let shownP = 0
  let raf = 0
  let lastT = 0
  let lastScroll = -1e9
  let revOn: Chapter | null = null
  const fresh = new Set<Chapter>()

  /** Renders chapter k (.live) or stops rendering it. */
  const live = (k: Chapter, on: boolean) => {
    if (on === k.el.classList.contains('live')) return false
    k.el.classList.toggle('live', on)
    // Its animations come and go with .live (film.css).
    k.an = null
    k.sp = undefined
    k.tries = 0
    if (on) { fresh.add(k); load(k) } else pending.delete(k)
    return true
  }
  /** A live chapter other than the one shown sits at its end on the shown chapter's side. */
  const seatEnd = (k: Chapter) => {
    if (!shown || k === shown || !k.el.classList.contains('live')) return
    const p = k.i < shown.i ? 1 : 0
    seat(k, p)
    beats(k, p)
  }
  /**
   * The live set the film wants at rest: the chapter shown and its neighbours.
   * Rendering a chapter for the first time is the dearest thing the page does,
   * so this runs only once the film has caught up and the page has been still
   * for 120 ms (calm), never in the middle of a move.
   */
  let liveDirty = false
  const calm = () => {
    liveDirty = false
    if (!shown) return
    for (const k of C) if (live(k, Math.abs(k.i - shown.i) <= 1)) seatEnd(k)
  }
  /**
   * Shows chapter c: .cur on it. It and the chapter the target is in (tc) are
   * made live at once; everything else waits for calm().
   */
  const show = (c: Chapter, tc: Chapter) => {
    const was = shown
    shown = c
    for (const k of C) k.el.classList.toggle('cur', k === c)
    live(c, true)
    live(tc, true)
    // The shown chapter's kept-lazy pictures, and (unless Save-Data) the next chapter's.
    release(c)
    if (!save) release(C[c.i + 1])
    for (const k of C) seatEnd(k)
    liveDirty = true
    if (was && revOn) { revOn.el.classList.remove('rev'); revOn = null }
  }

  /** Puts the film on film time t, heading for film time target. */
  const render = (t: number, target = t) => {
    const f = TL.frameAt(t)
    const c = C[f.ci]
    const tc = C[TL.frameAt(target).ci] || c
    if (c !== shown) show(c, tc)
    else if (live(tc, true)) { seatEnd(tc); liveDirty = true }
    shownP = f.p
    seat(c, f.p)
    beats(c, f.p)
    const past = scrollY > lastY() + H * 0.5
    mark(past ? null : c, f.p)
  }

  const frame = (now: number) => {
    raf = 0
    const dt = lastT ? (now - lastT) / 1000 : 1 / 60
    lastT = now
    const target = ask(now)
    const y = scrollY
    const tf = TL.frameAt(target)
    if (y >= exitY || !shown) {
      // The pinned screen is out of view below the film (or the film is starting): no chase.
      s = { t: target, v: 0 }
    } else if (Math.abs(tf.ci - shown.i) >= 2) {
      // A far jump (a rail link, a scrollbar drag, Home or End): cut to the
      // target chapter's opening going down, or its end going up, then chase.
      s = { t: tf.ci > shown.i ? TL.timeOf(tf.ci, 0) + 1e-6 : TL.timeOf(tf.ci, 1), v: 0 }
    }
    s = chase(s, target, dt, opts)
    render(s.t, target)
    // .rev: the chapter plays backwards (film.css: the hills' lights go out together).
    const rev = s.v < -1e-3 && shown ? shown : null
    if (rev !== revOn) { revOn?.el.classList.remove('rev'); rev?.el.classList.add('rev'); revOn = rev }
    // A chapter that has just become live: its lettering and its frame once the browser has rendered it.
    for (const c of fresh) { fresh.delete(c); fit(c.el); eager(c); if (c.want !== undefined) pending.add(c) }
    for (const c of [...pending]) seat(c, c.want ?? 0)
    const caught = s.t === target && s.v === 0
    if (liveDirty && caught && now - lastScroll >= 120) calm()
    // The loop also runs while a gesture is live (so its end is seen) and until the live set is calm.
    if (!caught || pending.size || fresh.size || liveDirty || (out !== null && out.rest < 0)) kick()
    else lastT = 0
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }

  /* The loop is started here, by scroll, resize (onResize) and input, and stops itself once the film has caught up and rests. */
  const onScroll = () => {
    const t = performance.now()
    lastScroll = t
    try { R?.scroll(scrollY, t) } catch {}
    kick()
  }
  const settleNow = () => { s = { t: ask(performance.now()), v: 0 }; render(s.t) }
  const onResize = () => {
    const atRest = s.v === 0 && out !== null && s.t === out.target && out.rest >= 0
    measure()
    fit()
    if (atRest) settleNow()
    kick()
  }

  /* ---------- Input: passive, reported only ---------- */
  /** Inputs inside a dialog, the chat window or a box that scrolls on its own are not the film's. */
  const foreignTarget = (e: Event) => !!(e.target as Element | null)?.closest?.('dialog, [role="dialog"], [data-native-scroll]')
  const tell = (kind: Parameters<Rest['input']>[0], delta?: number) => {
    try { R?.input(kind, performance.now(), delta) } catch {}
    kick()
  }
  const onTouchStart = (e: TouchEvent) => { if (!foreignTarget(e)) tell('touchstart') }
  const onTouchEnd = (e: TouchEvent) => { if (!e.touches.length) tell('touchend') }
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || foreignTarget(e)) return
    const d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1)
    if (d) tell('wheel', d)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey || foreignTarget(e)) return
    const t = e.target as HTMLElement | null
    if (t && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable)) return
    // Space on a button or a link presses it; it does not scroll.
    if (e.key === ' ' && t && /BUTTON|^A$/.test(t.tagName)) return
    const page = innerHeight * 0.875
    const d = ({ ArrowDown: 40, ArrowUp: -40, PageDown: page, PageUp: -page, ' ': e.shiftKey ? -page : page } as Record<string, number>)[e.key]
    if (e.key === 'Home' || e.key === 'End') tell('foreign')
    else if (d) tell('key', d)
  }

  /* ---------- Anchors and focus ---------- */
  const restOf = (c: Chapter) => (isNaN(c.rest) ? 0 : c.rest)
  /** The stop of chapter c at or after p. */
  const stopIn = (c: Chapter, p: number) => {
    const own = M.filter(m => m.c === c)
    return own.find(m => m.p >= p - 0.001) || own[own.length - 1]
  }
  const goto = (c: Chapter, p: number) => {
    const m = stopIn(c, p)
    // A jump of the page's own: no gate holds it, and it ends on the stop it lands on.
    if (m) { tell('foreign'); scrollTo({ top: m.y, behavior: 'instant' }) }
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
    if (shown !== c || shownP < p - 0.001) goto(c, Math.min(1, p))
  }

  // A theme change lays out the other theme's pictures and swaps the planes; every live chapter is seated again.
  const themes = new MutationObserver(() => requestAnimationFrame(() => {
    measure()
    fit()
    reset()
    for (const c of C) if (c.el.classList.contains('live')) want(c)
    kick()
  }))
  // A whole lit plate that has finished fading in marks itself (.lit-in): the
  // light windows under it then leave rendering (film.css), with no transition.
  const onFaded = (e: TransitionEvent) => {
    const t = e.target as HTMLElement
    if (e.propertyName === 'opacity' && t.matches?.('.lit-all, .h-lit')) t.classList.toggle('lit-in', t.classList.contains('on'))
  }

  /* ---------- Start ---------- */
  for (const i of inputs) i.addEventListener('input', onInput)
  d.addEventListener('click', onClick)
  // A hash changed some other way (typed, or history): the browser's own jump goes to the pinned screen, so put the page on the stop.
  const onHash = () => { const c = byHash(location.hash); if (c && story) goto(c, restOf(c)) }
  addEventListener('hashchange', onHash)
  d.addEventListener('focusin', onFocus)
  film.addEventListener('transitionend', onFaded)
  addEventListener('scroll', onScroll, { passive: true })
  if (story) {
    addEventListener('touchstart', onTouchStart, { passive: true })
    addEventListener('touchend', onTouchEnd, { passive: true })
    addEventListener('touchcancel', onTouchEnd, { passive: true })
    addEventListener('wheel', onWheel, { passive: true })
    addEventListener('keydown', onKey, { passive: true })
  }
  addEventListener('resize', onResize)
  WIDE.addEventListener('change', reset)
  themes.observe(h, { attributes: true, attributeFilter: ['data-theme'] })
  let alive = true
  d.fonts?.ready.then(() => { if (alive) { measure(); fit(); kick() } })

  measure()
  if (story && M.length) R = createRest(restStops(), scrollY, targetAt, { vh: innerHeight })
  load(C[0])
  let saved = ''
  try { saved = sessionStorage.getItem(NAME_KEY) || '' } catch {}
  if (saved) { for (const i of inputs) i.value = saved; name(saved) } else fit()

  // The hero's picture first; then the next chapters, and the hero's planes once the page is idle.
  const hero = all<HTMLImageElement>('img', C[0]?.el || film).find(i => i.getClientRects().length && (i.hasAttribute('data-hero-image') || i.closest('[data-hero-image]')))
  let started = false
  const afterHero = () => {
    if (started || !alive) return
    started = true
    fetchAhead()
    idleCb(() => { idle = true; planes(C[0]) }, 3000)
  }
  if (!hero || hero.complete) afterHero()
  else { hero.addEventListener('load', afterHero, { once: true }); hero.addEventListener('error', afterHero, { once: true }) }
  later(afterHero, 2500)

  const hash = byHash(location.hash)
  // The browser's own scroll to the hash can come after this (the section is
  // inside the pinned screen, near the top): put the page on the stop again
  // then, unless the visitor has scrolled away from the top meanwhile.
  const onLoad = () => { if (alive && hash && M.length > 1 && scrollY < M[1].y / 2) goto(hash, restOf(hash)) }
  if (story && hash && d.readyState !== 'complete') addEventListener('load', onLoad, { once: true })
  if (story) {
    if (hash) goto(hash, restOf(hash))
    settleNow()
    kick()
  } else {
    for (const c of C) beats(c, 1)
  }

  const view: FilmView = Object.freeze({
    version: 2 as const,
    get stops() { return M.map(m => ({ i: m.i, ch: m.c.id, p: m.p, y: m.y, gate: m.gate })) },
    now: () => {
      const y = scrollY
      // The last frame's answer from the rest module (no new question: asking has effects).
      const target = out ? out.target : targetAt(y)
      const tf = TL.frameAt(target)
      const caught = s.t === target && s.v === 0
      // rest: the module's stop, once the film has caught up and the scroll sits on it.
      const k = out ? out.rest : -1
      const rest = caught && k >= 0 && k < M.length && Math.abs(y - M[k].y) <= ON ? k : -1
      return {
        y, ch: shown?.id ?? C[0].id, p: shownP,
        moving: !caught || performance.now() - lastScroll < 120,
        rest, targetCh: C[tf.ci].id, targetP: tf.p,
      }
    },
    yAt: (ch: string, p: number) => {
      const c = byId(ch)
      if (!c || !M.length) return 0
      const t = TL.timeOf(c.i, clamp(p, 0, 1))
      let k = 1
      while (k < M.length - 1 && T[k] < t) k++
      const u = T[k] > T[k - 1] ? clamp((t - T[k - 1]) / (T[k] - T[k - 1]), 0, 1) : 0
      return Math.round(M[k - 1].y + u * (M[k].y - M[k - 1].y))
    },
  })
  if (story) window.__film = view

  return () => {
    alive = false
    aheadOn = false
    if (raf) cancelAnimationFrame(raf)
    for (const t of timers) clearTimeout(t)
    timers.clear()
    if (idleId && typeof cancelIdleCallback === 'function') cancelIdleCallback(idleId)
    if (hero) { hero.removeEventListener('load', afterHero); hero.removeEventListener('error', afterHero) }
    removeEventListener('load', onLoad)
    for (const c of C) c.el.classList.remove('live', 'cur', 'rev')
    for (const i of inputs) i.removeEventListener('input', onInput)
    d.removeEventListener('click', onClick)
    removeEventListener('hashchange', onHash)
    d.removeEventListener('focusin', onFocus)
    film.removeEventListener('transitionend', onFaded)
    removeEventListener('scroll', onScroll)
    removeEventListener('touchstart', onTouchStart)
    removeEventListener('touchend', onTouchEnd)
    removeEventListener('touchcancel', onTouchEnd)
    removeEventListener('wheel', onWheel)
    removeEventListener('keydown', onKey)
    removeEventListener('resize', onResize)
    R = null
    WIDE.removeEventListener('change', reset)
    themes.disconnect()
    if (window.__film === view) delete window.__film
    h.classList.remove(...FILM_ROOT_CLASSES)
    for (const a of FILM_ROOT_ATTRIBUTES) h.removeAttribute(a)
  }
}
