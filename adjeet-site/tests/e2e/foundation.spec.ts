import { test, expect } from '@playwright/test'

test.describe('Foundation', () => {
  test('page has AD-JEET in the nav', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'AD-JEET' })).toBeVisible()
  })

  test('skip link is focusable and present in DOM', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.getByText('Skip to main content')
    await expect(skipLink).toBeVisible()
  })

  test('main content region exists', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#main-content').first()).toBeAttached()
  })

  test('consent banner appears and can be accepted', async ({ page }) => {
    await page.goto('/')
    const banner = page.getByRole('dialog', { name: /consent/i })
    await expect(banner).toBeVisible()
    await page.getByRole('button', { name: /accept/i }).click()
    await expect(banner).not.toBeVisible()
  })

  test('consent banner is not shown after acceptance', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
    await expect(page.getByRole('dialog', { name: /consent/i })).not.toBeVisible()
  })

  test('nav has Services, Portfolio, About, Contact links', async ({ page }) => {
    await page.goto('/')
    for (const name of ['Services', 'Portfolio', 'About', 'Contact']) {
      await expect(page.getByRole('link', { name })).toBeAttached()
    }
  })

  test('footer contains address text', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Siliguri/i).first()).toBeVisible()
  })
})
