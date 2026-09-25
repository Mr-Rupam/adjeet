import { expect, test } from '@playwright/test'
import sharp from 'sharp'

async function centerRowContrast(png: Buffer) {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true })
  const y = Math.floor(info.height / 2)
  let darkest = 255
  let brightest = 0
  for (let x = 12; x < info.width - 12; x++) {
    const offset = (y * info.width + x) * info.channels
    const brightness = data[offset] * 0.2126 + data[offset + 1] * 0.7152 + data[offset + 2] * 0.0722
    darkest = Math.min(darkest, brightness)
    brightest = Math.max(brightest, brightness)
  }
  return brightest - darkest
}

test('pending portfolio images keep a visible shimmer throughout the wait', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
    localStorage.setItem('adjeet-consent', 'declined')
  })

  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('**/_next/image?**', async route => {
    const source = new URL(route.request().url()).searchParams.get('url')
    if (source === '/images/work/supreme-pipe-event-085.webp' || source === '/images/work/supreme-pipe-acp-064.webp') {
      await gate
    }
    await route.continue()
  })

  try {
    await page.goto('/portfolio', { waitUntil: 'domcontentloaded' })
    const card = page.getByRole('button', { name: 'View: Supreme Durga Puja entrance gate' })
    await card.scrollIntoViewIfNeeded()
    const image = card.locator('img')
    await expect(image).toHaveAttribute('data-image-status', 'loading')
    const contrast: number[] = []
    for (let sample = 0; sample < 8; sample++) {
      contrast.push(await centerRowContrast(await image.screenshot()))
      await page.waitForTimeout(300)
    }
    expect(await image.evaluate(element => element.complete)).toBe(false)
    await card.screenshot({ path: testInfo.outputPath('portfolio-pending.png') })
    expect(Math.min(...contrast)).toBeGreaterThan(12)
    release()
    await expect(image).toHaveAttribute('data-image-status', 'loaded')
    await expect.poll(() => image.evaluate(element => element.naturalWidth)).toBeGreaterThan(0)
  } finally {
    release()
  }
})
