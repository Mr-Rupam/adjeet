import { test, expect, type Page } from '@playwright/test'

// The stepped film (stepper-contract.md, and the film diagnosis of 17fe3e4):
// a gesture is an intent, never a distance. A gentle swipe, one wheel gesture
// or one key press moves one stop, in a timed, eased move; the film rests only
// on stops. Eight stops are gates: a quick swipe, or input during a move,
// carries the film on through the soft stops to the next gate and never past
// it. In the work chapter the wall follows the finger. These are the pass
// checks, on a phone with touch (390 x 844) and on a desktop with a mouse
// (1440 x 900).

type Rest = { y: number; id: string; p: number; ms: number; gate: boolean }

const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }
const DESK = { viewport: { width: 1440, height: 900 } }

async function open(page: Page, url = '/') {
  await page.addInitScript(() => {
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
    localStorage.setItem('adjeet-consent', 'declined')
    // When the page last scrolled, for the time a move takes from the first input to rest.
    // The player does not scroll during a move: it marks <html> with
    // data-film-moving, and jumps the page to the stop at the end.
    // __play: when the last move started to play (after any hold for pictures).
    const w = window as unknown as { __last: number; __play: number }
    w.__last = 0
    w.__play = 0
    addEventListener('scroll', () => { w.__last = performance.now() }, { passive: true, capture: true })
    document.addEventListener('DOMContentLoaded', () => new MutationObserver(() => {
      w.__last = performance.now()
      if (document.documentElement.getAttribute('data-film-moving') === 'play') w.__play = w.__last
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-film-moving'] }))
  })
  await page.goto(url, { waitUntil: 'load' })
  await page.locator('html.stepper[data-film-ch]').waitFor({ state: 'attached' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
}

/** Every stop in page pixels, as the engine places them. */
function rests(page: Page): Promise<Rest[]> {
  return page.evaluate(() => {
    const chapters = [...document.querySelectorAll<HTMLElement>('#film .ch')]
    const H = chapters[0].querySelector<HTMLElement>('.stage')!.offsetHeight
    const out: Rest[] = []
    chapters.forEach((chapter, index) => {
      const top = chapter.getBoundingClientRect().top + scrollY
      const pin = Math.max(1, chapter.offsetHeight - H)
      for (const stop of (chapter.dataset.stops || '').split(' ').filter(Boolean)) {
        const [p, ms] = stop.replace('!', '').split(':').map(Number)
        out.push({ y: index === 0 && p === 0 ? 0 : Math.ceil(top + pin * p) + 1, id: chapter.id, p, ms: ms || 0, gate: stop.endsWith('!') })
      }
    })
    return out.sort((a, b) => a.y - b.y)
  })
}

/** True when the page is on a stop (within 2 px) or past the last one. */
async function onStop(page: Page) {
  const R = await rests(page)
  const at = await y(page)
  return at > R[R.length - 1].y + 2 || R.some(r => Math.abs(r.y - at) <= 2)
}

const now = (page: Page) => page.evaluate(() => performance.now())
const y = (page: Page) => page.evaluate(() => scrollY)

/**
 * Waits for the move an input started (the page scrolls after it; a move may
 * first hold for the next chapter's pictures) and then until the page has not
 * scrolled for 600 ms; returns where, and when it last moved.
 */
async function rest(page: Page, timeout = 12000) {
  const start = Date.now()
  const from = await page.evaluate(() => performance.now()) - 400
  for (;;) {
    const s = await page.evaluate(() => ({ y: scrollY, last: (window as unknown as { __last: number }).__last, now: performance.now(), moving: document.documentElement.hasAttribute('data-film-moving') }))
    const moved = (s.last > from || Date.now() - start > 5000) && !s.moving
    // A rest is quiet for 600 ms, and on a stop or past the last one (a pause inside a move is not a rest).
    if (moved && s.now - s.last >= 600 && (await onStop(page) || Date.now() - start > timeout - 2000)) {
      return { y: s.y, last: s.last, play: await page.evaluate(() => (window as unknown as { __play: number }).__play) }
    }
    if (Date.now() - start > timeout) throw new Error(`no rest within ${timeout} ms (at ${s.y})`)
    await page.waitForTimeout(100)
  }
}

const wheel = async (page: Page, dy: number) => { await page.mouse.move(700, 450); await page.mouse.wheel(0, dy) }
/**
 * A finger on the screen: raw touch events through CDP, `distance` px at
 * `speed` px a second, one event a frame (at least 10 px apart) (a negative distance scrolls down).
 * Input.synthesizeScrollGesture sends no touchmove once the page has taken
 * panning from the browser (touch-action: pinch-zoom), so it cannot test this.
 */
async function swipe(page: Page, distance: number, speed: number) {
  const cdp = await page.context().newCDPSession(page)
  // One event a frame (60 a second), as a touch screen sends them: a fast flick moves far between events.
  const n = Math.max(2, Math.round(Math.abs(distance) / Math.max(10, speed / 60)))
  const gap = (Math.abs(distance) / speed) * 1000 / n
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 500 }] })
  for (let i = 1; i <= n; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 500 + (distance * i) / n }] })
    // At least 4 ms apart, so the page can time the finger (a real touch screen reports every frame or so).
    await page.waitForTimeout(Math.max(4, gap))
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await cdp.detach()
}

/** At a rest: every chapter's progress is 0, 1 or one of its stops, and nothing time-based is running. */
async function atRest(page: Page) {
  return page.evaluate(async () => {
    const chapters = [...document.querySelectorAll<HTMLElement>('#film .ch')]
    const H = chapters[0].querySelector<HTMLElement>('.stage')!.offsetHeight
    const off: string[] = []
    for (const chapter of chapters) {
      const top = chapter.getBoundingClientRect().top + scrollY
      const pin = Math.max(1, chapter.offsetHeight - H)
      const pr = (scrollY - top) / pin
      if (pr <= 0 || pr >= 1) continue
      const stops = (chapter.dataset.stops || '').split(' ').filter(Boolean).map(s => Number(s.replace('!', '').split(':')[0]))
      if (!stops.some(s => Math.abs(s - pr) <= 0.003)) off.push(`${chapter.id} at ${pr.toFixed(4)}`)
    }
    // Ambient loops (a flickering tube, a breathing light) never end, so they are not
    // counted; everything that has an end (a beat's fade, the Malda days) must end.
    const running = () => document.getAnimations().filter(a => a.playState === 'running' && a.timeline instanceof DocumentTimeline
      && a.effect?.getComputedTiming().iterations !== Infinity)
    const t = performance.now()
    while (running().length && performance.now() - t < 4000) await new Promise(r => setTimeout(r, 100))
    return { off, running: running().length }
  })
}

for (const [device, use] of [['phone', PHONE], ['desktop', DESK]] as const) {
  test.describe(`The stepped film on a ${device}`, () => {
    test.use(use)
    // A gentle gesture: one stop (a slow 70 px swipe; on the work wall, a 70 px drag).
    const gesture = (page: Page, dir: 1 | -1) => (device === 'phone' ? swipe(page, -dir * 70, 160) : wheel(page, dir * 100))

    test('walking the film takes one gesture a stop, rests only on stops, and every move is timed (checks 4, 5, 6)', async ({ page }) => {
      test.setTimeout(240000)
      await open(page)
      const R = await rests(page)
      expect(R.length).toBe(23)
      expect(await y(page)).toBe(0)
      const visited: number[] = [0]
      for (let i = 1; i < R.length; i++) {
        const t0 = await now(page)
        await gesture(page, 1)
        const r = await rest(page)
        expect(Math.abs(r.y - R[i].y), `down to ${R[i].id} ${R[i].p}`).toBeLessThanOrEqual(2)
        // Data-driven durations: the move plays 0.8 to 1.6 s, or a showpiece's own
        // ms (with 0.5 s for timers that fire late on a busy page); before it, a hold while the next
        // pictures decode is 4 s at most (the contract's gate).
        const played = r.last - r.play
        expect(played, `move to ${R[i].id} ${R[i].p}`).toBeGreaterThanOrEqual(R[i].ms ? R[i].ms - 300 : 600)
        expect(played, `move to ${R[i].id} ${R[i].p}`).toBeLessThanOrEqual((R[i].ms || 1600) + 500)
        expect(r.play - t0, `hold before ${R[i].id} ${R[i].p}`).toBeLessThanOrEqual(4300)
        const check = await atRest(page)
        expect(check, `${R[i].id} ${R[i].p}`).toEqual({ off: [], running: 0 })
        visited.push(r.y)
      }
      // And back up, through the same stops.
      for (let i = R.length - 2; i >= 0; i--) {
        const t0 = await now(page)
        await gesture(page, -1)
        const r = await rest(page)
        expect(Math.abs(r.y - visited[i]), `up to ${R[i].id} ${R[i].p}`).toBeLessThanOrEqual(2)
        expect(r.last - r.play, `up to ${R[i].id} ${R[i].p}`).toBeLessThanOrEqual((R[i + 1].ms || 1600) + 500)
        expect(r.play - t0, `hold before ${R[i].id} ${R[i].p}`).toBeLessThanOrEqual(4300)
      }
    })

    test('past the last stop the page scrolls natively, and back up lands on the last stop (check 7)', async ({ page }) => {
      test.setTimeout(60000)
      await open(page)
      const R = await rests(page)
      const end = R[R.length - 1].y
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), end)
      expect(Math.abs((await rest(page)).y - end)).toBeLessThanOrEqual(2)
      if (device === 'phone') await swipe(page, -500, 1200)
      else for (let i = 0; i < 5; i++) { await wheel(page, 100); await page.waitForTimeout(30) }
      const below = (await rest(page)).y
      expect(below).toBeGreaterThan(end + 200)
      // Native: no move of its own afterwards.
      await page.waitForTimeout(800)
      expect(await y(page)).toBe(below)
      if (device === 'phone') await swipe(page, below - end + 300, 1200)
      // Wheel up until the stepper takes over (one gesture, however long it takes the page to answer).
      else for (let i = 0; i < 20 && await y(page) > end + 2 && !(await page.evaluate(() => document.documentElement.hasAttribute('data-film-moving'))); i++) { await wheel(page, -100); await page.waitForTimeout(30) }
      expect(Math.abs((await rest(page)).y - end)).toBeLessThanOrEqual(2)
    })

    test('a jump made by a script settles on the nearest stop (check 11)', async ({ page }) => {
      await open(page)
      const R = await rests(page)
      const work = R.filter(r => r.id === 'work')
      const between = Math.round(work[1].y + (work[2].y - work[1].y) * 0.3)
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), between)
      expect(Math.abs((await rest(page)).y - work[1].y)).toBeLessThanOrEqual(2)
    })

    test('a rail link and /#work land on the chapter\'s rest, and the next gesture goes to the following stop (check 9)', async ({ page }) => {
      test.setTimeout(60000)
      await open(page)
      const R = await rests(page)
      const restOf = async (id: string) => Number(await page.locator(`#${id}`).getAttribute('data-rest'))
      for (const id of ['hills', 'work']) {
        await page.locator(`#film .rail a[href="#${id}"]`).evaluate(link => (link as HTMLElement).click())
        const p = await restOf(id)
        const target = R.find(r => r.id === id && Math.abs(r.p - p) < 1e-9)!
        expect(Math.abs((await rest(page)).y - target.y), id).toBeLessThanOrEqual(2)
      }
      await gesture(page, 1)
      const next = R[R.findIndex(r => r.id === 'work' && Math.abs(r.p - 0.06) < 1e-9) + 1]
      expect(Math.abs((await rest(page)).y - next.y)).toBeLessThanOrEqual(2)

      await page.goto('/#work', { waitUntil: 'load' })
      await page.locator('html.stepper').waitFor({ state: 'attached' })
      const R2 = await rests(page)
      const first = R2.find(r => r.id === 'work')!
      expect(Math.abs((await rest(page)).y - first.y)).toBeLessThanOrEqual(2)
      await gesture(page, 1)
      expect(Math.abs((await rest(page)).y - R2[R2.indexOf(first) + 1].y)).toBeLessThanOrEqual(2)
    })
  })
}

test.describe('The stepped film with a mouse and keys', () => {
  test.use(DESK)

  test('one wheel event goes one stop; a burst of thirty is carried on to the next gate and no further (check 1)', async ({ page }) => {
    await open(page)
    const R = await rests(page)
    await wheel(page, 100)
    expect(Math.abs((await rest(page)).y - R[1].y)).toBeLessThanOrEqual(2)
    // Thirty events inside 400 ms, sent without waiting for the page to answer each one.
    const cdp = await page.context().newCDPSession(page)
    const burst = []
    for (let i = 0; i < 30; i++) {
      burst.push(cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY: 150 }))
      await new Promise(done => setTimeout(done, 12))
    }
    await Promise.all(burst)
    await cdp.detach()
    const gate = R.find((r, i) => i > 1 && r.gate)!
    expect(gate.id).toBe('work')
    expect(Math.abs((await rest(page)).y - gate.y)).toBeLessThanOrEqual(2)
  })

  test('a decaying trackpad gesture makes one step, and a new gesture after it one more (check 3)', async ({ page }) => {
    await open(page)
    const R = await rests(page)
    await page.mouse.move(700, 450)
    for (const dy of [120, 90, 70, 50, 35, 25, 15, 10, 6, 3]) { await page.mouse.wheel(0, dy); await page.waitForTimeout(220) }
    expect(Math.abs((await rest(page)).y - R[1].y)).toBeLessThanOrEqual(2)
    await page.waitForTimeout(300)
    await page.mouse.wheel(0, 100)
    expect(Math.abs((await rest(page)).y - R[2].y)).toBeLessThanOrEqual(2)
  })

  test('arrow, page and space keys step once each; typing the shop name never steps (check 8)', async ({ page }) => {
    test.setTimeout(60000)
    await open(page)
    const R = await rests(page)
    let i = 0
    for (const key of ['ArrowDown', 'PageDown', 'Space']) {
      await page.keyboard.press(key)
      i++
      expect(Math.abs((await rest(page)).y - R[i].y), key).toBeLessThanOrEqual(2)
    }
    for (const key of ['ArrowUp', 'PageUp', 'Shift+Space']) {
      await page.keyboard.press(key)
      i--
      expect(Math.abs((await rest(page)).y - R[i].y), key).toBeLessThanOrEqual(2)
    }
    // The brief's last stop shows the name field.
    const brief = R.filter(r => r.id === 'brief').pop()!
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), brief.y)
    await rest(page)
    const field = page.locator('#brief input[data-name-input]')
    await field.click()
    await page.keyboard.type('Maa Tara Stores')
    for (const key of ['ArrowDown', 'ArrowUp', 'PageDown', 'End']) await page.keyboard.press(key)
    await page.waitForTimeout(800)
    expect(Math.abs((await y(page)) - brief.y)).toBeLessThanOrEqual(2)
    await expect(field).toHaveValue('Maa Tara Stores')
  })

  test('with reduced motion there is no stepper and the stills scroll natively (check 10)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/', { waitUntil: 'load' })
    await page.waitForTimeout(500)
    await expect(page.locator('html')).not.toHaveClass(/\bstory\b|\bstepper\b/)
    await page.mouse.move(700, 450)
    await page.mouse.wheel(0, 300)
    await page.waitForTimeout(600)
    expect(await y(page)).toBeGreaterThanOrEqual(290)
    expect(await y(page)).toBeLessThanOrEqual(310)
  })
})

test.describe('The stepped film with touch', () => {
  test.use(PHONE)

  test('a hard flick from any rest lands on the next gate and no further', async ({ page }) => {
    test.setTimeout(120000)
    await open(page)
    const R = await rests(page)
    for (const [id, p] of [['hero', 0], ['brands', 0.5], ['work', 0.2], ['road', 0.14], ['junction', 0.13]] as const) {
      const from = R.find(r => r.id === id && Math.abs(r.p - p) < 1e-9)!
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), from.y)
      await rest(page)
      await swipe(page, -600, 4000)
      const gate = R.find(r => r.y > from.y + 2 && r.gate)!
      expect(Math.abs((await rest(page)).y - gate.y), `from ${id} ${p}`).toBeLessThanOrEqual(2)
    }
  })

  test('three quick swipes inside the junction cross three surfaces with no pause between them', async ({ page }) => {
    await open(page)
    const R = await rests(page)
    const junction = R.filter(r => r.id === 'junction')
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), junction[0].y)
    await rest(page)
    // Count the moves that end (data-film-moving going off) from here on.
    await page.evaluate(() => {
      const w = window as unknown as { __ends: number }
      w.__ends = 0
      new MutationObserver(() => { if (!document.documentElement.hasAttribute('data-film-moving')) w.__ends++ })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-film-moving'] })
    })
    for (let i = 0; i < 3; i++) { await swipe(page, -60, 400); await page.waitForTimeout(60) }
    expect(Math.abs((await rest(page)).y - junction[3].y)).toBeLessThanOrEqual(2)
    expect(await page.evaluate(() => (window as unknown as { __ends: number }).__ends), 'one move, never stopping').toBe(1)
  })

  test('on the work wall the photographs follow the finger, and are let go on to a stop, never past the gate', async ({ page }) => {
    await open(page)
    const R = await rests(page)
    const work = R.filter(r => r.id === 'work')
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), work[1].y)
    await rest(page)
    const wall = page.locator('#work .w-rise')
    const before = (await wall.boundingBox())!.y
    // Finger down and up the screen by 120 px, slowly, without letting go.
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 600 }] })
    for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 600 - i * 10 }] }); await page.waitForTimeout(30) }
    await page.waitForTimeout(100)
    const held = (await wall.boundingBox())!.y
    expect(before - held, 'the wall rose with the finger').toBeGreaterThan(60)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await cdp.detach()
    expect(Math.abs((await rest(page)).y - work[2].y)).toBeLessThanOrEqual(2)
    // A long fast flick goes to the gate at the end of the wall, and no further.
    await swipe(page, -800, 5000)
    expect(Math.abs((await rest(page)).y - work[work.length - 1].y)).toBeLessThanOrEqual(2)
  })

  test('a fast long flick and a slow short drag both end exactly on the next stop (check 2)', async ({ page }) => {
    await open(page)
    const R = await rests(page)
    await swipe(page, -800, 5000)
    expect(Math.abs((await rest(page)).y - R[1].y)).toBeLessThanOrEqual(2)
    await swipe(page, -60, 120)
    expect(Math.abs((await rest(page)).y - R[2].y)).toBeLessThanOrEqual(2)
  })

  test('the page takes panning from the browser only with the stepper running', async ({ page }) => {
    await open(page)
    const pan = await page.evaluate(() => ({
      film: getComputedStyle(document.getElementById('film')!).touchAction,
      root: getComputedStyle(document.documentElement).overscrollBehaviorY,
    }))
    expect(pan).toEqual({ film: 'pinch-zoom', root: 'none' })
  })
})
