import { test, expect, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('adjeet-consent', 'declined'))
})

/**
 * The new page is at the top, and stays there. ScrollTrigger's refresh runs a
 * frame or more after the route changes (up to ~200ms later when it waits for
 * scrolling to settle) and used to scroll back to the previous page's position,
 * so a check straight after navigating could pass on the brief moment at 0.
 */
async function expectToStayAtTop(page: Page) {
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
  await page.waitForTimeout(600)
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5)
}

for (const width of [390, 1280]) {
  // /portfolio runs no scroll animations of its own, and every route into it
  // used to open at the previous page's scroll position (live on adjeet.in
  // after 7ca85ee). See the note in components/motion/SiteMotion.tsx.
  test(`new pages start at the top from the footer at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    for (const [name, path] of [['Our story', '/about'], ['Services', '/services'], ['Selected work', '/portfolio'], ['Start a project', '/contact']]) {
      const link = page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name, exact: true })
      await link.scrollIntoViewIfNeeded()
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
      await link.click()
      await expect(page).toHaveURL(path)
      await expectToStayAtTop(page)
    }
  })

  test(`home starts at the top when reached from a scrolled page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/portfolio', { waitUntil: 'domcontentloaded' })
    const home = page.getByRole('contentinfo').getByRole('link', { name: 'AD JEET home' })
    await home.scrollIntoViewIfNeeded()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
    await home.click()
    await expect(page).toHaveURL('/')
    await expectToStayAtTop(page)
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
