import { describe, expect, it } from 'vitest'
import {
  DUSK_FRAME,
  LAST_FRAME,
  TRANSITION_MS,
  coverRect,
  easeInOut,
  framePair,
  nearestLoaded,
  pickWidth,
  scrollFrame,
  scrollProgress,
  tweenDone,
  tweenFrame,
} from '@/lib/sky'

describe('easeInOut', () => {
  it('pins the ends', () => {
    expect(easeInOut(0)).toBe(0)
    expect(easeInOut(1)).toBe(1)
  })

  it('passes through the midpoint', () => {
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 5)
  })

  it('clamps out-of-range input rather than overshooting', () => {
    expect(easeInOut(-2)).toBe(0)
    expect(easeInOut(4)).toBe(1)
  })

  it('is monotonic', () => {
    let prev = -1
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const v = easeInOut(t)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })
})

describe('scrollProgress', () => {
  it('is 0 while the hero has not started leaving the viewport', () => {
    // getBoundingClientRect().top is positive while the element sits below the
    // top edge, which is where the hero starts.
    expect(scrollProgress(64, 656)).toBe(0)
    expect(scrollProgress(0, 656)).toBe(0)
  })

  it('reaches 1 once the hero has been scrolled fully past', () => {
    expect(scrollProgress(-656, 656)).toBe(1)
  })

  it('clamps beyond a full pass rather than running away', () => {
    expect(scrollProgress(-5000, 656)).toBe(1)
  })

  it('tracks linearly in between', () => {
    expect(scrollProgress(-328, 656)).toBeCloseTo(0.5, 5)
  })

  it('survives a zero-height box without dividing by zero', () => {
    expect(Number.isFinite(scrollProgress(-10, 0))).toBe(true)
  })
})

describe('scrollFrame', () => {
  it('starts at full daylight', () => {
    expect(scrollFrame(64, 656)).toBe(0)
  })

  it('stops at dusk, never at full night', () => {
    // True night is reserved for a deliberate flip of the switch, so that the
    // footage cannot contradict the light UI painted over it.
    expect(scrollFrame(-656, 656)).toBe(DUSK_FRAME)
    expect(scrollFrame(-656, 656)).toBeLessThan(LAST_FRAME)
  })

  it('scales to the dusk ceiling', () => {
    expect(scrollFrame(-328, 656)).toBeCloseTo(DUSK_FRAME / 2, 5)
  })
})

describe('tweenFrame', () => {
  it('starts where it started', () => {
    expect(tweenFrame(0, 23, 0)).toBe(0)
  })

  it('lands exactly on target', () => {
    expect(tweenFrame(0, 23, TRANSITION_MS)).toBe(23)
  })

  it('does not overshoot past the duration', () => {
    expect(tweenFrame(0, 23, TRANSITION_MS * 10)).toBe(23)
  })

  it('runs the other way too', () => {
    expect(tweenFrame(23, 0, TRANSITION_MS)).toBe(0)
    expect(tweenFrame(23, 0, TRANSITION_MS / 2)).toBeCloseTo(11.5, 5)
  })

  it('treats a zero duration as already arrived', () => {
    expect(tweenFrame(0, 23, 0, 0)).toBe(23)
  })
})

describe('tweenDone', () => {
  it('is false mid-flight and true at the end', () => {
    expect(tweenDone(0)).toBe(false)
    expect(tweenDone(TRANSITION_MS - 1)).toBe(false)
    expect(tweenDone(TRANSITION_MS)).toBe(true)
  })
})

describe('framePair', () => {
  it('returns a single frame on an exact index', () => {
    const { lo, hi, alpha } = framePair(7)
    expect(lo).toBe(7)
    expect(hi).toBe(7)
    expect(alpha).toBe(0)
  })

  it('cross-fades the neighbours on a fractional index', () => {
    const { lo, hi, alpha } = framePair(7.25)
    expect(lo).toBe(7)
    expect(hi).toBe(8)
    expect(alpha).toBeCloseTo(0.25, 5)
  })

  it('never indexes past the last frame', () => {
    const { lo, hi } = framePair(LAST_FRAME)
    expect(lo).toBe(LAST_FRAME)
    expect(hi).toBe(LAST_FRAME)
  })

  it('clamps out-of-range indices instead of reading undefined frames', () => {
    expect(framePair(-3).lo).toBe(0)
    expect(framePair(999).hi).toBe(LAST_FRAME)
  })
})

describe('nearestLoaded', () => {
  const mask = (loadedIndices: number[], len = 24) =>
    Array.from({ length: len }, (_, i) => loadedIndices.includes(i))

  it('returns the frame itself when it is loaded', () => {
    expect(nearestLoaded(5, mask([4, 5, 6]))).toBe(5)
  })

  it('falls back to the nearest decoded neighbour', () => {
    // The scrub asks for 11 while only the first frame has arrived: it must
    // snap to 0 rather than draw nothing and freeze.
    expect(nearestLoaded(11, mask([0]))).toBe(0)
  })

  it('prefers the closer side', () => {
    expect(nearestLoaded(10, mask([8, 20]))).toBe(8)
    expect(nearestLoaded(18, mask([8, 20]))).toBe(20)
  })

  it('prefers the lower frame on a tie, keeping the sun from jumping ahead', () => {
    expect(nearestLoaded(10, mask([9, 11]))).toBe(9)
  })

  it('reports -1 when nothing has decoded', () => {
    expect(nearestLoaded(7, mask([]))).toBe(-1)
  })

  it('clamps an out-of-range request', () => {
    expect(nearestLoaded(-5, mask([0]))).toBe(0)
    expect(nearestLoaded(999, mask([23]))).toBe(23)
  })

  it('rounds a fractional index to the nearest candidate', () => {
    expect(nearestLoaded(5.6, mask([6]))).toBe(6)
  })
})

describe('coverRect', () => {
  it('scales landscape footage to a square canvas by height, cropping the sides', () => {
    // 1000x1000 from 1280x720: height is the binding constraint, so the frame
    // overflows horizontally and the sides are trimmed.
    const { dx, dy, dw, dh } = coverRect(1000, 1000, 1280, 720)
    expect(dh).toBeCloseTo(1000, 5)
    expect(dw).toBeGreaterThan(1000)
    expect(dy).toBeCloseTo(0, 5)
    expect(dx).toBeLessThan(0)
  })

  it('centres the overflow', () => {
    const { dx, dw } = coverRect(400, 1000, 1280, 720)
    expect(dx + dw / 2).toBeCloseTo(200, 5)
  })

  it('covers a portrait phone viewport from landscape footage', () => {
    const { dw, dh } = coverRect(390, 780, 1280, 720)
    expect(dw).toBeGreaterThanOrEqual(390)
    expect(dh).toBeGreaterThanOrEqual(780)
  })
})

describe('pickWidth', () => {
  it('takes the small set on a phone', () => {
    expect(pickWidth(390, 2)).toBe(640)
    expect(pickWidth(360, 2)).toBe(640)
  })

  it('takes the large set on a desktop', () => {
    expect(pickWidth(1440, 1)).toBe(1280)
    expect(pickWidth(1280, 2)).toBe(1280)
  })

  it('caps DPR so a 3x phone does not pull the desktop set needlessly', () => {
    expect(pickWidth(390, 3)).toBe(640)
  })

  it('copes with a missing devicePixelRatio', () => {
    expect(pickWidth(390, 0)).toBe(640)
  })
})
