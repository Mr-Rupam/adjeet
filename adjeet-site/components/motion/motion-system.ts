'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

/** Shared values keep the page and route entrances feeling like one system. */
export const MOTION = {
  entranceEase: 'power3.out',
  headingDuration: 0.74,
  headingStagger: 0.08,
  scriptDuration: 0.82,
  bodyDuration: 0.48,
  imageDuration: 0.82,
  bodyDistance: 10,
  desktopQuery: '(min-width: 1024px)',
  reduceQuery: '(prefers-reduced-motion: reduce)',
} as const

/** Keep controls exposed to keyboard and assistive navigation before scrolling. */
export function createBodyReveal(target: HTMLElement, start = 'top 86%') {
  if (target.matches('form') || target.querySelector('form')) return
  const controls = 'a[href], button, input, select, textarea, summary, [tabindex]'
  const interactive = target.matches(controls) || target.querySelector(controls) !== null

  return gsap.from(target, {
    opacity: interactive ? 1 : 0,
    y: MOTION.bodyDistance,
    duration: MOTION.bodyDuration,
    ease: MOTION.entranceEase,
    scrollTrigger: { trigger: target, start, once: true },
  })
}

/**
 * Fonts can resolve after first paint. Refreshing the triggers then keeps
 * entrance points aligned without blocking visible server-rendered content.
 */
export function refreshScrollTriggersAfterLayout() {
  let active = true
  const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh())
  const fontsReady = document.fonts?.ready

  void fontsReady?.then(
    () => { if (active) ScrollTrigger.refresh() },
    () => { /* A failed optional font must not make motion fail. */ },
  )

  return () => {
    active = false
    window.cancelAnimationFrame(frame)
  }
}

interface MaskedLineRevealOptions {
  trigger?: HTMLElement
  start?: string
  delay?: number
  lines?: (lines: HTMLElement[]) => HTMLElement[]
}

function originalRenderedText(target: HTMLElement) {
  const clone = target.cloneNode(true) as HTMLElement
  clone.querySelectorAll('br').forEach(lineBreak => lineBreak.replaceWith(document.createTextNode(' ')))
  return (target.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim()
}

/**
 * Splits only ordinary headings. SplitText owns its masks and re-splits after
 * fonts or layout settle; teardown restores the exact semantic source markup.
 */
export function createMaskedLineReveal(target: HTMLElement, options: MaskedLineRevealOptions = {}) {
  let active = true
  let refreshFrame: number | undefined
  const previousAriaLabel = target.getAttribute('aria-label')
  const accessibleName = originalRenderedText(target)
  if (previousAriaLabel === null && accessibleName) target.setAttribute('aria-label', accessibleName)
  const split = SplitText.create(target, {
    type: 'lines',
    mask: 'lines',
    // We preserve the rendered source name ourselves. SplitText's automatic
    // label uses textContent, which joins words separated by a <br />.
    aria: 'none',
    autoSplit: true,
    onSplit(current) {
      const allLines = current.lines as HTMLElement[]
      const lines = options.lines ? options.lines(allLines) : allLines
      if (!active || lines.length === 0) return

      refreshFrame = window.requestAnimationFrame(() => {
        if (active) ScrollTrigger.refresh()
      })

      return gsap.from(lines, {
        autoAlpha: 0,
        yPercent: 105,
        duration: MOTION.headingDuration,
        stagger: lines.length > 1 ? MOTION.headingStagger : 0,
        delay: options.delay,
        ease: MOTION.entranceEase,
        scrollTrigger: options.trigger
          ? { trigger: options.trigger, start: options.start ?? 'top 86%', once: true }
          : undefined,
      })
    },
  })

  return () => {
    active = false
    if (refreshFrame !== undefined) window.cancelAnimationFrame(refreshFrame)
    split.kill()
    split.revert()
    if (previousAriaLabel === null) target.removeAttribute('aria-label')
    else target.setAttribute('aria-label', previousAriaLabel)
  }
}

/**
 * The hero's script stays outside its mask so the Pristina swash has its full
 * line box. Ordinary headings use SplitText above; this wraps only the plain
 * first text node and restores it exactly on cleanup.
 */
export function createHeroHeadlineReveal(target: HTMLElement) {
  const textNode = Array.from(target.childNodes).find(
    node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  )
  if (!textNode) return () => undefined

  const mask = document.createElement('span')
  const line = document.createElement('span')
  mask.style.cssText = 'display:inline-block; overflow:clip; vertical-align:top;'
  line.style.display = 'block'
  line.textContent = textNode.textContent
  mask.appendChild(line)
  target.replaceChild(mask, textNode)

  const animation = gsap.from(line, {
    autoAlpha: 0,
    yPercent: 105,
    duration: MOTION.headingDuration,
    delay: 0.16,
    ease: MOTION.entranceEase,
  })

  return () => {
    animation.revert()
    target.replaceChild(textNode, mask)
  }
}

export { gsap, ScrollTrigger }
