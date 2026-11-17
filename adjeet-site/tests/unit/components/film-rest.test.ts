import { describe, expect, it } from 'vitest'
import { REST, createRest, type RestStop } from '@/components/film/rest'

// Where the film rests (components/film/rest.ts): the browser scrolls
// natively, the module reads the scroll position and the inputs, and at the
// end of a gesture picks the stop and asks for the scroll position to be set
// to it. Ten stops 500 px apart, one film second apart; gates at 4, 7 and 9
// (the last). A screen is 800 px, so "past the film" is 240 px below stop 9.

const GATES = new Set([4, 7, 9])
const S: RestStop[] = Array.from({ length: 10 }, (_, k) => ({ y: k * 500, t: k, gate: GATES.has(k) }))
const LAST = S.length - 1
const timeAt = (y: number) => Math.max(0, Math.min(LAST, y / 500))
const VH = 800

/**
 * A page with a fake clock. The film's shown time moves towards the target
 * at FILM film seconds per second (a stand-in for the chase); a rebase is
 * applied at once and its scroll event delivered on the next frame, as a
 * browser does.
 */
function rig(start = 0, { film = 4, maxY = 100000 } = {}) {
  let now = 1000
  let y = S[start].y
  let shown = S[start].t
  const r = createRest(S, y, timeAt, { vh: VH })
  let out = r.frame(y, now, shown)
  let echo: number | null = null
  const targets: number[] = []
  const rebases: number[] = []
  const moveTo = (v: number) => { y = Math.max(0, Math.min(maxY, v)); r.scroll(y, now) }
  const frame = () => {
    now += 16
    if (echo !== null) { r.scroll(echo, now); echo = null }
    out = r.frame(y, now, shown)
    targets.push(out.target)
    if (out.rebase !== null) { rebases.push(out.rebase); y = out.rebase; echo = y }
    const d = out.target - shown
    shown += Math.sign(d) * Math.min(Math.abs(d), film * 0.016)
  }
  /** Frames for ms milliseconds. */
  const wait = (ms: number) => { for (let k = 0; k < ms / 16; k++) frame() }
  const api = {
    r,
    get y() { return y },
    get now() { return now },
    get shown() { return shown },
    get out() { return out },
    targets,
    rebases,
    frame,
    wait,
    /** A wheel event of delta px: the input, then the scroll it causes. */
    wheel(d: number) { r.input('wheel', now, d); moveTo(y + d) },
    key(d: number) { r.input('key', now, d); moveTo(y + d) },
    /** Wheel events every gap ms. */
    wheels(deltas: number[], gap: number) {
      deltas.forEach((d, k) => { api.wheel(d); if (k < deltas.length - 1) wait(gap) })
    },
    /** A finger: down, moved by each of steps (px, one a frame, down the page is positive), and lifted. */
    touch(steps: number[], { momentum = [] as number[] } = {}) {
      r.input('touchstart', now)
      for (const d of steps) { frame(); moveTo(y + d) }
      frame()
      r.input('touchend', now)
      for (const d of momentum) { frame(); moveTo(y + d) }
    },
    /** The scroll event of the last write never comes (another scroll landed in the same frame). */
    dropEcho() { echo = null },
    /** A scroll no input explains (a scrollbar, find in page, a script). */
    jump(v: number) { moveTo(v) },
    /** Until the gesture is over and the film has arrived. */
    settle(max = 6000) {
      for (let k = 0; k < max / 16; k++) {
        frame()
        if (out.rest >= 0 && Math.abs(shown - out.target) < 1e-9 && echo === null) return out
      }
      return out
    },
  }
  return api
}
const stopAt = (t: number) => S.findIndex(s => Math.abs(s.t - t) < 1e-9)

describe('createRest: the options', () => {
  it('starts from the values in the brief', () => {
    expect(REST).toEqual({ IDLE_MS: 140, GESTURE_GAP_MS: 160, MIN_PX: 28, BIAS: 0.15, DISCRETE_PX: 50, PAST: 0.3 })
  })
})

describe('createRest: a mouse wheel', () => {
  it('one notch of 100 px from rest moves one stop, and the scroll is set to that stop', () => {
    const p = rig(0)
    p.wheel(100)
    const o = p.settle()
    expect(o.rest).toBe(1)
    expect(p.y).toBe(500)
    expect(p.rebases).toEqual([500])
    expect(Math.max(...p.targets)).toBe(S[1].t)
  })

  it('commits at once: the target is never short of the next stop after the notch', () => {
    const p = rig(2)
    p.wheel(100)
    p.frame()
    expect(p.out.target).toBe(S[3].t)
    expect(p.out.rest).toBe(-1)
  })

  it('three notches 60 ms apart move one stop', () => {
    const p = rig(0)
    p.wheels([100, 100, 100], 60)
    expect(p.settle().rest).toBe(1)
    expect(p.y).toBe(500)
  })

  it('two notches 300 ms apart move two stops', () => {
    const p = rig(0)
    p.wheels([100, 100], 300)
    expect(p.settle().rest).toBe(2)
    expect(p.y).toBe(1000)
  })

  it('a notch of 33 px moves one stop', () => {
    const p = rig(3)
    p.wheel(33)
    expect(p.settle().rest).toBe(4)
  })

  it('a notch up moves one stop back', () => {
    const p = rig(3)
    p.wheel(-100)
    expect(p.settle().rest).toBe(2)
    expect(p.y).toBe(1000)
  })

  it('forty small deltas over 600 ms end on the stop their distance gives and never fire a second move', () => {
    const p = rig(0)
    p.wheels(Array(40).fill(6), 15) // 240 px: 0.48 of the way to stop 1
    expect(p.settle().rest).toBe(1)
    expect(Math.max(...p.targets)).toBeLessThanOrEqual(S[1].t)
    const q = rig(0)
    q.wheels(Array(40).fill(2), 15) // 80 px: 0.16, past the bias
    expect(q.settle().rest).toBe(1)
    const s = rig(0)
    s.wheels(Array(40).fill(18), 15) // 720 px: 0.44 of the way from 1 to 2
    expect(s.settle().rest).toBe(2)
    expect(Math.max(...s.targets)).toBeLessThanOrEqual(S[2].t)
  })

  it('a slow steady stream follows the scroll one to one, then ends by distance', () => {
    const p = rig(0)
    for (let k = 0; k < 125; k++) {
      p.wheel(3)
      p.wait(16)
      if (k === 60) expect(p.out.target).toBeCloseTo(timeAt(p.y), 9)
    }
    // 375 px: 0.75 of the way.
    expect(p.settle().rest).toBe(1)
    const q = rig(5)
    for (let k = 0; k < 125; k++) { q.wheel(-1); q.wait(16) }
    // 125 px up from stop 5: f = 0.75 of the way from 4, inside the bias, so stop 4.
    expect(q.settle().rest).toBe(4)
  })

  it('a burst of thirty notches from a rest stops at the next gate', () => {
    const p = rig(1)
    p.wheels(Array(30).fill(100), 20)
    expect(p.settle().rest).toBe(4)
    expect(Math.max(...p.targets)).toBe(S[4].t)
    expect(p.y).toBe(S[4].y)
  })

  it('a notch the other way inside a burst starts a new gesture back', () => {
    const p = rig(3)
    p.wheel(100)
    p.wait(40)
    p.wheel(-100)
    expect(p.settle().rest).toBe(3)
  })
})

describe('createRest: the keyboard', () => {
  it('ArrowDown (40 px) moves one stop', () => {
    const p = rig(0)
    p.key(40)
    expect(p.settle().rest).toBe(1)
    expect(p.y).toBe(500)
  })

  it('held ArrowDown moves on steadily and stops at the gate', () => {
    const p = rig(0)
    let mid = 0
    for (let k = 0; k < 90; k++) { p.key(40); p.wait(32); if (k === 45) mid = p.out.target }
    expect(mid).toBeGreaterThan(S[2].t)
    expect(mid).toBeLessThanOrEqual(S[4].t)
    expect(p.settle().rest).toBe(4)
    expect(Math.max(...p.targets)).toBe(S[4].t)
  })

  it('PageDown moves on by at least one stop', () => {
    const p = rig(5)
    p.key(700)
    expect(p.settle().rest).toBeGreaterThanOrEqual(6)
  })
})

describe('createRest: a finger', () => {
  it('a drag of 20 px and release returns to the start', () => {
    const p = rig(2)
    p.touch([5, 5, 5, 5])
    const o = p.settle()
    expect(o.rest).toBe(2)
    expect(p.y).toBe(1000)
  })

  it('a drag of 60 px and release moves one stop', () => {
    const p = rig(2)
    p.touch([10, 10, 10, 10, 10, 10])
    expect(p.settle().rest).toBe(3)
    expect(p.y).toBe(1500)
  })

  it('follows the finger while it is down, and only commits once it lifts', () => {
    const p = rig(2)
    p.r.input('touchstart', p.now)
    for (let k = 0; k < 10; k++) { p.frame(); p.jump(p.y + 10) }
    p.wait(400) // the finger holds still: no gesture end while it is down
    expect(p.out.rest).toBe(-1)
    expect(p.out.target).toBeCloseTo(timeAt(1100), 9)
    p.r.input('touchend', p.now)
    expect(p.settle().rest).toBe(3)
  })

  it('a fling of 3000 px from a soft stop two before a gate ends on the gate, with the scroll set to the gate', () => {
    const p = rig(2)
    p.touch(Array(10).fill(150), { momentum: Array(30).fill(50) })
    const o = p.settle()
    expect(o.rest).toBe(4)
    expect(p.y).toBe(S[4].y)
    expect(p.rebases.at(-1)).toBe(S[4].y)
    expect(Math.max(...p.targets)).toBe(S[4].t)
  })

  it('a second fling started while the film is still short of the gate also ends on the gate', () => {
    const p = rig(2, { film: 1 })
    p.touch(Array(10).fill(150), { momentum: Array(10).fill(50) })
    p.wait(200)
    expect(p.shown).toBeLessThan(S[4].t - 0.1)
    p.touch(Array(10).fill(150), { momentum: Array(30).fill(50) })
    expect(p.settle().rest).toBe(4)
    expect(Math.max(...p.targets)).toBe(S[4].t)
  })

  it('a second fling during the first one\'s glide also ends on the gate', () => {
    const p = rig(2)
    p.touch(Array(10).fill(150), { momentum: Array(5).fill(50) })
    p.touch(Array(10).fill(150), { momentum: Array(30).fill(50) })
    expect(p.settle().rest).toBe(4)
  })

  it('a fling started once the film is on the gate ends on the next gate at most', () => {
    const p = rig(4)
    expect(p.shown).toBe(S[4].t)
    p.touch(Array(10).fill(200), { momentum: Array(60).fill(80) })
    expect(p.settle().rest).toBe(7)
    expect(Math.max(...p.targets)).toBe(S[7].t)
    // And back up: the gate behind is 4.
    p.touch(Array(10).fill(-200), { momentum: Array(15).fill(-80) })
    expect(p.settle().rest).toBe(4)
  })

  it('a reversal inside one touch gesture comes back', () => {
    const p = rig(2)
    p.touch([...Array(10).fill(20), ...Array(10).fill(-20)])
    expect(p.settle().rest).toBe(2)
    expect(p.y).toBe(1000)
    // Most of the way back is enough: the way it last moved decides.
    const q = rig(2)
    q.touch([...Array(14).fill(20), ...Array(8).fill(-20)])
    expect(q.settle().rest).toBe(2)
    // Back further than it went: one stop back.
    const s = rig(2)
    s.touch([...Array(5).fill(20), ...Array(15).fill(-20)])
    expect(s.settle().rest).toBe(1)
  })

  it('a gesture against a move in flight turns the film where it is', () => {
    const p = rig(2, { film: 1 })
    p.wheel(100)
    p.wait(300)
    expect(p.out.rest).toBe(3)
    const at = p.shown
    expect(at).toBeGreaterThan(2.1)
    expect(at).toBeLessThan(2.9)
    p.r.input('touchstart', p.now)
    p.frame()
    expect(Math.abs(p.out.target - at)).toBeLessThan(0.05)
    for (let k = 0; k < 6; k++) { p.frame(); p.jump(p.y - 10) }
    p.frame()
    expect(p.out.target).toBeLessThan(at)
    p.r.input('touchend', p.now)
    expect(p.settle().rest).toBe(2)
  })

  it('a gesture is anchored on the frame drawn after it starts, not on an older one', () => {
    // The film is moving up from stop 1 to stop 0; the last frame drawn showed 0.6.
    const r = createRest(S, 0, timeAt, { vh: VH })
    r.frame(0, 0, 0.6)
    // On a busy machine the next input comes long after that frame, and the
    // frame after it already shows 0.3: the gesture starts from 0.3.
    r.input('wheel', 500, -10)
    const o = r.frame(0, 516, 0.3)
    expect(o.target).toBeCloseTo(0.3, 6)
  })

  it('a tap during a move lets the film arrive where it was going', () => {
    const p = rig(2, { film: 1 })
    p.wheel(100)
    p.wait(300)
    p.touch([])
    expect(p.settle().rest).toBe(3)
  })
})

describe('createRest: a scroll no input explains', () => {
  it('a jump of several chapters has no limits and ends on the nearest stop', () => {
    const p = rig(1)
    p.jump(3030)
    p.frame()
    expect(p.out.target).toBeCloseTo(timeAt(3030), 9) // past gate 4: no limits
    expect(p.settle().rest).toBe(6)
    expect(p.y).toBe(3000)
  })

  it('the scroll event of its own write is not taken for a new gesture', () => {
    const p = rig(0)
    p.wheel(100)
    p.settle()
    expect(p.r.peek().gesture).toBeNull()
    p.r.scroll(500, p.now) // a second echo of the same write
    p.frame()
    expect(p.out.rest).toBe(1)
  })

  it('a scroll moving away from its own write is not swallowed, and keeps its gate', () => {
    const p = rig(5)
    p.key(-40)
    for (let k = 0; k < 20 && p.rebases.length === 0; k++) p.frame()
    expect(p.rebases).toEqual([2000])
    // The tail of the key's own scroll lands after the write in the same frame (so the
    // write's own event never comes) and goes on up past the gate at 4.
    p.dropEcho()
    p.jump(1800)
    p.frame()
    p.jump(1400)
    const o = p.settle()
    expect(o.rest).toBe(4)
    expect(p.y).toBe(2000)
  })

  it('a scroll left off the rest stop is put back once the page is still', () => {
    const p = rig(2)
    p.wait(300)
    // The page moved with no scroll event the module saw.
    const o = p.r.frame(1180, p.now + 200, p.shown)
    expect(o).toMatchObject({ rebase: 1000, rest: 2 })
  })

  it('a foreign input (Home, End, a link) starts a gesture with no limits', () => {
    const p = rig(1)
    p.r.input('foreign', p.now)
    p.jump(4000)
    expect(p.settle().rest).toBe(8)
  })
})

describe('createRest: below the film', () => {
  it('from the last stop a downward gesture leaves the film and no rebase follows', () => {
    const p = rig(LAST)
    p.wheels([100, 100], 60)
    p.wait(400)
    expect(p.y).toBe(S[LAST].y + 200)
    expect(p.rebases).toEqual([])
    expect(p.out).toMatchObject({ target: S[LAST].t, rebase: null, run: false })
    // A further notch: still an ordinary page.
    p.wheel(100)
    p.wait(400)
    expect(p.y).toBe(S[LAST].y + 300)
    expect(p.rebases).toEqual([])
    p.jump(S[LAST].y + 5000)
    p.wait(400)
    expect(p.y).toBe(S[LAST].y + 5000)
    expect(p.r.peek().page).toBe(true)
  })

  it('coming back up rests on the last stop', () => {
    const p = rig(LAST)
    p.jump(S[LAST].y + 3000)
    p.wait(400)
    expect(p.r.peek().page).toBe(true)
    for (let k = 0; k < 28; k++) { p.wheel(-100); p.wait(300) }
    expect(p.settle().rest).toBe(LAST)
    expect(p.y).toBe(S[LAST].y)
  })

  it('a fling up from below the film ends on the last stop, and the next one goes on to the gate before it', () => {
    const p = rig(LAST)
    p.jump(S[LAST].y + 400)
    p.wait(400)
    p.touch(Array(10).fill(-150), { momentum: Array(20).fill(-80) })
    expect(p.settle().rest).toBe(LAST)
    expect(p.y).toBe(S[LAST].y)
    p.touch(Array(10).fill(-150), { momentum: Array(20).fill(-80) })
    expect(p.settle().rest).toBe(7)
  })

  it('a glide that carries back into the film keeps its limits', () => {
    const p = rig(LAST)
    p.jump(S[LAST].y + 3000)
    p.wait(400)
    p.touch(Array(10).fill(-150))
    // The glide goes on long after the finger lifted.
    for (let k = 0; k < 60; k++) { p.frame(); p.jump(p.y - 80) }
    expect(p.settle().rest).toBe(LAST)
  })

  it('a small drag down from the last stop springs back', () => {
    const p = rig(LAST)
    p.touch([5, 5, 5])
    expect(p.settle().rest).toBe(LAST)
    expect(p.y).toBe(S[LAST].y)
  })
})

describe('createRest: film-run', () => {
  it('is on before the last stop, off on it, and on while a gesture that started before it is live', () => {
    const p = rig(0)
    expect(p.out.run).toBe(true)
    const q = rig(LAST)
    expect(q.out.run).toBe(false)
    const s = rig(8)
    s.wheel(100)
    s.frame()
    expect(s.out.run).toBe(true)
    expect(s.settle().rest).toBe(LAST)
    expect(s.out.run).toBe(false)
  })

  it('stays off while a gesture that started on the last stop is live', () => {
    const p = rig(LAST)
    p.wheel(-100)
    p.frame()
    expect(p.out.run).toBe(false)
  })
})

describe('createRest: limits, resize and safety', () => {
  it('a gesture from a gate has the gates on either side as its limits', () => {
    const p = rig(4)
    p.wheel(100)
    expect(p.r.peek().gesture).toMatchObject({ kind: 'wheel', from: 4, lo: 0, hi: 7, commit: 5 })
    const q = rig(5)
    q.key(-40)
    expect(q.r.peek().gesture).toMatchObject({ kind: 'key', from: 5, lo: 4, hi: 7, commit: 4 })
  })

  it('a resize settles a gesture in flight and puts the scroll on the new place of its stop', () => {
    const p = rig(2)
    p.wheel(100)
    const wide = S.map(s => ({ ...s, y: s.y * 1.2 }))
    p.r.setStops(wide, p.y, 960)
    expect(p.r.peek().gesture).toBeNull()
    p.frame()
    expect(p.out.rest).toBe(3)
    expect(p.out.rebase ?? p.y).toBe(wide[3].y)
  })

  it('a page loaded between stops is put on the nearest', () => {
    const r = createRest(S, 1180, timeAt, { vh: VH })
    const o = r.frame(1180, 0, S[2].t)
    expect(o).toMatchObject({ rest: 2, rebase: 1000, target: S[2].t })
  })

  it('never throws, and with nothing to go on follows the scroll', () => {
    const r = createRest([], 0, timeAt, { vh: VH })
    expect(() => r.input('wheel', 0, 100)).not.toThrow()
    expect(() => r.scroll(100, 1)).not.toThrow()
    expect(r.frame(100, 2, 0)).toMatchObject({ target: timeAt(100), rebase: null })
    const q = createRest(S, NaN, timeAt, { vh: VH })
    expect(() => q.frame(NaN, 0, 0)).not.toThrow()
    expect(stopAt(q.frame(0, 400, 0).target)).toBe(0)
  })
})
