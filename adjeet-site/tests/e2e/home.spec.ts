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
      page.getByRole('heading', {
        name: /north bengal signage that gets seen, built in siliguri since 1990/i,
      })
    ).toBeVisible()
  })

  test('hero section remains available for observers', async ({ page }) => {
    await expect(page.locator('#hero-section')).toBeVisible()
  })

  test('hero has link to /services', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Our Services' })).toBeVisible()
  })

  test('hero has WhatsApp link', async ({ page }) => {
    const waLink = page.getByRole('link', { name: /whatsapp/i }).first()
    const href = await waLink.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  })

  test('hero shows service and coverage copy', async ({ page }) => {
    await expect(page.getByText(/glow sign boards/i).first()).toBeVisible()
    await expect(page.getByText(/acp\/led signage/i).first()).toBeVisible()
    await expect(page.getByText(/siliguri, jalpaiguri, cooch behar, darjeeling, and malda/i)).toBeVisible()
  })

  test('services index renders 5 featured service rows', async ({ page }) => {
    const serviceLinks = page.locator('a[href^="/services/"]')
    await expect(serviceLinks).toHaveCount(5)
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

  test('selected work shows 4 photo buttons', async ({ page }) => {
    const photoButtons = page.locator('[aria-label^="View:"]')
    await expect(photoButtons).toHaveCount(4)
  })

  test('standard section shows quality promises', async ({ page }) => {
    await expect(page.getByText(/In-house workshop/).first()).toBeVisible()
    await expect(page.getByText(/Monsoon-proven builds/).first()).toBeVisible()
  })

  test('client showcase has editorial heading', async ({ page }) => {
    await page.locator('section').filter({ hasText: /airtel.*jio.*havells/i }).scrollIntoViewIfNeeded()
    await expect(page.getByText(/airtel\. jio\. havells\./i).first()).toBeVisible()
  })

  test('client showcase view our work links to portfolio', async ({ page }) => {
    const link = page.getByRole('link', { name: /view our work/i })
    await expect(link).toHaveAttribute('href', '/portfolio')
  })

  test('client showcase get a quote has valid WhatsApp URL', async ({ page }) => {
    const quoteLinks = page.getByRole('link', { name: /get a quote/i })
    const href = await quoteLinks.first().getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  })

  test('client showcase displays brand names', async ({ page }) => {
    await page.locator('section').filter({ hasText: /airtel.*jio.*havells/i }).scrollIntoViewIfNeeded()
    await expect(page.getByText('Airtel').first()).toBeVisible()
    await expect(page.getByText('Havells').first()).toBeVisible()
  })
})
