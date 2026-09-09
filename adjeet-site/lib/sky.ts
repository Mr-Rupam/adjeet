/**
 * Pure maths for the hero sky scrub.
 *
 * Kept out of the component so it can be tested directly: the animation only
 * runs inside requestAnimationFrame, which is suspended in hidden tabs and in
 * headless automation, so driving it through a real browser is not a reliable
 * way to prove the numbers are right.
 */

/** Total stills in the sequence. Frame 0 is full daylight, 23 is lit night. */
export const FRAME_COUNT = 24
export const LAST_FRAME = FRAME_COUNT - 1

/**
 * Scrolling in day mode carries the sun this far and no further. True night is
 * reserved for a deliberate flip of the switch, so the footage never contradicts
 * the light UI painted over it.
 */
export const DUSK_FRAME = 14

/** How long a deliberate flip takes to walk the sun to its new resting place. */
export const TRANSITION_MS = 1100

export function easeInOut(t: number): number {
  const c = Math.min(Math.max(t, 0), 1)
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2
}

/**
 * How far the hero has been scrolled past, 0 to 1.
 * `top` is the element's viewport-relative top edge, as getBoundingClientRect
 * reports it: positive while the hero is still below the top of the viewport,
 * negative once it has begun to leave.
 */
export function scrollProgress(top: number, height: number): number {
  const travel = height || 1
  return Math.min(Math.max(-top / travel, 0), 1)
}

/** The frame the scroll position alone asks for, in day mode. */
export function scrollFrame(top: number, height: number, dusk = DUSK_FRAME): number {
  return scrollProgress(top, height) * dusk
}

/** Where a running flip has got to. */
export function tweenFrame(
  from: number,
  to: number,
  elapsedMs: number,
  durationMs = TRANSITION_MS
): number {
  const p = durationMs <= 0 ? 1 : Math.min(elapsedMs / durationMs, 1)
  return from + (to - from) * easeInOut(p)
}

/** Whether a flip started `elapsedMs` ago has finished. */
export function tweenDone(elapsedMs: number, durationMs = TRANSITION_MS): boolean {
  return elapsedMs >= durationMs
}

/**
 * The pair of frames to composite for a fractional index, and the alpha the
 * upper one is drawn at. Cross-fading the pair is what lets 24 stills read as
 * continuous motion.
 */
export function framePair(index: number): { lo: number; hi: number; alpha: number } {
  const clamped = Math.min(Math.max(index, 0), LAST_FRAME)
  const lo = Math.floor(clamped)
  const hi = Math.min(Math.ceil(clamped), LAST_FRAME)
  return { lo, hi, alpha: clamped - lo }
}

/**
 * The closest frame that has actually decoded, searching outward from `index`.
 * Returns -1 when nothing has loaded yet.
 *
 * Without this the scrub freezes: frames arrive progressively, so a visitor who
 * scrolls the moment the first frame paints asks for a frame that does not
 * exist yet, and drawing nothing leaves the sky stuck until the whole sequence
 * lands. Snapping to the nearest neighbour degrades to a coarser scrub instead,
 * which on a slow connection is the difference between stiff and broken.
 */
export function nearestLoaded(index: number, loaded: readonly boolean[]): number {
  const start = Math.min(Math.max(Math.round(index), 0), loaded.length - 1)
  if (loaded[start]) return start
  for (let step = 1; step < loaded.length; step++) {
    const below = start - step
    const above = start + step
    if (below >= 0 && loaded[below]) return below
    if (above < loaded.length && loaded[above]) return above
  }
  return -1
}

/** Cover-fit geometry, matching object-fit: cover. */
export function coverRect(
  canvasW: number,
  canvasH: number,
  imgW: number,
  imgH: number
): { dx: number; dy: number; dw: number; dh: number } {
  const scale = Math.max(canvasW / imgW, canvasH / imgH)
  const dw = imgW * scale
  const dh = imgH * scale
  return { dx: (canvasW - dw) / 2, dy: (canvasH - dh) / 2, dw, dh }
}

/** Which encode to pull: the 640px set is enough below ~820 CSS px. */
export function pickWidth(viewportW: number, dpr: number): 640 | 1280 {
  return viewportW * Math.min(dpr || 1, 2) <= 820 ? 640 : 1280
}
