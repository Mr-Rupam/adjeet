import { test, expect, type Page } from '@playwright/test'

// The home film follows the scroll (components/film/story.ts): the browser
// scrolls the page natively and the picture is a function of the scroll
// position, smoothed in time. These checks read the page through
// window.__film, on a phone with touch (390 x 844) and on a desktop with a
// mouse (1440 x 900). Where the film rests and its gates (components/film/
// rest.ts) are checked with real browser input through CDP: mouse wheel
// events, raw touch sequences (Input.synthesizeScrollGesture sends no
// touchmove in this Chromium) and the keyboard.

type Now = { y: number; ch: string; p: number; moving: boolean; rest: number; targetCh: string; targetP: number }
type Stop = { i: number; ch: string; p: number; y: number; gate: boolean }
type Film = { version: number; stops: Stop[]; now: () => Now }
type Cdp = Awaited<ReturnType<ReturnType<Page['context']>['newCDPSession']>>

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
/** One mouse wheel event of dy px at the middle of the screen. */
async function wheel(cdp: Cdp, page: Page, dy: number) {
  const v = page.viewportSize()!
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: v.width / 2, y: v.height / 2, deltaX: 0, deltaY: dy })
}
/**
 * A finger moved dy px down the page (it travels up the screen), one touch
 * point a frame at px per frame, then optionally held still for holdMs, and
 * lifted unless keep is set.
 */
async function touch(cdp: Cdp, page: Page, dy: number, { step = 40, holdMs = 0, keep = false } = {}) {
  const v = page.viewportSize()!
  const x = Math.round(v.width / 2)
  const span = Math.min(Math.abs(dy), v.height - 60)
  let y = Math.round(dy > 0 ? v.height / 2 + span / 2 : v.height / 2 - span / 2)
  const end = y - Math.sign(dy) * span
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 0 }] })
  while (y !== end) {
    await sleep(16)
    y = dy > 0 ? Math.max(end, y - step) : Math.min(end, y + step)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 0 }] })
  }
  if (holdMs) await sleep(holdMs)
  if (!keep) await lift(cdp)
}
const lift = (cdp: Cdp) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
/** Films the film: chapter index + p every frame, into window.__fr. */
const record = (page: Page) => page.evaluate(() => {
  const w = window as unknown as { __film: Film; __fr: number[] }
  const ids = [...document.querySelectorAll('#film .ch')].map(c => c.id)
  w.__fr = []
  const f = () => { const n = w.__film.now(); w.__fr.push(ids.indexOf(n.ch) + n.p); requestAnimationFrame(f) }
  requestAnimationFrame(f)
})
const recorded = (page: Page) => page.evaluate(() => (window as unknown as { __fr: number[] }).__fr)
const chapterIndex = (page: Page, id: string) => page.evaluate(id => [...document.querySelectorAll('#film .ch')].findIndex(c => c.id === id), id)
async function toStop(page: Page, s: Stop) {
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), s.y)
  const n = await settle(page)
  expect(n.rest).toBe(s.i)
  // The live set is made calm 120 ms after the page is still.
  await page.waitForTimeout(250)
}

const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }
const DESK = { viewport: { width: 1440, height: 900 } }

async function open(page: Page, url = '/') {
  await page.addInitScript(() => {
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
    localStorage.setItem('adjeet-consent', 'declined')
  })
  await page.context().route('**/api/**', route => (route.request().method() === 'GET' ? route.continue() : route.abort()))
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForFunction(() => !!(window as unknown as { __film?: Film }).__film)
  await page.evaluate(() => document.fonts.ready)
}

const stops = (page: Page) => page.evaluate(() => (window as unknown as { __film: Film }).__film.stops)
const now = (page: Page) => page.evaluate(() => (window as unknown as { __film: Film }).__film.now())

/** Waits until the film has caught up with the scroll and the page has been still for 300 ms. */
async function settle(page: Page, timeout = 10000): Promise<Now> {
  const start = Date.now()
  let quiet = 0
  for (;;) {
    const n = await now(page)
    quiet = n.moving ? 0 : quiet + 1
    if (quiet >= 3) return n
    if (Date.now() - start > timeout) throw new Error(`the film did not settle within ${timeout} ms (at ${n.y}, ${n.ch} ${n.p})`)
    await page.waitForTimeout(100)
  }
}

for (const [device, use] of [['phone', PHONE], ['desktop', DESK]] as const) {
  test.describe(`The film follows the scroll on a ${device}`, () => {
    test.use(use)
    let errors: string[] = []
    test.beforeEach(({ page }) => {
      errors = []
      page.on('pageerror', error => errors.push(String(error)))
    })
    test.afterEach(() => { expect(errors, 'page errors').toEqual([]) })

    test('the contract is there with 23 stops, rising, and the film starts on the first', async ({ page }) => {
      await open(page)
      expect(await page.evaluate(() => (window as unknown as { __film: Film }).__film.version)).toBe(2)
      const S = await stops(page)
      expect(S).toHaveLength(23)
      expect(S.filter(s => s.gate)).toHaveLength(8)
      for (let k = 1; k < S.length; k++) expect(S[k].y).toBeGreaterThan(S[k - 1].y)
      expect(await settle(page)).toMatchObject({ rest: 0, ch: 'hero', p: 0, moving: false })
    })

    test('scrolling to each stop in turn, down and back up, shows that stop once the film has caught up', async ({ page }) => {
      test.setTimeout(120000)
      await open(page)
      const S = await stops(page)
      const order = [...S, ...[...S].reverse().slice(1)]
      for (const s of order) {
        await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), s.y)
        const n = await settle(page)
        expect({ rest: n.rest, ch: n.ch, p: n.p }, `stop ${s.i}`).toEqual({ rest: s.i, ch: s.ch, p: s.p })
        await expect(page.locator('html')).toHaveAttribute('data-film-ch', s.ch)
        await expect(page.locator(`#${s.ch}`)).toHaveClass(/\bcur\b/)
      }
    })

    test('past the last stop the page scrolls freely to the footer', async ({ page }) => {
      await open(page)
      const S = await stops(page)
      const last = S[S.length - 1]
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), last.y)
      expect((await settle(page)).rest).toBe(last.i)
      await page.keyboard.press('End')
      await page.waitForTimeout(400)
      await settle(page)
      expect(await page.evaluate(() => scrollY >= document.documentElement.scrollHeight - innerHeight - 2)).toBe(true)
      await expect(page.locator('html')).toHaveAttribute('data-film-ch', 'after')
      await expect(page.locator('footer').first()).toBeInViewport()
      // An arbitrary place below the film stays where it was put.
      const y = last.y + Math.round(1.7 * (await page.evaluate(() => innerHeight)))
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), y)
      await page.waitForTimeout(600)
      expect((await settle(page)).y).toBe(y)
    })

    test('a rail link and /#work land on that chapter\'s rest', async ({ page }) => {
      await open(page)
      const S = await stops(page)
      for (const id of ['hills', 'work', 'brands']) {
        await page.locator(`#film .rail a[href="#${id}"]`).evaluate(link => (link as HTMLElement).click())
        const p = Number(await page.locator(`#${id}`).getAttribute('data-rest'))
        const target = S.find(s => s.ch === id && Math.abs(s.p - p) < 1e-9)!
        expect(await settle(page), id).toMatchObject({ rest: target.i, ch: id, p })
        await expect(page.locator('html')).toHaveAttribute('data-film-ch', id)
      }
      await page.goto('/#work', { waitUntil: 'load' })
      await page.waitForFunction(() => !!(window as unknown as { __film?: Film }).__film)
      await page.waitForTimeout(600)
      const work = S.find(s => s.ch === 'work' && Math.abs(s.p - 0.06) < 1e-9)!
      expect(await settle(page)).toMatchObject({ rest: work.i, ch: 'work', p: 0.06 })
    })

    test('crossing into the next chapter renders no new chapter during the move', async ({ page }) => {
      await open(page)
      const S = await stops(page)
      // Stop 1 is the brands chapter's only stop; stop 2 opens the work chapter.
      await toStop(page, S[1])
      await page.evaluate(() => {
        const w = window as unknown as { __film: Film; __lv: Array<{ id: string; moving: boolean }> }
        w.__lv = []
        new MutationObserver(list => {
          for (const m of list) {
            const el = m.target as HTMLElement
            if (el.classList.contains('live') && !(m.oldValue || '').split(' ').includes('live')) w.__lv.push({ id: el.id, moving: w.__film.now().moving })
          }
        }).observe(document.getElementById('film')!, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true })
      })
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), S[2].y)
      expect((await settle(page)).rest).toBe(2)
      await page.waitForTimeout(400)
      const added = await page.evaluate(() => (window as unknown as { __lv: Array<{ id: string; moving: boolean }> }).__lv)
      expect(added.filter(a => a.moving), 'chapters made live while the film moved').toEqual([])
      // Once still, the chapter after it is made ready.
      expect(added.map(a => a.id)).toContain('brief')
    })

    test('past the last stop, coming back up with ordinary gestures rests on the last stop', async ({ page }) => {
      test.setTimeout(90000)
      await open(page)
      const S = await stops(page)
      const last = S[S.length - 1]
      await toStop(page, last)
      await page.keyboard.press('End')
      await settle(page)
      expect((await now(page)).y).toBeGreaterThan(last.y + 400)
      const cdp = await page.context().newCDPSession(page)
      let n = await now(page)
      for (let k = 0; k < 120 && n.rest !== last.i; k++) {
        if (device === 'phone') await touch(cdp, page, -250, { step: 25, holdMs: 60 })
        else await wheel(cdp, page, -100)
        n = await settle(page)
        expect(n.y, 'never put back into the film past the last stop').toBeGreaterThanOrEqual(last.y - 2)
      }
      expect(n).toMatchObject({ rest: last.i, ch: last.ch, p: last.p })
    })
  })
}

test.describe('Where the film rests, on a desktop', () => {
  test.use(DESK)

  test('one wheel notch moves one stop, either way', async ({ page }) => {
    await open(page)
    const S = await stops(page)
    const cdp = await page.context().newCDPSession(page)
    await toStop(page, S[3])
    await wheel(cdp, page, 100)
    expect((await settle(page)).rest).toBe(4)
    expect((await now(page)).y).toBe(S[4].y)
    await wheel(cdp, page, -100)
    expect((await settle(page)).rest).toBe(3)
  })

  test('a walk down and back up, notch by notch, rests on every stop in turn', async ({ page }) => {
    test.setTimeout(120000)
    await open(page)
    const S = await stops(page)
    const cdp = await page.context().newCDPSession(page)
    for (let k = 1; k < S.length; k++) {
      await wheel(cdp, page, 100)
      const n = await settle(page)
      expect({ rest: n.rest, ch: n.ch, p: n.p }, `down to ${k}`).toEqual({ rest: k, ch: S[k].ch, p: S[k].p })
    }
    for (let k = S.length - 2; k >= 0; k--) {
      await page.keyboard.press('ArrowUp')
      const n = await settle(page)
      expect({ rest: n.rest, ch: n.ch, p: n.p }, `up to ${k}`).toEqual({ rest: k, ch: S[k].ch, p: S[k].p })
    }
  })

  test('a burst of thirty notches from a rest stops at the next gate, and the film never shows past it', async ({ page }) => {
    await open(page)
    const S = await stops(page)
    const cdp = await page.context().newCDPSession(page)
    const gate = S.find(s => s.gate && s.i > 2)!
    await toStop(page, S[2])
    await record(page)
    for (let k = 0; k < 30; k++) { await wheel(cdp, page, 100); await sleep(20) }
    expect((await settle(page)).rest).toBe(gate.i)
    const F = await recorded(page)
    expect(Math.max(...F)).toBeLessThanOrEqual((await chapterIndex(page, gate.ch)) + gate.p + 0.006)
  })
})

test.describe('Where the film rests, on a phone', () => {
  test.use(PHONE)

  test('a walk down and back up with small swipes rests on every stop in turn', async ({ page }) => {
    test.setTimeout(150000)
    await open(page)
    const S = await stops(page)
    const cdp = await page.context().newCDPSession(page)
    for (let k = 1; k < S.length; k++) {
      await touch(cdp, page, 150, { step: 30 })
      const n = await settle(page)
      expect({ rest: n.rest, ch: n.ch, p: n.p }, `down to ${k}`).toEqual({ rest: k, ch: S[k].ch, p: S[k].p })
    }
    for (let k = S.length - 2; k >= 0; k--) {
      await touch(cdp, page, -150, { step: 30 })
      const n = await settle(page)
      expect({ rest: n.rest, ch: n.ch, p: n.p }, `up to ${k}`).toEqual({ rest: k, ch: S[k].ch, p: S[k].p })
    }
  })

  test('a hard fling from a rest stops at the next gate, and the next fling passes it', async ({ page }) => {
    await open(page)
    const S = await stops(page)
    const cdp = await page.context().newCDPSession(page)
    const gate = S.find(s => s.gate && s.i > 2)!
    // From the soft stop just before the gate, a fling of most of the screen would carry well past it.
    await toStop(page, S[gate.i - 1])
    await record(page)
    await touch(cdp, page, 800, { step: 90 })
    expect((await settle(page)).rest).toBe(gate.i)
    const F = await recorded(page)
    expect(Math.max(...F)).toBeLessThanOrEqual((await chapterIndex(page, gate.ch)) + gate.p + 0.006)
    await page.waitForTimeout(250)
    await touch(cdp, page, 800, { step: 90 })
    expect((await settle(page)).rest).toBeGreaterThan(gate.i)
  })

  test('a slow drag follows the finger, and is let go on to a stop', async ({ page }) => {
    await open(page)
    const S = await stops(page)
    const cdp = await page.context().newCDPSession(page)
    await toStop(page, S[3])
    await touch(cdp, page, 220, { step: 8, holdMs: 500, keep: true })
    const held = await now(page)
    expect(held.rest).toBe(-1)
    expect(held.y).toBeGreaterThan(S[3].y + 150)
    // With the finger still down the film has caught up with the scroll, between the stops.
    expect(held.ch).toBe(held.targetCh)
    expect(held.p).toBeCloseTo(held.targetP, 3)
    expect(held.ch + held.p).not.toBe(S[3].ch + S[3].p)
    await lift(cdp)
    const n = await settle(page)
    expect(n.rest).toBe(4)
    expect(n.y).toBe(S[4].y)
  })
})

test.describe('The film with reduced motion', () => {
  test.use(DESK)

  test('gives the stills, which scroll as a page, with no engine', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(String(error)))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(() => { sessionStorage.setItem('adjeet-entry-intro-v1', 'seen'); localStorage.setItem('adjeet-consent', 'declined') })
    await page.goto('/', { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await expect(page.locator('html')).not.toHaveClass(/\bstory\b/)
    expect(await page.evaluate(() => 'version' in ((window as unknown as { __film?: Film }).__film ?? {}))).toBe(false)
    const tops = await page.locator('#film .chs > section.ch').evaluateAll(sections => sections.map(section => section.getBoundingClientRect().top + scrollY))
    for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1])
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(600)
    const y = await page.evaluate(() => scrollY)
    expect(y).toBeGreaterThanOrEqual(290)
    expect(y).toBeLessThanOrEqual(310)
    expect(errors).toEqual([])
  })
})
