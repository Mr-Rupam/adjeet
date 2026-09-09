'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useTheme } from '@/lib/use-theme'
import {
  DUSK_FRAME,
  FRAME_COUNT,
  LAST_FRAME,
  TRANSITION_MS,
  coverRect,
  framePair,
  nearestLoaded,
  pickWidth,
  scrollFrame,
  tweenDone,
  tweenFrame,
} from '@/lib/sky'

/**
 * The sky behind the hero: the workshop gate, filmed once, from full daylight
 * through to a lit sign at night.
 *
 * Delivered as 24 stills cross-faded on a canvas rather than as a <video>,
 * because the whole point is that the visitor scrubs it with their thumb, and
 * scrubbing a video stutters badly on iOS Safari. Drawing two adjacent frames
 * with a fractional alpha means 24 keyframes read as continuous, so one asset
 * serves both the scroll scrub and the toggle transition.
 *
 * Day theme  : scrolling the hero sets the sun, stopping at dusk (DUSK_FRAME).
 * Night theme: holds at full night regardless of scroll.
 *
 * The arithmetic lives in lib/sky.ts and is unit tested there, because it only
 * ever executes inside requestAnimationFrame and rAF is suspended in hidden
 * tabs and in headless automation.
 */
export function StreetSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useTheme()
  const reduceMotion = useReducedMotion()

  const api = useRef<{ flipTo: (frame: number, animate: boolean) => void } | null>(null)

  /**
   * Read live rather than as an effect dependency. `useReducedMotion` resolves
   * null -> false on the first commit, and letting that tear down and rebuild
   * the canvas cost a second frame load for no benefit.
   */
  const reduceMotionRef = useRef(false)
  useEffect(() => {
    reduceMotionRef.current = Boolean(reduceMotion)
  }, [reduceMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let disposed = false
    let ready = false
    let current = 0
    let target = 0
    let rafId: number | null = null
    let tween: { from: number; to: number; start: number } | null = null
    const frames: HTMLImageElement[] = []
    const width = pickWidth(window.innerWidth, window.devicePixelRatio)

    const loadedMask = () =>
      Array.from({ length: FRAME_COUNT }, (_, i) => Boolean(frames[i]))

    function paint(index: number) {
      if (!ready) return
      const el = canvasRef.current
      if (!el || !ctx) return
      const { lo, hi, alpha } = framePair(index)
      // Frames arrive progressively, so fall back to the nearest decoded
      // neighbour rather than drawing nothing: an early scroll must degrade to
      // a coarser scrub, never to a frozen sky.
      const loaded = loadedMask()
      const base = frames[lo] ?? frames[nearestLoaded(lo, loaded)]
      if (!base) return

      const { dx, dy, dw, dh } = coverRect(
        el.width,
        el.height,
        base.naturalWidth,
        base.naturalHeight
      )

      ctx.globalAlpha = 1
      ctx.drawImage(base, dx, dy, dw, dh)

      const upper = frames[hi]
      if (alpha > 0.001 && upper && upper !== base) {
        ctx.globalAlpha = alpha
        ctx.drawImage(upper, dx, dy, dw, dh)
        ctx.globalAlpha = 1
      }
    }

    function resize() {
      const el = canvasRef.current
      if (!el) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = el.getBoundingClientRect()
      el.width = Math.max(1, Math.round(rect.width * dpr))
      el.height = Math.max(1, Math.round(rect.height * dpr))
      paint(current)
    }

    /** Where the sun should sit right now, given theme and scroll. */
    function restingTarget() {
      if (document.documentElement.getAttribute('data-theme') === 'dark') {
        return LAST_FRAME
      }
      if (reduceMotionRef.current) return 0
      const el = canvasRef.current
      if (!el) return 0
      const rect = el.getBoundingClientRect()
      return scrollFrame(rect.top, rect.height, DUSK_FRAME)
    }

    function tick() {
      rafId = null
      if (tween) {
        const elapsed = performance.now() - tween.start
        current = tweenFrame(tween.from, tween.to, elapsed, TRANSITION_MS)
        paint(current)
        if (!tweenDone(elapsed, TRANSITION_MS)) {
          rafId = requestAnimationFrame(tick)
        } else {
          tween = null
          target = current
        }
        return
      }
      if (Math.abs(current - target) > 0.01) {
        current = target
        paint(current)
      }
    }

    function schedule() {
      if (rafId == null) rafId = requestAnimationFrame(tick)
    }

    function onScroll() {
      if (tween) return // a deliberate flip outranks the scroll
      target = restingTarget()
      schedule()
    }

    /**
     * rAF is suspended while the tab is hidden, so a flip started just before
     * the user switches away would otherwise sit half-finished forever, and
     * onScroll's `if (tween) return` would leave the scrub permanently dead on
     * their return. Land the flip on the way out instead.
     */
    function onVisibility() {
      if (document.hidden) {
        if (tween) {
          current = tween.to
          target = tween.to
          tween = null
        }
        return
      }
      if (!tween) target = restingTarget()
      current = target
      paint(current)
    }

    api.current = {
      flipTo(frame, animate) {
        if (!ready) {
          current = frame
          target = frame
          return
        }
        if (animate && !document.hidden) {
          tween = { from: current, to: frame, start: performance.now() }
        } else {
          tween = null
          current = frame
          target = frame
          paint(current)
        }
        schedule()
      },
    }

    const load = (i: number) =>
      new Promise<void>(resolve => {
        const img = new Image()
        img.decoding = 'async'
        // Handlers before src, and an explicit `complete` check after: a cached
        // image can finish loading before a handler assigned afterwards is ever
        // attached, which strands the promise and leaves the canvas frozen.
        img.onload = () => {
          frames[i] = img
          resolve()
        }
        img.onerror = () => resolve() // a missing frame degrades, never throws
        img.src = `/hero/seq/${width}/${String(i).padStart(2, '0')}.avif`
        if (img.complete && img.naturalWidth > 0) {
          frames[i] = img
          resolve()
        }
      })

    void (async () => {
      await load(0)
      if (disposed || !frames[0]) return
      // Paint the moment the first frame exists, then fill in the rest.
      ready = true
      current = restingTarget()
      target = current
      resize()
      await Promise.all(Array.from({ length: LAST_FRAME }, (_, k) => load(k + 1)))
      if (disposed) return
      paint(current)
    })()

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    // A ResizeObserver, not a window resize listener: the hero's box changes
    // when web fonts land and when the address bar collapses on mobile, and
    // neither fires a window resize. Missing those left the backing store
    // sized to a stale layout and the footage visibly soft.
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas)

    return () => {
      disposed = true
      api.current = null
      if (rafId != null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
    }
  }, [])

  // Cold start needs no handshake: the setup effect reads the live data-theme
  // off the document once frames land, so the first paint is already correct.
  // This only has to carry later flips.
  useEffect(() => {
    api.current?.flipTo(theme === 'dark' ? LAST_FRAME : 0, !reduceMotion)
  }, [theme, reduceMotion])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="street-sky h-full w-full" />
      {/* Holds hero type legible over footage that swings from bright sky to
          night. Token-driven, so it inverts with the theme instead of fighting it. */}
      <div className="street-sky-scrim absolute inset-0" />
    </div>
  )
}
