import { describe, expect, it } from 'vitest'
import { CHAPTERS, filmStops } from '@/content/home-film'
import { CHASE, buildTimeline, chase, chaseOptions, type ChaseState } from '@/components/film/timeline'

// The film's timeline (components/film/timeline.ts): the scroll distance gives
// a film time, the film time gives a chapter and its progress, and the chase
// follows the scroll's time with a speed-limited spring.

const tl = buildTimeline(filmStops(), CHAPTERS)
const order = (f: { ci: number; p: number }) => f.ci + f.p

describe('buildTimeline', () => {
  it('gives every stop a film time and a scroll distance, both rising from 0', () => {
    expect(tl.stops).toHaveLength(23)
    expect(tl.stops[0].t).toBe(0)
    expect(tl.stops[0].y).toBe(0)
    for (let k = 1; k < tl.stops.length; k++) {
      expect(tl.stops[k].t).toBeCloseTo(tl.stops[k - 1].t + tl.stops[k].ms / 1000, 9)
      expect(tl.stops[k].y).toBeCloseTo(tl.stops[k - 1].y + tl.stops[k].dy, 9)
    }
    expect(tl.duration).toBe(tl.stops[22].t)
    expect(tl.length).toBe(tl.stops[22].y)
  })

  it('shows exactly each stop at its own time', () => {
    for (const s of tl.stops) {
      expect(tl.frameAt(s.t), `stop ${s.i}`).toEqual({ ci: s.ci, p: s.p })
      expect(tl.timeAt(s.y), `stop ${s.i}`).toBeCloseTo(s.t, 9)
    }
  })

  it('clamps at both ends', () => {
    expect(tl.timeAt(-3)).toBe(0)
    expect(tl.timeAt(tl.length + 5)).toBe(tl.duration)
    expect(tl.frameAt(-1)).toEqual({ ci: 0, p: 0 })
    const last = tl.stops[22]
    expect(tl.frameAt(tl.duration + 10)).toEqual({ ci: last.ci, p: last.p })
  })

  it('never goes backwards as the scroll grows', () => {
    let t0 = -1
    let f0 = -1
    for (let y = -0.5; y <= tl.length + 0.5; y += 0.0025) {
      const t = tl.timeAt(y)
      expect(t).toBeGreaterThanOrEqual(t0)
      const f = order(tl.frameAt(t))
      expect(f).toBeGreaterThanOrEqual(f0 - 1e-12)
      t0 = t
      f0 = f
    }
  })

  it('keeps p inside 0..1, and moves within one chapter linearly between its stops', () => {
    for (let t = 0; t <= tl.duration; t += 0.01) {
      const f = tl.frameAt(t)
      expect(f.p).toBeGreaterThanOrEqual(0)
      expect(f.p).toBeLessThanOrEqual(1)
    }
    const a = tl.stops.find(s => s.ch === 'work' && s.p === 0.2)!
    const b = tl.stops[a.i + 1]
    const mid = tl.frameAt((a.t + b.t) / 2)
    expect(mid.ci).toBe(a.ci)
    expect(mid.p).toBeCloseTo((a.p + b.p) / 2, 9)
  })

  it('splits a move across a chapter boundary in proportion to each side, and the two sides meet', () => {
    for (let k = 1; k < tl.stops.length; k++) {
      const a = tl.stops[k - 1]
      const b = tl.stops[k]
      if (a.ci === b.ci) continue
      const wa = (1 - a.p) * CHAPTERS[a.ci].dur
      const wb = b.p * CHAPTERS[b.ci].dur
      const split = a.t + ((b.t - a.t) * wa) / (wa + wb)
      const before = tl.frameAt(split - 1e-9)
      const after = tl.frameAt(split + 1e-9)
      expect(before.ci, `${a.ch} to ${b.ch}`).toBe(a.ci)
      expect(before.p).toBeCloseTo(1, 6)
      expect(after.ci, `${a.ch} to ${b.ch}`).toBe(b.ci)
      expect(after.p).toBeCloseTo(0, 6)
      // At the split itself the old chapter is at its end: the same flat light.
      const at = tl.frameAt(split)
      expect(order(at)).toBeCloseTo(b.ci, 6)
    }
  })
})

describe('timeOf', () => {
  it('finds the time of a chapter frame, the inverse of frameAt', () => {
    for (const s of tl.stops) expect(tl.timeOf(s.ci, s.p)).toBeCloseTo(s.t, 9)
    for (let ci = 1; ci < CHAPTERS.length; ci++) {
      const open = tl.frameAt(tl.timeOf(ci, 0) + 1e-6)
      expect(open.ci).toBe(ci)
      expect(open.p).toBeCloseTo(0, 4)
    }
    for (let ci = 0; ci < CHAPTERS.length - 1; ci++) {
      const end = tl.frameAt(tl.timeOf(ci, 1))
      expect(end.ci + end.p).toBeCloseTo(ci + 1, 6)
    }
  })
})

describe('chase', () => {
  const opts = chaseOptions(false)
  const run = (from: ChaseState, target: number, dt = 1 / 60, max = 20) => {
    const out: Array<ChaseState & { at: number; cap: number }> = []
    let s = from
    for (let at = 0; at < max; at += dt) {
      const cap = opts.rate + opts.grow * Math.max(0, Math.abs(target - s.t) - opts.slack)
      s = chase(s, target, dt, opts)
      out.push({ ...s, at: at + dt, cap })
      if (s.t === target && s.v === 0) break
    }
    return out
  }

  it('keeps its starting values in one object', () => {
    expect(CHASE).toMatchObject({ omegaCoarse: 16, omegaFine: 10, rate: 2.4, grow: 2, slack: 1.5, accel: 12 })
    expect(chaseOptions(true).omega).toBe(16)
    expect(chaseOptions(false).omega).toBe(10)
  })

  for (const [from, target] of [[0, 1.2], [0, 0.3], [4, 1], [0, 12], [10, 9.99], [2.5, 2.5]] as const) {
    it(`reaches ${target} from ${from} exactly, never passing it and never over the cap`, () => {
      const steps = run({ t: from, v: 0 }, target)
      const end = steps[steps.length - 1]
      expect(end).toMatchObject({ t: target, v: 0 })
      const dir = Math.sign(target - from)
      for (const s of steps) {
        expect(Math.sign(target - s.t) * dir).toBeGreaterThanOrEqual(0)
        expect(Math.abs(s.v)).toBeLessThanOrEqual(s.cap + 1e-9)
      }
    })
  }

  it('does not pass the target with long or uneven frames', () => {
    for (const dt of [1 / 30, 0.05, 0.1, 0.5]) {
      const steps = run({ t: 0, v: 0 }, 1.5, dt)
      expect(steps[steps.length - 1]).toMatchObject({ t: 1.5, v: 0 })
      for (const s of steps) expect(s.t).toBeLessThanOrEqual(1.5)
    }
  })

  it('takes at least 0.15 s from rest to reach full speed', () => {
    const steps = run({ t: 0, v: 0 }, 1.4, 1 / 240)
    const full = steps.find(s => Math.abs(s.v) >= s.cap - 1e-6)
    expect(full).toBeDefined()
    expect(full!.at).toBeGreaterThanOrEqual(0.15)
  })

  it('turns round when the target moves behind it, without passing the new target', () => {
    let s: ChaseState = { t: 0, v: 0 }
    for (let k = 0; k < 20; k++) s = chase(s, 2, 1 / 60, opts)
    expect(s.v).toBeGreaterThan(0)
    const at = s.t
    const back = run(s, at - 0.3)
    expect(back[back.length - 1]).toMatchObject({ t: at - 0.3, v: 0 })
    // Once it has turned, it never goes below the new target.
    for (const k of back) expect(k.t).toBeGreaterThanOrEqual(at - 0.3)
  })

  it('slowing down is never limited: a much lower cap takes effect at once', () => {
    const s = chase({ t: 0, v: 20 }, 0.5, 1 / 60, opts)
    expect(Math.abs(s.v)).toBeLessThanOrEqual(opts.rate + 1e-9)
  })
})
