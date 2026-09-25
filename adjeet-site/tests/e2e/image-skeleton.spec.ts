import { expect, test } from '@playwright/test'

test('image shimmer keeps moving until a slow image finishes loading', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
    localStorage.setItem('adjeet-consent', 'declined')
  })

  let releaseImage!: () => void
  const imageGate = new Promise<void>(resolve => { releaseImage = resolve })

  await page.route('**/_next/image?**', async route => {
    const source = new URL(route.request().url()).searchParams.get('url')
    if (source === '/Ambuja_cement_ACP-LED.png') {
      await imageGate
    }
    await route.continue()
  })

  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const heroImage = page.locator('[data-hero-image]')
    await expect(heroImage).toHaveAttribute('data-image-status', 'loading')
    await expect(heroImage).toHaveCSS('animation-name', 'image-loading-sweep, image-loading-breathe')
    await heroImage.screenshot({ path: testInfo.outputPath('hero-loading.png') })

    const firstPosition = await heroImage.evaluate(image => getComputedStyle(image).backgroundPosition)
    await page.waitForTimeout(2100)
    const secondPosition = await heroImage.evaluate(image => getComputedStyle(image).backgroundPosition)
    expect(secondPosition).not.toBe(firstPosition)
    await expect(heroImage).toHaveAttribute('data-image-status', 'loading')

    releaseImage()
    await expect(heroImage).toHaveAttribute('data-image-status', 'loaded')
    await expect(heroImage).toHaveCSS('animation-name', 'none')
  } finally {
    releaseImage()
  }
})
