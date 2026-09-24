import { test, expect, type Page } from '@playwright/test'
import { programmaticPages } from '../../content/programmatic'
import { SERVICE_SLUGS } from '../../content/services'
import { COVERAGE_AREAS } from '../../lib/coverage'
import { photos } from '../../content/gallery'
import { CLIENT_NAMES } from './support/clients'

const acpCount = photos.filter(p => p.service === 'acp-led-signage').length

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('adjeet-consent', 'declined')
    localStorage.setItem('adjeet-theme', 'light')
  })
})

test('new homepage keeps real project discovery and every coverage area accessible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Signage & outdoor advertising in Siliguri.')
  await expect(page.locator('#hero-section').getByRole('link', { name: 'WhatsApp your project' })).toBeVisible()
  await expect(page.getByRole('list', { name: 'Areas we serve' }).getByRole('listitem')).toHaveCount(COVERAGE_AREAS.length)
  await page.getByRole('link', { name: 'Explore Ambuja Cement ACP and LED signage' }).click()
  await expect(page).toHaveURL(/service=acp-led-signage/)
  await expect(page.getByRole('button', { name: /^View:/ })).toHaveCount(acpCount)
})

test('all service and regional routes resolve, with regional links matching the content records', async ({ page, request }) => {
  test.setTimeout(180000)
  for (const slug of [...SERVICE_SLUGS.map(s => 'services/' + s), ...programmaticPages.map(p => p.slug)]) {
    expect((await request.get('/' + slug)).status(), slug).toBe(200)
  }
  await page.goto('/glow-sign-board-in-siliguri')
  const cityLinks = page.locator('a').filter({ hasText: /^Glow Sign Boards in / })
  for (const link of await cityLinks.all()) {
    const href = await link.getAttribute('href')
    expect(programmaticPages.some(p => '/' + p.slug === href)).toBe(true)
  }
})

test('filter combinations announce counts, recover from empty results and support Back', async ({ page }) => {
  await page.goto('/portfolio')
  const trade = page.getByRole('group', { name: 'Filter work by trade' })
  await trade.getByRole('button', { name: 'ACP & LED Signage', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText(acpCount + ' projects')
  await page.getByRole('group', { name: 'Filter work by brand' }).getByRole('button', { name: 'Airtel', exact: true }).click()
  await expect(page.getByRole('heading', { name: /No projects match/ })).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('status')).toHaveText(acpCount + ' projects')
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page.getByRole('button', { name: /^View:/ })).toHaveCount(photos.length)
  await page.getByRole('button', { name: 'Featured', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Featured', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('photo viewer supports keyboard navigation and returns focus to its project', async ({ page }) => {
  await page.goto('/portfolio')
  const project = page.getByRole('button', { name: /^View:/ }).first()
  await project.click()
  const dialog = page.getByRole('dialog', { name: 'Photo viewer' })
  await expect(dialog.getByRole('button', { name: 'Close photo viewer' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', photos[1].alt)
  await page.keyboard.press('ArrowLeft')
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', photos[0].alt)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(project).toBeFocused()
})

test('Back closes the photo viewer safely when the previous filter has no projects', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/portfolio')
  await page.getByRole('group', { name: 'Filter work by trade' }).getByRole('button', { name: 'ACP & LED Signage', exact: true }).click()
  await expect(page).toHaveURL(/service=acp-led-signage/)
  await page.getByRole('group', { name: 'Filter work by brand' }).getByRole('button', { name: 'Airtel', exact: true }).click()
  await expect(page).toHaveURL(/client=airtel/)
  await expect(page.getByRole('heading', { name: /No projects match/ })).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page).toHaveURL('/portfolio')
  await page.getByRole('button', { name: /^View:/ }).last().click()
  await expect(page.getByRole('dialog', { name: 'Photo viewer' })).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('heading', { name: /No projects match/ })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Photo viewer' })).toHaveCount(0)
  await page.goForward()
  await expect(page.getByRole('button', { name: /^View:/ })).toHaveCount(photos.length)
  await expect(page.getByRole('dialog', { name: 'Photo viewer' })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('small screens keep controls reachable and drawer focus contained', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    const theme = page.getByRole('button', { name: /Switch to dark mode/ })
    const bounds = await theme.boundingBox()
    expect(bounds!.width).toBeGreaterThanOrEqual(43.999)
    expect(bounds!.height).toBeGreaterThanOrEqual(43.999)
    if (width < 1024) {
      const trigger = page.getByRole('button', { name: 'Open navigation menu' })
      await trigger.click()
      const dialog = page.getByRole('dialog', { name: 'Navigation menu' })
      await expect(dialog.getByRole('button', { name: 'Close navigation menu' })).toBeFocused()
      await page.keyboard.press('Shift+Tab')
      await expect(dialog.getByRole('link', { name: 'AD JEET home' })).toBeFocused()
      await page.keyboard.press('Shift+Tab')
      await expect(dialog.getByRole('link', { name: 'Talk on WhatsApp' })).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(trigger).toBeFocused()
    }
  }
})

// Only the third-party widget and delivery endpoints are mocked. No live lead
// or chat request is sent; production CAPTCHA verification is not changed.
async function mockCaptcha(page: Page) {
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*', route => route.fulfill({
    contentType: 'application/javascript',
    body: `window.turnstile={render(el,opts){setTimeout(()=>opts.callback('test-widget-token'),0);return 'test-widget';},remove(){},reset(){},getResponse(){return 'test-widget-token';},isExpired(){return false;}};window.onloadTurnstileCallback?.();`,
  }))
}
async function fillBrief(page: Page) {
  await page.locator('#lead-name').fill('Local UI test')
  await page.locator('#lead-phone').fill('9876543210')
  await page.locator('#lead-city').selectOption('Siliguri')
  await page.getByRole('checkbox', { name: 'ACP & LED Signage' }).check()
}

test('brief exposes invalid fields, pending delivery and successful completion', async ({ page }) => {
  await mockCaptcha(page)
  let release: () => void = () => {}
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/lead', async route => { await gate; await route.fulfill({ json: { ok: true } }) })
  await page.goto('/contact')
  const submit = page.getByRole('button', { name: 'Send the brief →' })
  await submit.click()
  await expect(page.locator('#lead-name')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#lead-name-err')).toBeVisible()
  await fillBrief(page)
  await submit.click()
  await expect(page.getByRole('button', { name: /Sending/ })).toBeDisabled()
  release()
  await expect(page.getByRole('status')).toContainText('Message received.')
  await expect(page.getByRole('status')).toBeFocused()
})

test('server failure is announced and form details remain available for recovery', async ({ page }) => {
  await mockCaptcha(page)
  await page.route('**/api/lead', route => route.fulfill({ status: 500, json: { error: 'Please try WhatsApp instead.' } }))
  await page.goto('/contact')
  await fillBrief(page)
  await page.getByRole('button', { name: 'Send the brief →' }).click()
  await expect(page.locator('.contact-form').getByRole('alert')).toContainText('Please try WhatsApp instead.')
  await expect(page.locator('#lead-name')).toHaveValue('Local UI test')
  await expect(page.getByRole('link', { name: 'WhatsApp your project' }).first()).toHaveAttribute('href', /^https:\/\/wa\.me\//)
})

test('assistant accepts a suggestion, handles failure and returns focus after Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.route('**/api/chatbot', route => route.fulfill({ status: 503, json: { error: 'Chat is unavailable. Please call the workshop.' } }))
  await page.goto('/')
  // `next dev` draws its "Open Next.js Dev Tools" button at the bottom left, over
  // the centre of the chat bubble, so the click lands on it. It is not part of the
  // site and production has no such button, so hide it for this test.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
  await page.getByRole('button', { name: 'Open AD JEET chat assistant' }).click()
  const chat = page.getByRole('dialog', { name: 'AD JEET Chat Assistant' })
  await expect(chat.getByRole('textbox')).toBeFocused()
  await chat.getByRole('button', { name: 'Coverage areas?' }).click()
  await expect(chat.getByText('Chat is unavailable. Please call the workshop.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open AD JEET chat assistant' })).toBeFocused()
  await expect(page.locator('.chatbot-window')).toHaveAttribute('inert', '')
})

test('unknown pages offer a useful route back to the work', async ({ page }) => {
  const response = await page.goto('/a-missing-page')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Page not found.' })).toBeVisible()
  await page.getByRole('link', { name: 'See our work ↗' }).click()
  await expect(page).toHaveURL('/portfolio')
})

test('both themes keep all client names and heading text inside small viewports', async ({ page }) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    expect(CLIENT_NAMES.length).toBeGreaterThan(0)
    await expect(page.locator('#client-history li')).toHaveText(CLIENT_NAMES)
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme)
      const overflow = await page.locator('#hero-section h1, #client-history h2, #client-history li, #client-history p').evaluateAll(elements => elements.flatMap(element => {
        const range = document.createRange()
        range.selectNodeContents(element)
        return [...range.getClientRects()].filter(r => r.left < -1 || r.right > innerWidth + 1).map(() => element.textContent)
      }))
      expect(overflow).toEqual([])
    }
  }
})

test('the enquiry button stays a readable light pill on the cerulean band in both themes', async ({ page }) => {
  // `.cta` fades its background, so without reduced motion the colours read
  // straight after a theme switch are still the previous theme's.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // Home renders CommissionCTA; the regional pages write their own band.
  for (const route of ['/', '/glow-sign-board-in-siliguri']) {
    await page.goto(route)
    const button = page.locator('.commission-actions > .cta')
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme)
      const contrast = await button.evaluate(element => {
        const luminance = (color: string) => {
          const match = color.match(/^rgba?\(([^)]+)\)$/)
          const [r, g, b, alpha = 1] = match ? match[1].split(/[\s,/]+/).map(Number) : []
          if (!match || alpha < 1) throw new Error('Expected an opaque rgb() colour, got ' + color)
          const [lr, lg, lb] = [r, g, b].map(value => {
            const channel = value / 255
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
          })
          return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
        }
        const ratio = (a: string, b: string) => {
          const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
          return (lighter + 0.05) / (darker + 0.05)
        }
        const style = getComputedStyle(element)
        const band = getComputedStyle(element.closest('.commission')!)
        return { text: ratio(style.color, style.backgroundColor), pill: ratio(style.backgroundColor, band.backgroundColor) }
      })
      expect(contrast.text, `${route} ${theme}: button text on the pill`).toBeGreaterThanOrEqual(4.5)
      expect(contrast.pill, `${route} ${theme}: pill against the band`).toBeGreaterThanOrEqual(3)
    }
  }
})

test('reduced motion switches workshop stills without playing the films', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.getByTestId('hero-scene')).toHaveAttribute('data-time', 'dark')
  await expect(page.getByTestId('hero-scene')).toHaveAttribute('data-transition', 'idle')
  await expect(page.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'true')
  expect(await page.getByTestId('hero-day-to-night-video').evaluate(v => (v as HTMLVideoElement).paused)).toBe(true)
})
