import { test, expect, type Page } from '@playwright/test'

// The home film follows the scroll (components/film/story.ts): the browser
// scrolls the page natively and the picture is a function of the scroll
// position, smoothed in time. These checks read the page through
// window.__film, on a phone with touch (390 x 844) and on a desktop with a
// mouse (1440 x 900). Resting only on stops, and the gates, belong to the
// stops module and its own checks.

type Now = { y: number; ch: string; p: number; moving: boolean; rest: number; targetCh: string; targetP: number }
type Stop = { i: number; ch: string; p: number; y: number; gate: boolean }
type Film = { version: number; stops: Stop[]; now: () => Now }

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
  })
}

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
