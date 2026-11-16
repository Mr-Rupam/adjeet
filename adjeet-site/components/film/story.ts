/**
 * The home film's engine (DESIGN.md, "Home film"), ported from the storyboard
 * prototype's engine/story.js. It computes each chapter's progress `--p` for
 * the requestAnimationFrame driver, switches beats (`.on` once `--p` passes an
 * element's `--at`), loads a chapter's lazy pictures when the one before it
 * pins, fits the visitor's name to every board, follows focus and anchors, and
 * writes the current chapter and its tone on <html> for the header, the rail
 * and the dock. `startStory` returns its teardown: every listener removed and
 * everything it set on <html> taken off, so leaving the page and coming back
 * starts clean.
 */

import { DEFAULT_SHOP_NAME, SHOP_NAME_MAX } from '@/content/shop-name'

/** Classes and attributes the film sets on <html>. */
export const FILM_ROOT_CLASSES = ['story', 'drv-native', 'drv-js', 'settled', 'has-cta'] as const
export const FILM_ROOT_ATTRIBUTES = ['data-film-ch', 'data-film-tone'] as const
/** Session storage only: the name never leaves the device. */
export const NAME_KEY = 'adj-name'

type Beat = { b: HTMLElement; at: number; off: number; on: boolean; cta: boolean; pl: boolean }
type Stack = HTMLElement & { t?: number }
type Chapter = {
  el: HTMLElement; id: string; st: HTMLElement; rest: number; beats: Beat[]
  top: number; pin: number; H: number; ld?: boolean; was?: boolean
}

export function startStory(film: HTMLElement): () => void {
  const d = document
  const h = d.documentElement
  const all = <T extends Element = HTMLElement>(s: string, e: ParentNode = film) => [...e.querySelectorAll<T>(s)]
  const story = h.classList.contains('story')
  const js = h.classList.contains('drv-js')
  // Beats are written inline, so they are read from the style attribute: no style recalculation.
  const num = (e: HTMLElement, k: string) => parseFloat(e.style.getPropertyValue(k))
  const C: Chapter[] = all('.ch').map(el => ({
    el, id: el.id, st: el.querySelector<HTMLElement>('.stage')!,
    rest: parseFloat(el.dataset.rest ?? ''),
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

  /* Depth planes: fetched only in the film, never with Save-Data; the hero's
     only once the page has loaded and gone idle. .ready once all decoded. */
  const WIDE = matchMedia('(min-width: 1024px) and (min-aspect-ratio: 5/4)')
  const save = !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  const planes = (c?: Chapter) => {
    if (!story || save || !c || (c === C[0] && !idle)) return
    for (const s of all<Stack>('.planes', c.el)) {
      if (s.t) continue
      const k = WIDE.matches ? 'srcw' : 'src'
      const n = h.dataset.theme === 'dark'
      const t = (s.t = ++tok)
      const imgs = all<HTMLImageElement>('.pl', s)
      for (const i of imgs) i.src = (n && i.dataset[k + 'N']) || i.dataset[k] || ''
      Promise.all(imgs.map(i => i.decode())).then(() => { if (s.t === t) s.classList.add('ready') }, () => {})
    }
  }
  const reset = () => {
    for (const s of all<Stack>('.planes')) { s.t = 0; s.classList.remove('ready') }
    for (const c of C) if (c.ld) planes(c)
  }

  const measure = () => {
    const y = scrollY
    for (const c of C) {
      c.top = c.el.getBoundingClientRect().top + y
      c.pin = Math.max(1, c.el.offsetHeight - c.st.offsetHeight)
      c.H = c.st.offsetHeight
    }
    frame()
  }
  const load = (c?: Chapter) => {
    // Nothing after the hero starts loading before the page has: the hero's
    // picture keeps the network to itself (the load event measures again).
    if (!c || c.ld || (c !== C[0] && d.readyState !== 'complete')) return
    c.ld = true
    c.el.classList.add('ld')
    // Only pictures that are laid out: the other theme's or size's copy stays unfetched.
    for (const i of all<HTMLImageElement>('img[loading=lazy]:not([data-keep-lazy])', c.el)) if (i.getClientRects().length) i.loading = 'eager'
    planes(c)
  }

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
      c.el.classList.toggle('near', near)
      if (!near && !c.was) continue
      c.was = near
      if (story && js) c.el.style.setProperty('--p', p.toFixed(4))
      if (near) { load(c); if (r >= 0) load(C[i + 1]) }
      for (const t of c.beats) {
        const on = story ? (t.on ? pr >= t.at - 0.015 : pr >= t.at) && pr < t.off : true
        if (on !== t.on) {
          t.on = on
          if (on && t.pl) t.b.classList.toggle('late', !t.b.classList.contains('ready'))
          t.b.classList.toggle('on', on)
        }
      }
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
    h.setAttribute('data-film-ch', at ? at.id : 'after')
    h.setAttribute('data-film-tone', tone || 'page')
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

  /* Scroll to a chapter's beat: anchors land on data-rest, focus on its beat. */
  const goto = (c: Chapter, at: number) => scrollTo({ top: c.top + c.pin * at + 2, behavior: 'instant' })
  const restOf = (c: Chapter) => (isNaN(c.rest) ? 0 : c.rest)
  const byHash = (hash: string) => C.find(c => '#' + c.id === hash)
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
    const c = a && a.hash.length > 1 ? byHash(a.hash) : undefined
    if (c && story) { e.preventDefault(); goto(c, restOf(c)); history.replaceState(history.state, '', a!.hash) }
  }
  const onFocus = (e: FocusEvent) => {
    if (!story) return
    const c = C.find(c => c.el.contains(e.target as Node))
    if (!c) return
    const b = c.beats.filter(t => t.b.contains(e.target as Node)).pop()
    const at = b ? b.at + 0.02 : restOf(c)
    const pr = (scrollY - c.top) / c.pin
    if (pr < at - 0.001 || pr > 1) requestAnimationFrame(() => goto(c, Math.min(1, at)))
  }
  const onResize = () => { measure(); fit() }
  const onIdle = () => { idle = true; planes(C[0]) }
  const onLoad = () => {
    measure()
    idleId = typeof requestIdleCallback === 'function' ? requestIdleCallback(onIdle, { timeout: 3000 }) : window.setTimeout(onIdle, 1500)
  }
  // A theme change lays out the other theme's pictures and swaps the hero's planes.
  const themes = new MutationObserver(() => requestAnimationFrame(() => { onResize(); reset() }))

  for (const i of inputs) i.addEventListener('input', onInput)
  d.addEventListener('click', onClick)
  d.addEventListener('focusin', onFocus)
  addEventListener('scroll', tick, { passive: true })
  addEventListener('resize', onResize)
  addEventListener('load', onLoad)
  if (d.readyState === 'complete') onLoad()
  WIDE.addEventListener('change', reset)
  themes.observe(h, { attributes: true, attributeFilter: ['data-theme'] })
  let live = true
  d.fonts?.ready.then(() => { if (live) onResize() })

  measure()
  load(C[0])
  let saved = ''
  try { saved = sessionStorage.getItem(NAME_KEY) || '' } catch {}
  if (saved) { for (const i of inputs) i.value = saved; name(saved) } else fit()
  const hash = byHash(location.hash)
  if (hash && story) goto(hash, restOf(hash))

  return () => {
    live = false
    if (raf) cancelAnimationFrame(raf)
    for (const i of inputs) i.removeEventListener('input', onInput)
    d.removeEventListener('click', onClick)
    d.removeEventListener('focusin', onFocus)
    removeEventListener('scroll', tick)
    removeEventListener('resize', onResize)
    removeEventListener('load', onLoad)
    WIDE.removeEventListener('change', reset)
    if (idleId) { if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idleId); clearTimeout(idleId) }
    themes.disconnect()
    h.classList.remove(...FILM_ROOT_CLASSES)
    for (const a of FILM_ROOT_ATTRIBUTES) h.removeAttribute(a)
  }
}
