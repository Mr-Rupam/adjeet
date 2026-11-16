/**
 * The home film's engine (DESIGN.md, "Home film"), ported from the storyboard
 * prototype's engine/story.js. It switches beats (`.on` once a chapter's
 * progress passes an element's `--at`), loads and decodes the pictures ahead,
 * fits the visitor's name to every board, follows focus, anchors and keys, and
 * writes the current chapter and its tone on <html> for the header, the rail
 * and the dock.
 *
 * Drivers. With GSAP, ScrollTrigger and Lenis (storyboard-v2, section 3b;
 * loaded by FilmEngine after the page has loaded), Lenis smooths the scroll
 * and, per chapter, ScrollTrigger scrubs one proxy tween whose value sets
 * `currentTime` on the chapter's paused CSS animations and drives its beats.
 * Without them, the native scroll timelines drive the same keyframes, or the
 * requestAnimationFrame driver feeds `--p` where the browser has none.
 *
 * `startStory` returns its teardown: every listener removed, every trigger
 * killed, Lenis destroyed, and everything it set on <html> taken off, so
 * leaving the page and coming back starts clean. `stop(true)` keeps the
 * film's mode classes, for handing over to the GSAP driver.
 */

import type { gsap as Gsap } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'
import type LenisType from 'lenis'
import { DEFAULT_SHOP_NAME, SHOP_NAME_MAX } from '@/content/shop-name'

/** Classes and attributes the film sets on <html>. */
export const FILM_ROOT_CLASSES = ['story', 'drv-native', 'drv-js', 'drv-gsap', 'settled', 'has-cta'] as const
export const FILM_ROOT_ATTRIBUTES = ['data-film-ch', 'data-film-tone'] as const
/** Session storage only: the name never leaves the device. */
export const NAME_KEY = 'adj-name'

export type FilmLibs = { gsap: typeof Gsap; ScrollTrigger: typeof ScrollTriggerType; Lenis: typeof LenisType }
export type StopStory = (keepMode?: boolean) => void

type Beat = { b: HTMLElement; at: number; off: number; on: boolean; cta: boolean; pl: boolean }
type Stack = HTMLElement & { t?: number }
type Chapter = {
  el: HTMLElement; id: string; st: HTMLElement; rest: number; stops: number[]; beats: Beat[]
  top: number; pin: number; H: number; ld?: boolean; was?: boolean; near?: boolean
  ok?: boolean; v?: number; an?: Animation[] | null; tl?: gsap.core.Timeline
}

export function startStory(film: HTMLElement, libs?: FilmLibs): StopStory {
  const d = document
  const h = d.documentElement
  const all = <T extends Element = HTMLElement>(s: string, e: ParentNode = film) => [...e.querySelectorAll<T>(s)]
  const story = h.classList.contains('story')
  const lib = !!(story && libs)
  const js = !lib && h.classList.contains('drv-js')
  // Beats are written inline, so they are read from the style attribute: no style recalculation.
  const num = (e: HTMLElement, k: string) => parseFloat(e.style.getPropertyValue(k))
  const C: Chapter[] = all('.ch').map(el => ({
    el, id: el.id, st: el.querySelector<HTMLElement>('.stage')!,
    rest: parseFloat(el.dataset.rest ?? ''),
    stops: (el.dataset.stops || '').split(' ').filter(Boolean).map(Number),
    beats: all('[style*="--at"]', el).map(b => ({
      b, at: num(b, '--at') || 0, off: num(b, '--off') || 9, on: false, cta: !!b.querySelector('.cta'), pl: b.classList.contains('planes'),
    })),
    top: 0, pin: 1, H: 1,
  }))
  const rail = all<HTMLAnchorElement>('.rail a')
  let raf = 0
  let cur: Chapter | null | undefined
  let idle = false
  let tok = 0
  let idleId = 0
  let S: number[] = [0]

  /* The GSAP driver's clock and smoothing. */
  const touch = matchMedia('(pointer: coarse)').matches
  let lenis: LenisType | null = null
  let tickLenis: ((time: number) => void) | null = null
  if (lib && libs) {
    const { gsap, ScrollTrigger, Lenis } = libs
    h.classList.remove('drv-native', 'drv-js')
    h.classList.add('drv-gsap')
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.config({ ignoreMobileResize: true } as ScrollTrigger.ConfigVars)
    // The menu, the chat panel and anything marked scroll natively.
    const prevent = (n: HTMLElement) => !!n.closest?.('[role="dialog"], .chatbot-window, [data-lenis-prevent]')
    lenis = new Lenis(touch
      ? { lerp: 0.08, syncTouch: true, syncTouchLerp: 0.075, touchInertiaExponent: 1.7, touchMultiplier: 1.3, prevent }
      : { lerp: 0.1, syncTouch: false, prevent })
    lenis.on('scroll', ScrollTrigger.update)
    tickLenis = (time: number) => lenis!.raf(time * 1000)
    gsap.ticker.add(tickLenis)
    gsap.ticker.lagSmoothing(0)
  }

  /* Depth planes: fetched only in the film, never with Save-Data; the hero's
     only once the page has loaded and gone idle. .ready once all decoded. */
  const WIDE = matchMedia('(min-width: 1024px) and (min-aspect-ratio: 5/4)')
  const save = !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  const planes = (c?: Chapter) => {
    // Never under the requestAnimationFrame driver: there the planes cost more
    // frames than they add depth, so the flat plate does every move.
    if (!story || js || save || !c || (c === C[0] && !idle)) return
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

  const measure = () => {
    const y = scrollY
    for (const c of C) {
      c.top = c.el.getBoundingClientRect().top + y
      // Every stage is one screen; a chapter the browser is skipping
      // (content-visibility) reports no layout inside it, so the first
      // chapter's stage gives the height for all.
      c.H = C[0].st.offsetHeight
      c.pin = Math.max(1, c.el.offsetHeight - c.H)
      c.an = null
    }
    // The rests in page pixels (keys go rest to rest).
    S = [0]
    for (const c of C) for (const s of c.stops) S.push(c.top + c.pin * s)
    const L = C[C.length - 1]
    S.push(L.top + L.pin)
    S.sort((a, b) => a - b)
    frame()
  }
  // Pictures are fetched and decoded ahead. .ok: decoded, or 4 s passed;
  // until then the GSAP driver holds the chapter on its first frame, the
  // handoff light.
  const load = (c?: Chapter) => {
    // Nothing after the hero starts loading before the page has: the hero's
    // picture keeps the network to itself (the load event measures again).
    if (!c || c.ld || (c !== C[0] && d.readyState !== 'complete')) return
    c.ld = true
    c.el.classList.add('ld')
    // Only pictures that are laid out: the other theme's or size's copy stays unfetched.
    const im = all<HTMLImageElement>('img[loading=lazy]:not([data-keep-lazy]):not(.pl)', c.el).filter(i => i.getClientRects().length)
    for (const i of im) i.loading = 'eager'
    planes(c)
    Promise.race([Promise.all(im.map(i => i.decode().catch(() => undefined))), new Promise(r => setTimeout(r, 4000))])
      .then(() => { c.ok = true; if (c.tl) apply(c, c.v || 0) })
  }

  const beats = (c: Chapter, pr: number) => {
    for (const t of c.beats) {
      const on = story ? (t.on ? pr >= t.at - 0.015 : pr >= t.at) && pr < t.off : true
      if (on !== t.on) {
        t.on = on
        // A stack that is not ready when its move begins sits this pass out.
        if (on && t.pl) t.b.classList.toggle('late', !t.b.classList.contains('ready'))
        t.b.classList.toggle('on', on)
        if (t.pl) c.an = null
      }
    }
  }
  // The GSAP driver's per-frame work for one chapter: p is the scrubbed,
  // smoothed progress. Held at 0 until the chapter's pictures are ready.
  const apply = (c: Chapter, p: number) => {
    c.v = p
    if (c !== C[0] && !c.ok) p = 0
    // CSS animations only: setting a transition's time would break the beat fades.
    if (!c.an) c.an = c.el.getAnimations({ subtree: true }).filter(a => 'animationName' in a)
    for (const a of c.an) a.currentTime = p * 1000
    beats(c, p)
  }

  /* Root attributes are written only when they change. */
  const set = (k: string, v: string) => { if (h.getAttribute(k) !== v) h.setAttribute(k, v) }

  const frame = () => {
    raf = 0
    const y = scrollY
    let at: Chapter | null = null
    let tone: string | undefined
    for (let i = 0; i < C.length; i++) {
      const c = C[i]
      const r = y - c.top
      const pr = r / c.pin
      const p = Math.min(1, Math.max(0, pr))
      if (r >= 0) at = c
      const near = r > -2 * c.H && r < c.pin + c.H
      c.el.classList.toggle('pin', story ? r >= 0 && r < c.pin + c.H : true)
      // Scroll-bound animations exist only on chapters near the screen (film.css).
      if (near !== c.near) { c.near = near; c.el.classList.toggle('near', near); c.an = null; if (lib && near) requestAnimationFrame(() => apply(c, c.v || 0)) }
      if (!near && !c.was) continue
      c.was = near
      if (story && js) c.el.style.setProperty('--p', p.toFixed(4))
      if (near) { load(c); if (r >= 0) { load(C[i + 1]); load(C[i + 2]) } }
      if (!lib) beats(c, pr)
    }
    const last = C[C.length - 1]
    if (at === last && y - last.top > last.pin + last.H * 0.5) at = null
    let pr = 1
    if (at) {
      const s = at.st.dataset
      pr = (y - at.top) / at.pin
      tone = s.tone
      const marks = (s.toneAt || '').split(' ')
      const late = (s.toneLate || '').split(' ')
      marks.forEach((a, i) => { if (a && pr >= +a) tone = late[i] })
    }
    set('data-film-ch', at ? at.id : 'after')
    set('data-film-tone', tone || 'page')
    // .settled: past the first moments of a chapter (its light handoff);
    // .has-cta: a gold action of the chapter's own is showing.
    h.classList.toggle('settled', pr >= 0.06)
    h.classList.toggle('has-cta', !!at && at.beats.some(t => t.on && t.cta))
    if (at !== cur) {
      cur = at
      for (const a of rail) a.toggleAttribute('aria-current', !!at && a.hash === '#' + at.id)
    }
  }
  const tick = () => { if (!raf) raf = requestAnimationFrame(frame) }

  /* One scrubbed proxy per chapter. After the scroll stops it settles softly
     on the next rest in the direction of travel, and only if that rest is
     close (a tenth of the chapter); never against the direction, never when
     there is no rest ahead. Nothing is blocked. */
  const drive = () => {
    if (!libs) return
    const { gsap } = libs
    const scrub = touch ? 0.6 : 0.9
    for (const c of C) {
      const o = { v: 0 }
      const R = c.stops
      c.tl = gsap.timeline({
        scrollTrigger: {
          trigger: c.el, start: 'top top', end: () => '+=' + Math.max(1, c.el.offsetHeight - C[0].st.offsetHeight), scrub,
          snap: R.length ? {
            snapTo: (v: number, self?: ScrollTrigger) => {
              const s = (self?.direction ?? 1) > 0 ? R.find(r => r > v + 0.002) : [...R].reverse().find(r => r < v - 0.002)
              return s !== undefined && Math.abs(s - v) < 0.1 ? s : v
            },
            delay: 0.25, duration: { min: 0.3, max: 0.8 }, ease: 'power2.inOut', inertia: false,
          } : undefined,
        },
      })
      c.tl.to(o, { v: 1, duration: 1, ease: 'none', onUpdate: () => apply(c, o.v) })
      R.forEach((r, i) => c.tl!.addLabel('r' + i, r))
      apply(c, 0)
    }
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

  /* Scrolling to a place goes through Lenis when it runs: anchors land on
     data-rest, focus on its beat. */
  const to = (y: number) => (lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: 'instant' }))
  const goto = (c: Chapter, at: number) => to(c.top + c.pin * at + 2)
  const restOf = (c: Chapter) => (isNaN(c.rest) ? 0 : c.rest)
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
    const at = b ? b.at + 0.02 : restOf(c)
    const pr = (scrollY - c.top) / c.pin
    if (pr < at - 0.001 || pr > 1) requestAnimationFrame(() => goto(c, Math.min(1, at)))
  }
  // Keys: page down, space and arrow down go to the next rest; up to the previous.
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement
    if (!lenis || e.altKey || e.ctrlKey || e.metaKey || d.body.style.overflow === 'hidden' || /INPUT|TEXTAREA|SELECT|BUTTON/.test(t.tagName) || t.isContentEditable) return
    const k = e.key
    const dn = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)
    const up = k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)
    if (!dn && !up) return
    const y = scrollY
    const s = dn ? S.find(s => s > y + 4) : [...S].reverse().find(s => s < y - 4)
    if (s === undefined) return
    e.preventDefault()
    to(s)
  }
  // The menu locks the page (MobileNav sets the body's overflow): Lenis stops while it is open.
  const menu = new MutationObserver(() => { if (lenis) { if (d.body.style.overflow === 'hidden') lenis.stop(); else lenis.start() } })

  const onResize = () => { measure(); fit(); if (lib) libs!.ScrollTrigger.refresh() }
  const onIdle = () => { idle = true; planes(C[0]) }
  const onLoad = () => {
    measure()
    if (lib) libs!.ScrollTrigger.refresh()
    idleId = typeof requestIdleCallback === 'function' ? requestIdleCallback(onIdle, { timeout: 3000 }) : window.setTimeout(onIdle, 1500)
  }
  // A theme change lays out the other theme's pictures and swaps the hero's planes.
  const themes = new MutationObserver(() => requestAnimationFrame(() => { measure(); fit(); reset() }))

  // A chapter the browser had skipped letters its boards, and has its animations, once it renders.
  const onShown = (e: Event) => {
    if ((e as Event & { skipped?: boolean }).skipped) return
    fit()
    const c = C.find(c => c.el === e.currentTarget)
    if (c) { c.an = null; if (lib) apply(c, c.v || 0) }
  }
  for (const c of C) c.el.addEventListener('contentvisibilityautostatechange', onShown)
  for (const i of inputs) i.addEventListener('input', onInput)
  d.addEventListener('click', onClick)
  d.addEventListener('focusin', onFocus)
  addEventListener('keydown', onKey)
  addEventListener('scroll', tick, { passive: true })
  addEventListener('resize', onResize)
  addEventListener('load', onLoad)
  WIDE.addEventListener('change', reset)
  themes.observe(h, { attributes: true, attributeFilter: ['data-theme'] })
  menu.observe(d.body, { attributes: true, attributeFilter: ['style'] })
  let live = true
  d.fonts?.ready.then(() => { if (live) onResize() })

  measure()
  load(C[0])
  if (lib) drive()
  if (d.readyState === 'complete') onLoad()
  let saved = ''
  try { saved = sessionStorage.getItem(NAME_KEY) || '' } catch {}
  if (saved) { for (const i of inputs) i.value = saved; name(saved) } else fit()
  const hash = byHash(location.hash)
  if (hash && story && !libs) goto(hash, restOf(hash))

  return (keepMode = false) => {
    live = false
    if (raf) cancelAnimationFrame(raf)
    for (const c of C) {
      c.el.removeEventListener('contentvisibilityautostatechange', onShown)
      if (c.tl) { c.tl.scrollTrigger?.kill(); c.tl.kill() }
    }
    if (libs && tickLenis) libs.gsap.ticker.remove(tickLenis)
    lenis?.destroy()
    for (const i of inputs) i.removeEventListener('input', onInput)
    d.removeEventListener('click', onClick)
    d.removeEventListener('focusin', onFocus)
    removeEventListener('keydown', onKey)
    removeEventListener('scroll', tick)
    removeEventListener('resize', onResize)
    removeEventListener('load', onLoad)
    WIDE.removeEventListener('change', reset)
    if (idleId) { if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idleId); clearTimeout(idleId) }
    themes.disconnect()
    menu.disconnect()
    if (keepMode) return
    h.classList.remove(...FILM_ROOT_CLASSES)
    for (const a of FILM_ROOT_ATTRIBUTES) h.removeAttribute(a)
  }
}
