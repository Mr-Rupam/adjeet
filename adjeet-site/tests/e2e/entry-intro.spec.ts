import { expect, test } from '@playwright/test'

test('a direct homepage landing plays the branded shutter once and can be skipped', async ({ page }) => {
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

test('the shutter never plays on other pages, nor on the homepage reached from one', async ({ page }) => {
  for (const path of ['/about', '/portfolio', '/services/glow-sign-boards', '/glow-sign-board-in-siliguri']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).not.toHaveAttribute('data-entry-intro', 'playing')
    await expect(page.locator('[data-entry-loader]')).toBeHidden()
    // A fresh session for the next path, so each one is a first landing.
    await page.evaluate(() => sessionStorage.clear())
  }

  // The session began on another page, so a later full load of the homepage stays quiet.
  await page.goto('/about', { waitUntil: 'domcontentloaded' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-entry-loader]')).toBeHidden()
  await expect(page.locator('html')).not.toHaveAttribute('data-entry-intro', 'playing')
})

test('the hero photo loads first and paints under the shutter', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('html')).toHaveAttribute('data-entry-intro', 'playing')

  // The first slide is preloaded at high priority from the document head.
  const preload = page.locator('link[rel="preload"][as="image"][fetchpriority="high"]')
  await expect(preload).toHaveCount(1)
  expect(await preload.getAttribute('imagesrcset')).toContain('ambuja-cement-acp-126.webp')
  // The intro's own logo never competes for that bandwidth.
  await expect(page.locator('link[rel="preload"][imagesrcset*="adjeet-original.png"][fetchpriority="high"]')).toHaveCount(0)
  const introLogo = page.locator('[data-entry-loader] img')
  await expect(introLogo).toHaveAttribute('loading', 'lazy')
  await expect(introLogo).toHaveAttribute('fetchpriority', 'low')

  // While the shutter is still closed, the hero image has loaded and is fully
  // painted beneath it: not faded, not clipped, not waiting for the intro.
  const hero = page.locator('[data-hero-image]')
  await expect(hero).toHaveAttribute('data-image-status', 'loaded', { timeout: 3000 })
  await expect(page.locator('html')).toHaveAttribute('data-entry-intro', 'playing')
  const painted = await hero.evaluate(image => {
    const style = getComputedStyle(image)
    return { opacity: style.opacity, clipPath: style.clipPath, visibility: style.visibility }
  })
  expect(painted).toEqual({ opacity: '1', clipPath: 'none', visibility: 'visible' })

  // The largest paint is the hero photo, and it lands before the 3.3 s shutter ends.
  const lcp = await page.evaluate(() => new Promise<{ src: string; time: number }>(resolve => {
    new PerformanceObserver(list => {
      const entries = list.getEntries() as Array<PerformanceEntry & { element?: Element; url?: string; renderTime?: number; loadTime?: number }>
      const last = entries[entries.length - 1]
      resolve({ src: last.url ?? (last.element as HTMLImageElement | undefined)?.currentSrc ?? '', time: last.startTime })
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  }))
  expect(decodeURIComponent(lcp.src)).toContain('ambuja-cement-acp-126.webp')
  expect(lcp.time).toBeLessThan(3300)
})

test('the shutter causes no layout shift', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-entry-loader]')).toBeHidden({ timeout: 6000 })
  const shift = await page.evaluate(() => new Promise<number>(resolve => {
    let total = 0
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) total += entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
    setTimeout(() => resolve(total), 300)
  }))
  expect(shift).toBeLessThan(0.05)
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
