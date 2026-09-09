import { test, expect } from '@playwright/test'

for (const width of [320, 390, 430, 768, 1440]) {
  test(`hero and client names fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('#hero-section + #client-history')).toHaveCount(1)
    await expect(page.locator('#client-history li')).toHaveCount(19)
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
