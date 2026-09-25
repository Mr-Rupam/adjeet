import { expect, test } from '@playwright/test'

test('first entry plays the branded shutter once and can be skipped', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const intro = page.locator('[data-entry-loader]')
  await expect(intro).toBeVisible()
  await expect(intro.getByRole('img', { name: 'AD JEET, since 1990' })).toBeVisible()
  await page.mouse.wheel(0, 900)
  await page.waitForTimeout(100)
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await intro.getByRole('button', { name: /Skip intro/ }).click()
  await expect(intro).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await page.reload()
  await expect(intro).toBeHidden()
})

test('the shutter opens gradually before it clears the page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const motion = await page.locator('[data-entry-loader] [class*="shutterTop"]').evaluate((shutter) => {
    const animation = shutter.getAnimations()[0]
    animation.pause()
    const sample = (time: number) => {
      animation.currentTime = time
      return new DOMMatrixReadOnly(getComputedStyle(shutter).transform).m42 / shutter.clientHeight
    }

    return {
      duration: Number(animation.effect?.getTiming().duration),
      closed: sample(500),
      opening: sample(1800),
      cleared: sample(3300),
    }
  })

  expect(motion.duration).toBe(3300)
  expect(motion.closed).toBeCloseTo(0, 1)
  expect(motion.opening).toBeLessThan(-0.1)
  expect(motion.opening).toBeGreaterThan(-0.5)
  expect(motion.cleared).toBeLessThan(-1)
})

test('intro clears itself and leaves the page usable', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-entry-loader]')).toBeHidden({ timeout: 5000 })
  await expect(page.locator('#hero-section').getByRole('link', { name: 'WhatsApp your project' })).toBeVisible()
})

test('reduced motion skips the intro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('[data-entry-loader]')).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('the page remains visible with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('[data-entry-loader]')).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await context.close()
})
