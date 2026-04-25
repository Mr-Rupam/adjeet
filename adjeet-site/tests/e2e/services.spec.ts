import { test, expect } from '@playwright/test'

test.describe('/services overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
    await page.goto('/services')
  })

  test('page heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Our Services', level: 1 })).toBeVisible()
  })

  test('renders 10 service tiles with taglines', async ({ page }) => {
    const serviceLinks = page.locator('a[href^="/services/"]')
    await expect(serviceLinks).toHaveCount(10)
    // First service tagline visible in expanded mode
    await expect(page.getByText('Illuminate your brand 24/7')).toBeVisible()
  })
})

test.describe('/services/[slug] detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services/glow-sign-boards')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
    await page.goto('/services/glow-sign-boards')
  })

  test('renders service name as heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Glow Sign Boards' })
    ).toBeVisible()
  })

  test('breadcrumb shows correct path', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(breadcrumb.getByRole('link', { name: 'Services' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Glow Sign Boards', level: 1 })).toBeVisible()
  })

  test('FAQ accordion opens and closes', async ({ page }) => {
    const firstQuestion = page.getByRole('button', { name: /how long do the led strips last/i })
    await expect(firstQuestion).toBeVisible()
    await firstQuestion.click()
    await expect(page.getByText(/30,000–50,000 hours/)).toBeVisible()
    await firstQuestion.click()
    await expect(page.getByText(/30,000–50,000 hours/)).not.toBeVisible()
  })

  test('WhatsApp CTA href starts with wa.me', async ({ page }) => {
    const waLink = page.getByRole('link', { name: /chat on whatsapp/i })
    await expect(waLink).toBeVisible()
    const href = await waLink.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  })

  test('related services section renders', async ({ page }) => {
    await expect(page.getByText('Related Services')).toBeVisible()
  })

  test('returns 404 for unknown slug', async ({ page }) => {
    await page.goto('/services/not-a-real-service')
    await expect(page.getByText(/404|not found/i)).toBeVisible()
  })
})
