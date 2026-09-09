import { expect, test } from '@playwright/test'

test.describe('Portfolio filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/portfolio')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
  })

  test('keeps the compact mobile filter rails labelled, scrollable and operable', async ({ page }) => {
    const tradeFilters = page.getByRole('group', { name: 'Filter work by trade' })
    const cityFilters = page.getByRole('group', { name: 'Filter work by city' })

    await expect(tradeFilters).toBeVisible()
    await expect(cityFilters).toBeVisible()
    expect(await tradeFilters.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)
    expect(await cityFilters.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)

    const acp = tradeFilters.getByRole('button', { name: 'ACP & LED Signage' })
    await acp.click()

    await expect(page).toHaveURL(/service=acp-led-signage/)
    await expect(acp).toHaveAttribute('aria-pressed', 'true')
  })

  test('gives the mobile lightbox a full touch target and a useful image frame', async ({ page }) => {
    const card = page.getByRole('button', { name: /view:/i }).first()
    await card.scrollIntoViewIfNeeded()
    await card.click()

    const dialog = page.getByRole('dialog', { name: 'Photo viewer' })
    await expect(dialog).toBeVisible()

    const close = dialog.getByRole('button', { name: 'Close photo viewer' })
    const closeBox = await close.boundingBox()
    expect(closeBox!.width).toBeGreaterThanOrEqual(44)
    expect(closeBox!.height).toBeGreaterThanOrEqual(44)

    const image = dialog.getByRole('img')
    await expect(image).toBeVisible()
    await expect.poll(async () => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    const imageBox = await image.boundingBox()
    expect(imageBox!.width).toBeGreaterThan(300)
    await expect(dialog.getByText(/glow sign board for acc cement/i)).toBeVisible()
  })
})
