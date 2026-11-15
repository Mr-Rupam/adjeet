'use client'

/**
 * The site's scroll motion, built on the browser's own Web Animations API and
 * IntersectionObserver instead of GSAP. GSAP and ScrollTrigger used to load and
 * run on every page before it was interactive (about 0.4 s of main thread on a
 * mid-range phone, 1 s on the homepage). These helpers keep the same moves, the
 * same easing and the same trigger lines at a fraction of that cost.
 *
 * Every reveal works like `gsap.from()`: the element is held in its starting
 * pose while it waits below the fold, plays to its own styles when it reaches
 * its trigger line, then lets go so nothing is left inline.
 */

/** GSAP's eases as CSS curves. power3 is a quartic curve, power4 a quintic one. */
export const EASE = {
  out3: 'cubic-bezier(0.25, 1, 0.5, 1)',
  out4: 'cubic-bezier(0.22, 1, 0.36, 1)',
  inOut3: 'cubic-bezier(0.76, 0, 0.24, 1)',
} as const

/** Shared values keep the page and route entrances feeling like one system. */
export const MOTION = {
  headingDuration: 0.74,
  headingStagger: 0.08,
  desktopQuery: '(min-width: 768px)',
  reduceQuery: '(prefers-reduced-motion: reduce)',
} as const

export function motionIsReduced() {
  return window.matchMedia(MOTION.reduceQuery).matches
}

export interface RevealOptions {
  /** The starting pose. The end pose is the element's own computed style. */
  from: Keyframe
  /** Needed only for properties that cannot blend with `none`, such as clip-path. */
  to?: Keyframe
  /** Seconds, as in the GSAP calls this replaced. */
  duration: number
  delay?: number
  ease?: string
  onComplete?: () => void
}

export interface Reveal {
  play: () => void
  cancel: () => void
}

/** Holds `element` at `from` until `play()`, then animates to its own styles. */
export function holdFrom(element: HTMLElement, options: RevealOptions): Reveal {
  const keyframes = options.to ? [options.from, options.to] : [{ ...options.from, offset: 0 }]
  let animation: Animation | null = null
  try {
    animation = element.animate(keyframes, {
      duration: options.duration * 1000,
      delay: (options.delay ?? 0) * 1000,
      easing: options.ease ?? EASE.out3,
      fill: 'backwards',
    })
    animation.pause()
  } catch {
    // A browser without WAAPI simply shows the element as it is.
    animation = null
  }
  let played = false
  return {
    play() {
      if (played) return
      played = true
      if (!animation) { options.onComplete?.(); return }
      animation.onfinish = () => {
        animation?.cancel()
        options.onComplete?.()
      }
      animation.play()
    },
    cancel() {
      animation?.cancel()
    },
  }
}

/**
 * Calls `onEnter` once, when the top of each element crosses `startPercent` of
 * the viewport height (ScrollTrigger's `start: 'top 89%'`). The observed area
 * reaches far above the viewport, so anything already scrolled past, after a
 * Back navigation or an anchor jump, also fires instead of waiting forever.
 */
export function createEnterWatcher() {
  const observers = new Map<number, IntersectionObserver>()
  const callbacks = new Map<Element, () => void>()

  const observerFor = (startPercent: number) => {
    let observer = observers.get(startPercent)
    if (!observer) {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer?.unobserve(entry.target)
          const callback = callbacks.get(entry.target)
          callbacks.delete(entry.target)
          callback?.()
        }
      }, { rootMargin: `100000px 0px ${startPercent - 100}% 0px` })
      observers.set(startPercent, observer)
    }
    return observer
  }

  return {
    watch(element: Element, startPercent: number, onEnter: () => void) {
      if (typeof IntersectionObserver === 'undefined') { onEnter(); return }
      const previous = callbacks.get(element)
      callbacks.set(element, previous ? () => { previous(); onEnter() } : onEnter)
      observerFor(startPercent).observe(element)
    },
    disconnect() {
      observers.forEach(observer => observer.disconnect())
      observers.clear()
      callbacks.clear()
    },
  }
}

export type EnterWatcher = ReturnType<typeof createEnterWatcher>

/** A reveal held now and played when `trigger` crosses its line. */
export function revealOnEnter(
  watcher: EnterWatcher,
  element: HTMLElement,
  options: RevealOptions & { trigger?: Element; start: number },
): Reveal {
  const reveal = holdFrom(element, options)
  watcher.watch(options.trigger ?? element, options.start, reveal.play)
  return reveal
}

/** Several elements that start together, each `stagger` seconds after the last. */
export function staggerOnEnter(
  watcher: EnterWatcher,
  elements: ArrayLike<HTMLElement>,
  options: RevealOptions & { stagger: number; trigger?: Element; start: number },
): Reveal[] {
  const list = Array.from(elements)
  if (!list.length) return []
  const reveals = list.map((element, index) => holdFrom(element, {
    ...options, delay: (options.delay ?? 0) + index * options.stagger,
  }))
  watcher.watch(options.trigger ?? list[0], options.start, () => reveals.forEach(reveal => reveal.play()))
  return reveals
}

function originalRenderedText(target: HTMLElement) {
  const clone = target.cloneNode(true) as HTMLElement
  clone.querySelectorAll('br').forEach(lineBreak => lineBreak.replaceWith(document.createTextNode(' ')))
  return (target.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim()
}

/**
 * Splits a heading into its rendered lines, each inside a clipping mask. Inline
 * wrappers such as a coloured `<span>` are copied onto every line they cover.
 * The heading's own nodes are set aside untouched and put back by `revert()`,
 * so React keeps the exact nodes it rendered.
 */
export function splitLines(target: HTMLElement) {
  const originals = Array.from(target.childNodes)
  const words: HTMLElement[] = []

  const wrapWords = (node: Node): Node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment()
      for (const part of (node.textContent ?? '').split(/(\s+)/)) {
        if (!part) continue
        if (/^\s+$/.test(part)) { fragment.append(document.createTextNode(' ')); continue }
        const word = document.createElement('span')
        word.textContent = part
        words.push(word)
        fragment.append(word)
      }
      return fragment
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const copy = element.cloneNode(false) as Element
      if (element.tagName !== 'BR') element.childNodes.forEach(child => copy.append(wrapWords(child)))
      return copy
    }
    return node.cloneNode(true)
  }

  const measured = document.createDocumentFragment()
  originals.forEach(node => measured.append(wrapWords(node)))
  target.replaceChildren(measured)

  const grouped: HTMLElement[][] = []
  let lineTop = Number.NEGATIVE_INFINITY
  for (const word of words) {
    const box = word.getBoundingClientRect()
    if (box.top > lineTop + Math.max(1, box.height * 0.5)) {
      grouped.push([])
      lineTop = box.top
    }
    grouped[grouped.length - 1].push(word)
  }

  const output = document.createDocumentFragment()
  const lines: HTMLElement[] = []
  for (const lineWords of grouped) {
    const mask = document.createElement('span')
    mask.style.cssText = 'display:block; overflow:clip;'
    const line = document.createElement('span')
    line.style.display = 'block'
    mask.append(line)
    output.append(mask)
    lines.push(line)

    let owners: Element[] = []
    let copies: Element[] = []
    lineWords.forEach((word, index) => {
      const ancestors: Element[] = []
      for (let parent = word.parentElement; parent && parent !== target; parent = parent.parentElement) ancestors.unshift(parent)
      let shared = 0
      while (shared < ancestors.length && shared < owners.length && ancestors[shared] === owners[shared]) shared++
      owners = owners.slice(0, shared)
      copies = copies.slice(0, shared)
      for (let depth = shared; depth < ancestors.length; depth++) {
        const copy = ancestors[depth].cloneNode(false) as Element
        ;(copies[depth - 1] ?? line).append(copy)
        owners.push(ancestors[depth])
        copies.push(copy)
      }
      const host = copies[copies.length - 1] ?? line
      if (index > 0) host.append(document.createTextNode(' '))
      host.append(word)
    })
  }
  target.replaceChildren(output)

  return { lines, revert: () => target.replaceChildren(...originals) }
}

interface MaskedLineRevealOptions {
  /** Plays at once when absent, as the masthead heading does. */
  start?: number
  trigger?: Element
  delay?: number
}

/**
 * Desktop headings rise line by line out of a mask. The heading waits hidden
 * below the fold and is split only when it is about to play, after fonts have
 * usually settled, then restored to its own markup when the lines land.
 */
export function maskedLineReveal(watcher: EnterWatcher, target: HTMLElement, options: MaskedLineRevealOptions = {}) {
  let active = true
  let animations: Animation[] = []
  let restore: (() => void) | null = null
  const previousOpacity = target.style.opacity
  const previousAriaLabel = target.getAttribute('aria-label')
  target.style.opacity = '0'

  const finish = () => {
    restore?.()
    restore = null
    if (previousAriaLabel === null) target.removeAttribute('aria-label')
    else target.setAttribute('aria-label', previousAriaLabel)
    target.style.opacity = previousOpacity
  }

  const play = () => {
    if (!active) return
    const accessibleName = originalRenderedText(target)
    if (previousAriaLabel === null && accessibleName) target.setAttribute('aria-label', accessibleName)
    const { lines, revert } = splitLines(target)
    restore = revert
    target.style.opacity = previousOpacity
    if (!lines.length) { finish(); return }
    const stagger = lines.length > 1 ? MOTION.headingStagger : 0
    try {
      animations = lines.map((line, index) => line.animate(
        [{ transform: 'translateY(105%)', opacity: 0, offset: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: MOTION.headingDuration * 1000, delay: ((options.delay ?? 0) + index * stagger) * 1000, easing: EASE.out3, fill: 'backwards' },
      ))
    } catch {
      finish()
      return
    }
    void Promise.all(animations.map(animation => animation.finished)).then(
      () => { if (active) finish() },
      () => { /* Cancelled by a route change; the cleanup restores the heading. */ },
    )
  }

  if (options.start === undefined) play()
  else watcher.watch(options.trigger ?? target, options.start, play)

  return () => {
    active = false
    animations.forEach(animation => animation.cancel())
    finish()
  }
}

/** Adds a class once `element` crosses its line, as `ScrollTrigger.create({ onEnter })` did. */
export function classOnEnter(watcher: EnterWatcher, element: HTMLElement, className: string, start: number) {
  watcher.watch(element, start, () => element.classList.add(className))
}
