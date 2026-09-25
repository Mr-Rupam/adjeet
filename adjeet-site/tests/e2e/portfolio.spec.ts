import { expect, test } from '@playwright/test'
import { photos } from '../../content/gallery'

test.describe('Portfolio browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/portfolio')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
  })

  test('keeps the mobile trade filter operable and gives each project the same space', async ({ page }) => {
    const tradeFilters = page.getByRole('group', { name: 'Filter work by trade' })

    await expect(tradeFilters).toBeVisible()
    await expect(page.getByRole('group', { name: 'Filter work by brand' })).toHaveCount(0)
    expect(await tradeFilters.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)

    const gallery = page.locator('section[aria-label="Project gallery"]')
    const first = await gallery.getByRole('button', { name: /^View:/ }).nth(0).locator('img').boundingBox()
    const second = await gallery.getByRole('button', { name: /^View:/ }).nth(1).locator('img').boundingBox()
    expect(first!.width).toBeCloseTo(second!.width, 0)
    expect(first!.height).toBeCloseTo(second!.height, 0)

    const acp = tradeFilters.getByRole('button', { name: 'ACP & LED Signage' })
    await acp.click()

    await expect(page).toHaveURL(/service=acp-led-signage/)
    await expect(acp).toHaveAttribute('aria-pressed', 'true')
  })

  test('old company-filter URLs return to the full portfolio', async ({ page }) => {
    await page.goto('/portfolio?client=airtel')
    await expect(page).toHaveURL('/portfolio')
    await expect(page.getByRole('group', { name: 'Filter work by brand' })).toHaveCount(0)
    await expect(page.locator('section[aria-label="Project gallery"] button')).toHaveCount(photos.length)
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
    await expect(dialog.getByText(photos[0].alt)).toBeVisible()
  })
})
