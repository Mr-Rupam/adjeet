import { test, expect, type Page } from '@playwright/test'
import { LEGACY_REGIONAL_REDIRECTS } from '../../content/legacy-regional'
import { TOWNS, townPath } from '../../content/areas'
import { COVERAGE_AREAS } from '../../lib/coverage'

// /areas, the town pages under it, and the 27 retired regional URLs that now
// redirect to them or to the service pages.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('adjeet-consent', 'declined')
    localStorage.setItem('adjeet-theme', 'light')
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
  })
})

test('every retired regional URL answers 308 with its new home and keeps the query', async ({ request }) => {
  for (const { source, destination } of LEGACY_REGIONAL_REDIRECTS) {
    const response = await request.get(source + '?city=Malda', { maxRedirects: 0 })
    expect(response.status(), source).toBe(308)
    const location = new URL(response.headers()['location'], 'http://localhost')
    expect(location.pathname + location.search, source).toBe(destination + '?city=Malda')
    const landed = await request.get(destination)
    expect(landed.status(), destination).toBe(200)
  }
})

/** The lead form's city select, once hydration has applied any prefill. */
const leadCity = (page: Page) => page.locator('form').filter({ has: page.locator('#lead-name') }).locator('#lead-city')

test.describe('the page\'s own town wins over ?city=', () => {
  test('an old Siliguri link lands on the service page with Siliguri and the trade', async ({ page }) => {
    await page.goto('/glow-sign-board-in-siliguri?city=Malda')
    await expect(page).toHaveURL(/\/services\/glow-sign-boards\?city=Malda$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Glow Sign Boards')
    await expect(leadCity(page)).toHaveValue('Siliguri')
    await expect(page.locator('input[type="checkbox"][value="glow-sign-boards"]')).toBeChecked()
    await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(1)
  })

  test('a town page keeps its town', async ({ page }) => {
    await page.goto('/areas/cooch-behar?city=Malda')
    await expect(leadCity(page)).toHaveValue('Cooch Behar')
    await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(0)
  })

  test('an old town link lands on the town page with the town filled in', async ({ page }) => {
    await page.goto('/flex-printing-in-jalpaiguri')
    await expect(page).toHaveURL(/\/areas\/jalpaiguri$/)
    await expect(leadCity(page)).toHaveValue('Jalpaiguri')
  })

  test('the areas page has no town of its own, so ?city= still applies', async ({ page }) => {
    await page.goto('/areas?city=Kalimpong')
    await expect(leadCity(page)).toHaveValue('Kalimpong')
  })
})

test('the areas page lists every coverage place the same way and links the town pages', async ({ page }) => {
  await page.goto('/areas')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.getByRole('list', { name: 'Areas we serve' }).getByRole('listitem')).toHaveCount(COVERAGE_AREAS.length)
  await expect(page.locator('ul[aria-label$="places and distances"] > li')).toHaveCount(COVERAGE_AREAS.length)
  for (const town of TOWNS) await expect(page.locator(`main a[href="${townPath(town)}"]`).first()).toBeVisible()
})

test('a town page below its quality gate is noindex, follow; the others are indexable', async ({ page }) => {
  for (const town of TOWNS) {
    await page.goto(townPath(town))
    const robots = page.locator('meta[name="robots"]')
    if (town.indexable) await expect(robots).toHaveCount(0)
    else await expect(robots).toHaveAttribute('content', 'noindex, follow')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://adjeet.in' + townPath(town))
  }
})

test('the footer links the four main trades and the areas page', async ({ page }) => {
  await page.goto('/about')
  const footer = page.getByRole('contentinfo')
  await expect(footer.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Areas we cover', exact: true })).toHaveAttribute('href', '/areas')
  const trades = footer.getByRole('navigation', { name: 'Main trades' }).getByRole('link')
  await expect(trades).toHaveText(['Glow sign boards', 'ACP and 3D LED letters', 'Flex printing', 'Vehicle branding'])
})

for (const route of ['/areas', '/areas/cooch-behar', '/areas/gangtok', '/services/acp-led-signage']) {
  for (const width of [320, 390, 1440]) {
    test(`${route} has no sideways scroll at ${width}px in either theme`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(route)
      await page.evaluate(() => document.fonts.ready)
      for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `${theme}`).toBeLessThanOrEqual(0)
      }
    })
  }
}
