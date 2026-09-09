import { test, expect, type Page } from '@playwright/test'

/**
 * The hero sky is a canvas, so there is no DOM to assert against: these read
 * pixels back off it. They exist because the mechanic cannot be verified in an
 * embedded preview pane, where the page is permanently document.hidden and
 * requestAnimationFrame never fires.
 */

/** Average colour of a strip near the top of the canvas, i.e. the sky. */
async function skyLuma(page: Page): Promise<number> {
  return page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('canvas.street-sky')
    if (!c) throw new Error('hero canvas not found')
    const ctx = c.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('no 2d context')
    const y = Math.round(c.height * 0.1)
    const { data } = ctx.getImageData(0, y, c.width, 1)
    let sum = 0
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    }
    return sum / (data.length / 4)
  })
}

/**
 * Wait for the canvas to have painted AND for the whole sequence to be in the
 * HTTP cache. Waiting only for first paint made the scrub assertions flaky:
 * the scrub would ask for a frame that had not decoded yet and correctly fall
 * back to the nearest one, which is right behaviour but not what these tests
 * are measuring.
 */
async function waitForSky(page: Page) {
  await page.waitForFunction(() => {
    const c = document.querySelector<HTMLCanvasElement>('canvas.street-sky')
    if (!c || c.width === 0) return false
    const ctx = c.getContext('2d', { willReadFrequently: true })
    if (!ctx) return false
    const d = ctx.getImageData(Math.round(c.width / 2), Math.round(c.height * 0.1), 1, 1).data
    if (d[0] + d[1] + d[2] === 0) return false
    const seq = performance
      .getEntriesByType('resource')
      .filter(e => e.name.includes('/hero/seq/'))
    return seq.length >= 24
  }, undefined, { timeout: 20000 })
}

test.describe('Hero sky', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
  })

  test('rests on daylight in day theme and night in night theme', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('adjeet-theme', 'light'))
    await page.reload()
    await waitForSky(page)
    const day = await skyLuma(page)

    await page.evaluate(() => localStorage.setItem('adjeet-theme', 'dark'))
    await page.reload()
    await waitForSky(page)
    const night = await skyLuma(page)

    // The whole premise: night is materially darker than day.
    expect(day).toBeGreaterThan(night + 30)
  })

  test('flipping the switch carries the sky from day to night', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('adjeet-theme', 'light'))
    await page.reload()
    await waitForSky(page)
    const before = await skyLuma(page)

    await page.getByRole('button', { name: /switch to dark mode/i }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    // The flip is a 1.1s tween; give it room to land.
    await page.waitForTimeout(1800)
    const after = await skyLuma(page)

    expect(after).toBeLessThan(before - 30)
  })

  test('scrolling the hero sets the sun without reaching full night', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('adjeet-theme', 'light'))
    await page.reload()
    await waitForSky(page)
    const atTop = await skyLuma(page)

    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }))
    await page.waitForTimeout(600)
    const scrolled = await skyLuma(page)

    // Scrolling darkens it...
    expect(scrolled).toBeLessThan(atTop - 5)

    // ...but stops at dusk, so it stays lighter than a committed night.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.evaluate(() => localStorage.setItem('adjeet-theme', 'dark'))
    await page.reload()
    await waitForSky(page)
    const fullNight = await skyLuma(page)
    expect(scrolled).toBeGreaterThan(fullNight)
  })

  test('hero copy and CTAs are visible over the footage', async ({ page }) => {
    await waitForSky(page)
    await expect(page.locator('#hero-section').getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /get a quote/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /see the work/i })).toBeVisible()
  })
})
