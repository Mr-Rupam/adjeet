import { test, expect } from '@playwright/test'
import { COVERAGE_AREAS } from '../../lib/coverage'
import { photos } from '../../content/gallery'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
  })

  // The storefront homepage (2026-10-20) keeps the strong H1 and names the
  // trade and the town straight under it, beside a photographed shopfront.
  test('uses one clear hero proposition beside a real shopfront', async ({ page }) => {
    const hero = page.locator('#hero-section')
    await expect(hero.getByRole('heading', { level: 1, name: /sign boards that get you noticed/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(hero.getByText(/sign board makers in siliguri, since 1990/i)).toBeVisible()
    await expect(hero.getByText(/send a photo of your shop to start/i)).toBeVisible()
    await expect(hero.getByRole('img', { name: /ambuja cement/i })).toBeVisible()
  })

  test('keeps the client history proof section on the landing page', async ({ page }) => {
    const clientHistory = page.locator('#client-history')
    await expect(clientHistory.getByRole('heading', { name: /names you know.*work you can see/i })).toBeVisible()
    await expect(clientHistory.getByText(/selected history includes assignments through regional agencies/i)).toBeVisible()
    await expect(clientHistory.getByText('Airtel', { exact: true })).toBeVisible()
    await expect(clientHistory.locator('li a')).toHaveCount(0)
  })

  // The workshop film left the homepage on 2026-10-20 (the storefront page
  // shows the real workshop photograph instead) and leads the About page.
  test('changes the matched workshop scene with the global theme on one stable media surface', async ({ page }) => {
    await page.goto('/about')
    const scene = page.getByTestId('hero-scene')
    await expect(scene).toHaveAttribute('data-time', 'light')
    await expect(page.getByTestId('hero-day-layer')).toHaveAttribute('data-visible', 'true')
    await expect(page.getByTestId('hero-day-to-night-video')).toHaveAttribute('src', '/hero/workshop/day-to-night.mp4')
    await expect(page.getByTestId('hero-night-to-day-video')).toHaveAttribute('src', '/hero/workshop/night-to-day.mp4')

    await page.getByRole('button', { name: 'Switch to dark mode' }).click()

    await expect(scene).toHaveAttribute('data-time', 'dark')
    await expect(scene).toHaveAttribute('data-transition', 'day-to-night')
    await expect(page.getByTestId('hero-day-layer')).toHaveAttribute('data-visible', 'true')
    await expect(page.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'false')
    await expect(page.getByTestId('hero-day-to-night-video')).toHaveAttribute('data-visible', 'true')
    await expect.poll(() => page.getByTestId('hero-day-to-night-video').evaluate(video => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(0)
    const expectedSurface = await scene.evaluate(element => {
      const rect = element.getBoundingClientRect()
      return { width: Math.round(rect.width), height: Math.round(rect.height) }
    })
    const actualSurface = await page.getByTestId('hero-day-to-night-video').evaluate(video => {
      const film = video.getBoundingClientRect()
      const hero = document.querySelector<HTMLElement>('[data-hero-scene]')!.getBoundingClientRect()
      return {
        filmWidth: Math.round(film.width),
        filmHeight: Math.round(film.height),
        heroWidth: Math.round(hero.width),
        heroHeight: Math.round(hero.height),
        objectFit: getComputedStyle(video).objectFit,
        position: getComputedStyle(video).position,
      }
    })
    expect(actualSurface).toEqual({
      filmWidth: expectedSurface.width,
      filmHeight: expectedSurface.height,
      heroWidth: expectedSurface.width,
      heroHeight: expectedSurface.height,
      objectFit: 'cover',
      position: 'absolute',
    })
    await expect(page.getByRole('slider', { name: /compare day and night/i })).toHaveCount(0)
  })

  test('offers a WhatsApp action before asking for the rest of the page', async ({ page }) => {
    const waLink = page.getByRole('link', { name: /whatsapp your project/i }).first()
    await expect(waLink).toBeVisible()
    expect(await waLink.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//)
    await expect(page.locator('#hero-section').getByRole('link', { name: /see finished shopfronts/i })).toHaveAttribute('href', '#selected-work')
  })

  test('keeps real work separate from generated visual direction', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /finished shopfronts.*real jobs/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /ambuja cement/i })).toBeVisible()
    // The selected work changes with the gallery (068759d), so check that every
    // image in it is a documented project photo rather than naming particular ones.
    const workImages = page.locator('#selected-work').getByRole('img')
    await expect(workImages.first()).toBeVisible()
    const galleryAlts = new Set(photos.map(photo => photo.alt))
    for (const alt of await workImages.evaluateAll(images => images.map(image => image.getAttribute('alt')))) {
      expect(galleryAlts.has(alt ?? ''), `${alt} is a gallery project photo`).toBe(true)
    }
    // The homepage shows the workshop as photographed; no generated image is on it.
    await expect(page.getByText('The AD JEET workshop, Siliguri. Site photograph.')).toBeVisible()
    await expect(page.getByText(/visualisation/i)).toHaveCount(0)
  })

  test('compares the two main sign choices and links the main trades', async ({ page }) => {
    const choices = page.locator('#services')
    await expect(choices.getByRole('heading', { level: 2, name: /glow sign board.*or led letters/i })).toBeVisible()
    await expect(choices.getByRole('heading', { level: 3, name: 'Glow sign board' })).toBeVisible()
    await expect(choices.getByRole('heading', { level: 3, name: 'ACP board with 3D LED letters' })).toBeVisible()
    for (const slug of ['glow-sign-boards', 'acp-led-signage', 'flex-printing', 'vehicle-branding']) {
      await expect(page.locator(`#services a[href="/services/${slug}"]`)).toHaveCount(1)
    }
    await expect(choices.getByRole('link', { name: /every shopfront option/i })).toHaveAttribute('href', '/services#storefront')
    await expect(choices.getByRole('link', { name: /all 10 services/i })).toHaveAttribute('href', '/services')
    await expect(page.locator('#areas').getByRole('link', { name: /every area we serve/i })).toHaveAttribute('href', '/areas')
  })

  test('each finished shopfront asks about a sign like it, by its gallery reference', async ({ page }) => {
    const examples = page.locator('#selected-work li')
    await expect(examples).toHaveCount(3)
    const ids = ['tanyamakeovers-154', 'acc-125', 'anchor-by-panasonic-112']
    for (const [index, id] of ids.entries()) {
      const ask = examples.nth(index).getByRole('link', { name: /ask about a sign like this/i })
      const text = new URL((await ask.getAttribute('href'))!).searchParams.get('text')
      expect(text).toContain(`(${id})`)
      expect(text).toMatch(/^Hi AD JEET, I am interested in a sign like this example: /)
    }
  })

  test('shows the named coverage places without claiming a false administrative grouping', async ({ page }) => {
    const coverage = page.getByRole('list', { name: 'Areas we serve' })
    await expect(coverage.getByRole('listitem')).toHaveCount(COVERAGE_AREAS.length)
    // Each place is now a control that drives the coverage map, and carries its
    // own detail alongside the name ("Workshop", or a distance such as "37 km"), so
    // the item text is no longer the bare place name. The claim under test is
    // unchanged: every area is named in its own right, never rolled up into a
    // district count.
    await expect(coverage.getByRole('button', { name: /^Siliguri/ })).toBeVisible()
    await expect(coverage.getByRole('button', { name: /^The Dooars/ })).toBeVisible()
  })

  test('keeps one direct enquiry close', async ({ page }) => {
    const enquiry = page.getByRole('heading', { name: /what are we putting your name on/i })
    await enquiry.scrollIntoViewIfNeeded()
    const section = page.locator('section').filter({ has: enquiry })
    const link = section.getByRole('link', { name: /whatsapp your project/i })
    await expect(link).toBeVisible()
    expect(await link.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//)
  })

  test('small phones keep the brand, actions and navigation usable without overflow', async ({ page }) => {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await expect(page.getByRole('banner').getByRole('img', { name: /ad jeet, since 1990/i })).toBeVisible()
      const theme = page.getByRole('button', { name: /switch to (dark|light) mode/i })
      const box = await theme.boundingBox()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('mobile navigation reaches the contact form', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
    await expect(drawer).toBeVisible()
    await drawer.getByRole('link', { name: 'Contact', exact: true }).click()
    await expect(page).toHaveURL(/\/contact$/)
    await expect(page.locator('#lead-name')).toBeVisible()
  })
})
