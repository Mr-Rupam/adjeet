import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
    localStorage.setItem('adjeet-consent', 'declined')
  })
})

const caption = (page: import('@playwright/test').Page) => page.locator('#hero-section [data-hero-caption]')

test('the hero opens on Ambuja, rotates to other work and can be paused', async ({ page }) => {
  test.setTimeout(60000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(caption(page)).toHaveAccessibleName('Explore Ambuja Cement ACP and LED signage')
  await expect(page.locator('#hero-section [data-hero-image]')).toHaveCount(1)

  // Keep the pointer and focus off the photo, which would hold the rotation.
  await page.mouse.move(80, 850)
  await expect(caption(page)).not.toHaveAccessibleName(/Ambuja Cement/, { timeout: 15000 })
  const active = page.locator('#hero-section [data-hero-slide][data-active]')
  await expect(active).toHaveCount(1)
  await expect(active).not.toHaveAttribute('data-hero-slide', '0')
  await expect(active).toHaveAttribute('data-image-status', 'loaded')

  const pause = page.getByRole('button', { name: 'Pause the photo slideshow' })
  await pause.click()
  await expect(page.getByRole('button', { name: 'Play the photo slideshow' })).toHaveAttribute('aria-pressed', 'true')
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.mouse.move(80, 850)
  const paused = await caption(page).getAttribute('aria-label')
  await page.waitForTimeout(8000)
  await expect(caption(page)).toHaveAttribute('aria-label', paused!)
})

test('reduced motion keeps the first photo and loads no others', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('[data-hero-image]')).toHaveAttribute('data-image-status', 'loaded')
  await page.waitForTimeout(1000)
  await expect(page.locator('#hero-section [data-hero-slide]')).toHaveCount(1)
  await expect(page.getByRole('button', { name: /photo slideshow/ })).toHaveCount(0)
  await expect(caption(page)).toHaveAccessibleName('Explore Ambuja Cement ACP and LED signage')
})
