import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('adjeet-consent', 'declined'))
})

for (const width of [390, 1280]) {
  test(`new pages start at the top from the footer at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    for (const [name, path] of [['Our story', '/about'], ['Services', '/services'], ['Selected work', '/portfolio'], ['Start a project', '/contact']]) {
      const link = page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name, exact: true })
      await link.scrollIntoViewIfNeeded()
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
      await link.click()
      await expect(page).toHaveURL(path)
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
    }
  })
}

test('section links and browser Back preserve their destinations', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.locator('a[href="/services#storefront"]').click()
  await expect(page).toHaveURL('/services#storefront')
  await expect.poll(() => page.locator('#storefront').evaluate(el => Math.abs(el.getBoundingClientRect().top - 104))).toBeLessThan(5)
  const link = page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Our story' })
  await link.scrollIntoViewIfNeeded()
  await link.click()
  await expect(page).toHaveURL('/about')
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL('/services#storefront')
  await expect.poll(() => page.locator('#storefront').evaluate(el => Math.abs(el.getBoundingClientRect().top - 104))).toBeLessThan(5)
})

test('Back restores the reading position on pages without a fragment', async ({ page }) => {
  await page.goto('/services', { waitUntil: 'domcontentloaded' })
  const link = page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Our story' })
  await link.scrollIntoViewIfNeeded()
  const previousY = await page.evaluate(() => scrollY)
  await link.click()
  await expect(page).toHaveURL('/about')
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5)
  await page.goBack()
  await expect(page).toHaveURL('/services')
  await expect.poll(() => page.evaluate(y => Math.abs(scrollY - y), previousY)).toBeLessThan(5)
})

for (const width of [320, 390, 768]) {
  test(`footer groups share a row without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/about', { waitUntil: 'domcontentloaded' })
    const footer = page.getByRole('contentinfo')
    await footer.scrollIntoViewIfNeeded()
    const nav = await footer.getByText('Find your way').boundingBox()
    const contact = await footer.getByText('Talk to the workshop').boundingBox()
    expect(Math.abs(nav!.y - contact!.y)).toBeLessThan(2)
    const whatsapp = await footer.getByRole('link', { name: 'WhatsApp', exact: true }).boundingBox()
    const call = await footer.getByRole('link', { name: /^Call/ }).boundingBox()
    expect(Math.abs(whatsapp!.y - call!.y)).toBeLessThan(2)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
