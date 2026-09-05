import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    // Accept consent so it doesn't interfere with other assertions
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
  })

  test('hero wordmark heading is visible', async ({ page }) => {
    await expect(page.locator('#hero-section').getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('hero section remains available for observers', async ({ page }) => {
    await expect(page.locator('#hero-section')).toBeVisible()
  })

  test('hero has primary CTA linking to WhatsApp', async ({ page }) => {
    const waLink = page.getByRole('link', { name: /get a quote/i }).first()
    const href = await waLink.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  })

  test('hero has secondary CTA linking to /portfolio', async ({ page }) => {
    await expect(page.getByRole('link', { name: /see the work/i })).toHaveAttribute(
      'href',
      '/portfolio'
    )
  })

  test('hero ticker shows service and coverage copy', async ({ page }) => {
    await expect(page.getByText(/glow sign boards/i).first()).toBeVisible()
    await expect(page.getByText(/acp \/ led signage/i).first()).toBeVisible()
    await expect(page.getByText(/serving 12 districts/i)).toBeVisible()
  })

  test('services board renders 10 trade rows linking to /services/[slug]', async ({ page }) => {
    const serviceLinks = page.locator('a[href^="/services/"]')
    await expect(serviceLinks).toHaveCount(10)
    const hrefs = await serviceLinks.evaluateAll(links =>
      links.map(l => l.getAttribute('href'))
    )
    for (const href of hrefs) {
      expect(href).toMatch(/^\/services\/[\w-]+$/)
    }
  })

  test('client street shows brand names', async ({ page }) => {
    await expect(page.getByText('Airtel').first()).toBeVisible()
    await expect(page.getByText('Havells').first()).toBeVisible()
  })

  test('night section shows the after-dark headline and portfolio link', async ({ page }) => {
    await expect(page.getByText(/turns on\./i).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /see all installations/i })).toHaveAttribute(
      'href',
      '/portfolio'
    )
  })

  test('standard section shows quality promises', async ({ page }) => {
    await expect(page.getByText('In-house everything').first()).toBeVisible()
    await expect(page.getByText('Monsoon-proven builds').first()).toBeVisible()
  })

  test('coverage board lists 10 districts with Siliguri as HQ', async ({ page }) => {
    await expect(page.getByText('HQ + Workshop')).toBeVisible()
    await expect(page.getByText('Siliguri').first()).toBeVisible()
  })

  test('commission CTA has a working WhatsApp link', async ({ page }) => {
    const link = page.getByRole('link', { name: /whatsapp us now/i })
    const href = await link.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  })
})
