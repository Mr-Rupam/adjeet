import { test, expect } from '@playwright/test'

test('mobile hero shows the night scene and WhatsApp action in the first screen', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('adjeet-consent', 'declined'))
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const { width, height } of [{ width: 320, height: 700 }, { width: 390, height: 844 }, { width: 768, height: 900 }]) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const image = page.locator('#hero-section [data-hero-image="day"]')
    const heading = page.locator('#hero-section h1')
    const action = page.locator('#hero-section').getByRole('link', { name: 'WhatsApp your project' })
    await expect(image).toBeVisible()
    await expect(action).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    const headingLines = await heading.evaluate(element => {
      const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight)
      return element.getBoundingClientRect().height / lineHeight
    })
    expect(headingLines, `${width}px: the headline should stay at three lines`).toBeLessThan(3.3)

    const imageBox = await image.boundingBox()
    const actionBox = await action.boundingBox()
    expect(imageBox).not.toBeNull()
    expect(actionBox).not.toBeNull()
    expect(imageBox!.y, `${width}px: the scene should start near the top`).toBeLessThan(180)
    expect(imageBox!.width, `${width}px: the scene should span the full width`).toBeGreaterThan(width * 0.9)
    expect(imageBox!.height, `${width}px: image should be a major part of the hero`).toBeGreaterThan(height * 0.6)
    // The tall cut is 941px wide, so this checks what the page asks for, not
    // the size of the source file: the copy requested must be at least as wide
    // as the artwork is drawn.
    const requestedWidth = await image.evaluate(async element => {
      const image = element as HTMLImageElement
      await image.decode()
      return Number(new URL(image.currentSrc).searchParams.get('w'))
    })
    expect(requestedWidth, `${width}px: the page should request a copy as wide as the image is drawn`).toBeGreaterThanOrEqual(imageBox!.width)
    expect(actionBox!.y + actionBox!.height, `${width}px: WhatsApp action should fit on screen`).toBeLessThanOrEqual(height)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  }
})

for (const width of [320, 390, 430, 768, 1440]) {
  test(`the still frames fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    // Since 16 November 2026 the hero is the film's first chapter and the questions follow the film.
    const sectionOrder = await page.locator('[data-home-page] > [id]').evaluateAll(sections => sections.map(section => section.id))
    expect(sectionOrder).toEqual(['film', 'questions'])
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme)
      const overflow = await page.locator('#film h1, #film h2, #film li, #film p, #film figcaption').evaluateAll(elements => {
        return elements.flatMap(element => {
          const range = document.createRange()
          range.selectNodeContents(element)
          return [...range.getClientRects()].filter(rect => rect.left < -1 || rect.right > innerWidth + 1).map(() => element.textContent)
        })
      })
      expect(overflow).toEqual([])
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}

test('the proof chapter shows the gallery photographs and links the whole portfolio', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const photos = page.locator('#proof .shot img')
  await expect(photos).toHaveCount(6)
  const loaded = await photos.evaluateAll(async images => {
    for (const image of images) {
      image.scrollIntoView({ block: 'center' })
      await (image as HTMLImageElement).decode().catch(() => undefined)
    }
    return images.every(image => (image as HTMLImageElement).naturalWidth > 0)
  })
  expect(loaded).toBe(true)
  await page.locator('#proof').getByRole('link', { name: 'See all the work' }).click()
  await expect(page).toHaveURL('/portfolio')
})
