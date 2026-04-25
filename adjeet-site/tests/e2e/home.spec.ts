import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    // Accept consent so it doesn't interfere with other assertions
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
  })

  test('hero heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /north bengal's most trusted signage company/i })
    ).toBeVisible()
  })

  test('hero has link to /services', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Our Services' })).toBeVisible()
  })

  test('hero has WhatsApp link', async ({ page }) => {
    const waLink = page.getByRole('link', { name: /whatsapp/i }).first()
    const href = await waLink.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  })

  test('services grid renders 10 tiles', async ({ page }) => {
    const serviceLinks = page.locator('a[href^="/services/"]')
    await expect(serviceLinks).toHaveCount(10)
  })

  test('each service tile links to /services/[slug]', async ({ page }) => {
    const links = await page.locator('a[href^="/services/"]').all()
    for (const link of links) {
      const href = await link.getAttribute('href')
      expect(href).toMatch(/^\/services\/[\w-]+$/)
    }
  })

  test('proof block stats are visible', async ({ page }) => {
    await page.locator('dl').scrollIntoViewIfNeeded()
    await expect(page.getByText('Projects')).toBeVisible()
    await expect(page.getByText('Clients')).toBeVisible()
  })

  test('gallery teaser shows 6 photo buttons', async ({ page }) => {
    const photoButtons = page.locator('[aria-label^="View photo:"]')
    await expect(photoButtons).toHaveCount(6)
  })

  test('trust band shows category tags', async ({ page }) => {
    await expect(page.getByText(/Illuminated/).first()).toBeVisible()
    await expect(page.getByText(/Branding/).first()).toBeVisible()
  })
})
