import { test, expect } from '@playwright/test'
import { COVERAGE_AREAS } from '../../lib/coverage'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
  })

  test('uses one clear hero proposition over the workshop scene', async ({ page }) => {
    const hero = page.locator('#hero-section')
    await expect(hero.getByRole('heading', { level: 1, name: /signage, print & outdoor branding/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(hero.getByText(/designed, fabricated and installed from our siliguri workshop/i)).toBeVisible()
    await expect(hero.getByText(/ad jeet workshop, siliguri/i)).toBeVisible()
  })

  test('keeps the client history proof section on the landing page', async ({ page }) => {
    const clientHistory = page.getByRole('heading', { name: /brands we’ve worked with/i })
    await expect(clientHistory).toBeVisible()
    await expect(page.getByText(/partial list: national brands via their regional agencies/i)).toBeVisible()
    await expect(page.getByText('Airtel', { exact: true }).first()).toBeVisible()
  })

  test('changes the matched hero scene with the global theme on one stable media surface', async ({ page }) => {
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
    await expect(page.getByRole('link', { name: /see what.*out there/i })).toHaveAttribute('href', '#selected-work')
  })

  test('keeps real work separate from generated visual direction', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /you've probably seen our work/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /ambuja cement/i })).toBeVisible()
    await expect(page.getByRole('img', { name: /srmb vehicle branding/i })).toBeVisible()
    await expect(page.getByText('Workshop illustration')).toBeVisible()
  })

  test('organises services into three paths and preserves the all-services route', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /choose your canvas/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /your storefront/i })).toHaveAttribute('href', '/services#storefront')
    await expect(page.getByRole('link', { name: /your next campaign/i })).toHaveAttribute('href', '/services#campaign')
    await expect(page.getByRole('link', { name: /your space or event/i })).toHaveAttribute('href', '/services#space-event')
    await expect(page.getByRole('link', { name: /all 10 services/i })).toHaveAttribute('href', '/services')
  })

  test('shows the named coverage places without claiming a false administrative grouping', async ({ page }) => {
    const coverage = page.getByRole('list', { name: 'Areas we serve' })
    await expect(coverage.getByRole('listitem')).toHaveCount(COVERAGE_AREAS.length)
    await expect(coverage.getByRole('listitem').filter({ hasText: /^Siliguri/ })).toBeVisible()
    await expect(coverage.getByRole('listitem').filter({ hasText: /^The Dooars$/ })).toBeVisible()
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
