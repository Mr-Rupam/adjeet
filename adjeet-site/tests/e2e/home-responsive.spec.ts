import { test, expect } from '@playwright/test'
import { CLIENT_NAMES } from './support/clients'

test('mobile hero shows the work and WhatsApp action in the first screen', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('adjeet-consent', 'declined'))
  await page.emulateMedia({ reducedMotion: 'reduce' })

  for (const { width, height } of [{ width: 320, height: 700 }, { width: 390, height: 844 }, { width: 768, height: 900 }]) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    const image = page.locator('#hero-section [data-hero-image]')
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
    expect(imageBox!.y, `${width}px: real work should start near the header`).toBeLessThan(180)
    expect(imageBox!.width, `${width}px: the project should fill the opening`).toBeGreaterThan(width * 0.9)
    expect(imageBox!.height, `${width}px: image should be a major part of the hero`).toBeGreaterThan(height * 0.6)
    const requestedWidth = await image.evaluate(async element => {
      const image = element as HTMLImageElement
      await image.decode()
      return image.naturalWidth
    })
    expect(requestedWidth, `${width}px: image should be sharp at its rendered width`).toBeGreaterThanOrEqual(imageBox!.width)
    expect(actionBox!.y + actionBox!.height, `${width}px: WhatsApp action should fit on screen`).toBeLessThanOrEqual(height)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  }
})

for (const width of [320, 390, 430, 768, 1440]) {
  test(`hero and client names fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    // Since the 1612d04 redesign the client history follows the selected work
    // instead of sitting directly under the hero (design-loop.md, "Coverage and purpose").
    const sectionOrder = await page.locator('[data-home-page] > [id]').evaluateAll(sections => sections.map(section => section.id))
    expect(sectionOrder.slice(0, 3)).toEqual(['hero-section', 'selected-work', 'client-history'])
    expect(CLIENT_NAMES.length).toBeGreaterThan(0)
    await expect(page.locator('#client-history [data-client-name]')).toHaveText(CLIENT_NAMES)
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme)
      const overflow = await page.locator('#hero-section h1, #client-history h2, #client-history li, #client-history p').evaluateAll(elements => {
        return elements.flatMap(element => {
          const range = document.createRange()
          range.selectNodeContents(element)
          return [...range.getClientRects()].filter(rect => rect.left < -1 || rect.right > innerWidth + 1).map(() => element.textContent)
        })
      })
      expect(overflow).toEqual([])
    }
  })
}

test('client logos load without company-specific links', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const logos = page.locator('#client-history img')
  await expect(logos).toHaveCount(CLIENT_NAMES.length)
  const loaded = await logos.evaluateAll(async images => {
    for (const image of images) {
      image.scrollIntoView({ block: 'center' })
      await (image as HTMLImageElement).decode().catch(() => undefined)
    }
    return images.every(image => (image as HTMLImageElement).naturalWidth > 0)
  })
  expect(loaded).toBe(true)
  await expect(page.locator('#client-history li a')).toHaveCount(0)
  await page.getByRole('link', { name: /Explore the portfolio/ }).click()
  await expect(page).toHaveURL('/portfolio')
  await expect(page.getByRole('group', { name: 'Filter work by brand' })).toHaveCount(0)
})
