import { test, expect, type Page } from '@playwright/test'
import { COVERAGE_AREAS } from '../../lib/coverage'

/**
 * The map has a 3D layer, but nothing may depend on it.
 *
 * These tests run with WebGL removed, which is the same path taken by phones,
 * reduced-motion visitors and anything without a GPU. Everything the map offers
 * has to still be here.
 */
async function withoutWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function patched(
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
      return (original as (...args: unknown[]) => unknown).call(this, type, ...rest)
    } as typeof HTMLCanvasElement.prototype.getContext
  })
}

test.describe('Coverage map', () => {
  test.beforeEach(async ({ page }) => {
    await withoutWebGL(page)
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
  })

  test('lists every coverage area as a real control, with no WebGL', async ({ page }) => {
    const list = page.getByRole('list', { name: 'Areas we serve' })
    await expect(list).toBeVisible()

    for (const area of COVERAGE_AREAS) {
      await expect(list.getByRole('button', { name: new RegExp(area.name, 'i') })).toBeVisible()
    }

    // The terrain must not have loaded: this visitor has no WebGL.
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  /**
   * The map states coverage, not a record of past work. An earlier version
   * graded each place by how many gallery photos could be pinned to it, which
   * put "4 projects" beside "on route" and read as a league table. Every place
   * is now described the same way, by distance from the workshop.
   */
  test('describes every place the same way, with no project counts', async ({ page }) => {
    const list = page.getByRole('list', { name: 'Areas we serve' })

    await expect(list.getByText(/project/i)).toHaveCount(0)
    await expect(list.getByText(/on route/i)).toHaveCount(0)

    // Every place except the workshop carries its distance, and only the
    // workshop is singled out.
    await expect(list.getByText(/^\d+ km$/)).toHaveCount(COVERAGE_AREAS.length - 1)
    await expect(list.getByText('Workshop', { exact: true })).toHaveCount(1)
  })

  test('says how far the reach rings go, so the radius can be read', async ({ page }) => {
    await expect(page.getByText(/rings mark .* kilometres from our Siliguri workshop/i)).toBeVisible()
  })

  test('selecting a place opens its detail and carries the city to the enquiry', async ({ page }) => {
    const list = page.getByRole('list', { name: 'Areas we serve' })
    await list.getByRole('button', { name: /Jalpaiguri/i }).click()

    await expect(page.getByRole('heading', { level: 3, name: 'Jalpaiguri' })).toBeVisible()
    await expect(page.getByText(/km from the workshop/i)).toBeVisible()

    const quote = page.getByRole('link', { name: /Get a quote for Jalpaiguri/i })
    await expect(quote).toHaveAttribute('href', '/contact?city=Jalpaiguri')
  })

  test('the workshop is the one place described as the base', async ({ page }) => {
    const list = page.getByRole('list', { name: 'Areas we serve' })
    await list.getByRole('button', { name: /Siliguri/i }).click()

    await expect(page.getByText(/our workshop and base/i)).toBeVisible()
  })

  test('the enquiry form preselects the city the map sent', async ({ page }) => {
    await page.goto('/contact?city=Jalpaiguri')
    await expect(page.locator('#lead-city')).toHaveValue('Jalpaiguri')
  })

  test('a city the schema does not accept is ignored rather than preselected', async ({ page }) => {
    await page.goto('/contact?city=Atlantis')
    await expect(page.locator('#lead-city')).toHaveValue('')
  })

  test('the About page runs the same map', async ({ page }) => {
    await page.goto('/about')
    const list = page.getByRole('list', { name: 'Areas we serve' })
    await expect(list.getByRole('button', { name: /Siliguri/i })).toBeVisible()
    await expect(page.locator('canvas')).toHaveCount(0)
  })
})
