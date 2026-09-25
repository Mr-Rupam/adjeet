import { expect, test } from '@playwright/test'

test('the contact page embeds the workshop listing at usable sizes', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/contact')

    const map = page.getByTitle('AD JEET workshop in Patiram Jote, Siliguri on Google Maps')
    await map.scrollIntoViewIfNeeded()
    await expect(map).toBeVisible()
    const src = new URL((await map.getAttribute('src'))!, page.url())
    expect(src.hostname).toBe('maps.google.com')
    expect(src.searchParams.get('cid')).toBe('1175174050283154218')
    expect(src.searchParams.get('output')).toBe('embed')
    const bounds = await map.boundingBox()
    expect(bounds!.width).toBeGreaterThan(200)
    expect(bounds!.height).toBeGreaterThan(200)

    await expect(page.getByRole('link', { name: /Open our Google Maps listing/i }))
      .toHaveAttribute('href', 'https://maps.google.com/?cid=1175174050283154218')
  }
})

test('the About workshop follows the global day and night transition', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/about')

  const scene = page.getByRole('img', { name: 'Visualisation of the AD JEET workshop in Siliguri' })
  await expect(scene).toHaveAttribute('data-time', 'light')
  await expect(scene.locator('[data-testid="hero-day-layer"]')).toHaveAttribute('data-visible', 'true')

  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(scene).toHaveAttribute('data-transition', 'day-to-night')
  await expect.poll(() => scene.locator('video').first().evaluate(video => (video as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0)
  await expect(scene).toHaveAttribute('data-transition', 'idle', { timeout: 15000 })
  await expect(scene).toHaveAttribute('data-time', 'dark')
  await expect(scene.locator('[data-testid="hero-night-layer"]')).toHaveAttribute('data-visible', 'true')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Switch to light mode' }).click()
  await expect(scene).toHaveAttribute('data-time', 'light')
  await expect(scene).toHaveAttribute('data-transition', 'idle')
  await expect(scene.locator('[data-testid="hero-day-layer"]')).toHaveAttribute('data-visible', 'true')
})

test('phone client cards and reach signs contain their text', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    const cards = page.locator('#client-history [data-home-client]')
    await expect(cards).toHaveCount(21)
    const columns = await page.locator('#client-history ul[aria-label="Brands in our work history"]')
      .evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').map(parseFloat))
    expect(columns).toHaveLength(3)
    expect(Math.max(...columns) - Math.min(...columns)).toBeLessThan(1)

    const signs = page.locator('svg[aria-hidden="true"] [data-map-place]')
    await expect(signs).toHaveCount(11)
    const labelsFit = await signs.evaluateAll(nodes => nodes.every(node => {
      const face = node.querySelector<SVGRectElement>('[data-board-face]')!
      const label = node.querySelector<SVGTextElement>('text')!
      const labelBox = label.getBBox()
      const faceX = face.x.baseVal.value
      const faceWidth = face.width.baseVal.value
      return labelBox.x >= faceX + 3 && labelBox.x + labelBox.width <= faceX + faceWidth - 3
    }))
    expect(labelsFit).toBe(true)

    await page.getByRole('list', { name: 'Areas we serve' })
      .getByRole('button', { name: /North Dinajpur/i }).click()
    await expect(page.getByRole('heading', { level: 3, name: 'North Dinajpur' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Get a quote for North Dinajpur' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  }
})
