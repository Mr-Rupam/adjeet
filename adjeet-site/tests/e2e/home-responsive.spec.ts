import { test, expect } from '@playwright/test'
import { CLIENT_NAMES } from './support/clients'

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
    await page.locator('#hero-section h1 span').evaluate(element => { (element as HTMLElement).style.fontFamily = 'cursive' })
    const bounds = await page.locator('#hero-section h1 span').evaluate(element => {
      const range = document.createRange(); range.selectNodeContents(element)
      return [...range.getClientRects()].every(rect => rect.left >= 0 && rect.right <= innerWidth)
    })
    expect(bounds).toBe(true)
  })
}

test('client logos load and documented work opens its portfolio filter', async ({ page }) => {
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
  await page.getByRole('link', { name: /Airtel project photos/ }).click()
  await expect(page).toHaveURL(/\/portfolio\?client=airtel$/)
  await expect(page.getByRole('button', { name: 'Airtel', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('section[aria-label="Project gallery"] button').first()).toContainText('Airtel')
})
