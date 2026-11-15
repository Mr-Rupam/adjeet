import { expect, test, type Page } from '@playwright/test'
import sharp from 'sharp'

// The home hero since 15 November 2026: a visualisation, "The one lit
// sign" (DESIGN.md, "Homepage"), by day in the light theme and at night in the
// dark theme. These replace the photo slideshow's checks; the rotation, its
// pause button and its caption left the hero.

async function seenIntro(page: Page, { consent = 'declined' }: { consent?: string | null } = {}) {
  await page.addInitScript(consent => {
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
    if (consent) localStorage.setItem('adjeet-consent', consent)
  }, consent)
}

const box = async (page: Page, selector: string) => {
  const found = await page.locator(selector).first().boundingBox()
  expect(found, selector).not.toBeNull()
  return found!
}

/** The image for each scene; the light theme (the test default) shows the day scene. */
const DAY = '#hero-section [data-hero-image="day"]'
const NIGHT = '#hero-section [data-hero-image="night"]'

const COLOURS = {
  light: { ground: 'rgb(246, 240, 227)', ink: 'rgb(23, 34, 41)', accent: 'rgb(0, 106, 147)' },
  dark: { ground: 'rgb(5, 21, 35)', ink: 'rgb(242, 235, 221)', accent: 'rgb(233, 207, 63)' },
}

/** The two figures stand in the lower part of the tall cut: their feet are at about 73% of its height. */
const FIGURES_FOOT = 0.73

test.describe('home hero', () => {
  test('the header sits on the hero, then becomes the cream bar once the hero has scrolled past', async ({ page }) => {
    await seenIntro(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const header = page.getByRole('banner')
    await expect(header).toHaveAttribute('data-over-hero', 'true')
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    // The original logo, unaltered, straight on the artwork.
    await expect(header.getByRole('img', { name: 'AD JEET, since 1990' })).toBeVisible()
    await expect(header.getByRole('button', { name: /switch to (dark|light) mode/i })).toHaveCSS('color', 'rgb(23, 34, 41)')

    await page.mouse.wheel(0, 900)
    await expect(header).toHaveAttribute('data-over-hero', 'false')
    await expect(header).toHaveCSS('background-color', 'rgb(246, 240, 227)')
    await expect(header.getByRole('button', { name: /switch to (dark|light) mode/i })).toHaveCSS('color', 'rgb(23, 34, 41)')

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(header).toHaveAttribute('data-over-hero', 'true')

    // The mobile drawer still opens from the header over the hero.
    await header.getByRole('button', { name: 'Open navigation menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible()
  })

  test('every other route keeps the usual header', async ({ page }) => {
    await seenIntro(page)
    for (const path of ['/about', '/services', '/contact']) {
      await page.goto(path)
      const header = page.getByRole('banner')
      await expect(header, path).not.toHaveAttribute('data-over-hero')
      await expect(header, path).toHaveCSS('background-color', 'rgb(246, 240, 227)')
    }
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`the ${theme} theme shows the ${theme === 'light' ? 'day' : 'night'} scene in its colours, header included`, async ({ page }) => {
      await seenIntro(page)
      await page.addInitScript(theme => localStorage.setItem('adjeet-theme', theme), theme)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto('/')
      const [shown, hidden] = theme === 'light' ? [DAY, NIGHT] : [NIGHT, DAY]
      await expect(page.locator('html')).toHaveAttribute('data-hero-light', theme === 'light' ? 'day' : 'night')
      await expect(page.locator(shown)).toBeVisible()
      // The other scene is either not laid out yet or, once the page is idle, laid out invisibly behind.
      const layerOpacity = (selector: string) => page.locator(selector).evaluate(image => {
        const layer = image.closest('picture')!
        return getComputedStyle(layer).display === 'none' ? '0' : getComputedStyle(layer).opacity
      })
      await expect.poll(() => layerOpacity(shown)).toBe('1')
      await expect.poll(() => layerOpacity(hidden)).toBe('0')
      const hero = page.locator('#hero-section')
      await expect(hero).toHaveCSS('background-color', COLOURS[theme].ground)
      await expect(hero.locator('h1')).toHaveCSS('color', COLOURS[theme].ink)
      await expect(hero.locator('h1 em')).toHaveCSS('color', COLOURS[theme].accent)
      // The gold action is the site's own in each theme (--signal-hot, a shade brighter in the dark theme).
      await expect(hero.getByRole('link', { name: 'WhatsApp your project' })).toHaveCSS('background-color', theme === 'light' ? 'rgb(233, 207, 63)' : 'rgb(232, 213, 72)')
      const header = page.getByRole('banner')
      await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(header.getByRole('button', { name: /switch to (dark|light) mode/i })).toHaveCSS('color', COLOURS[theme].ink)
      if (theme === 'dark') {
        // The wide night cut has its own, slightly darker sky.
        await page.setViewportSize({ width: 1440, height: 900 })
        await expect(hero).toHaveCSS('background-color', 'rgb(2, 18, 27)')
      }
    })

    test(`initial load in the ${theme} theme fetches only that scene, then the other once the page is idle`, async ({ page }) => {
      await seenIntro(page)
      // A visitor on the system theme, as every first visit is.
      await page.emulateMedia({ colorScheme: theme })
      await page.addInitScript(theme => localStorage.setItem('adjeet-theme', theme), theme)
      for (const [width, height, cut] of [[390, 844, 'tall'], [1440, 900, 'wide']] as const) {
        // Leave the last page first, so its resize cannot fetch anything into this count.
        await page.goto('about:blank')
        await page.setViewportSize({ width, height })
        const requested: string[] = []
        const listener = (request: { url: () => string }) => {
          const url = decodeURIComponent(request.url())
          if (url.includes('/hero/')) requested.push(url)
        }
        page.on('request', listener)
        await page.goto('/', { waitUntil: 'load' })
        const [want, other] = theme === 'light' ? ['day', 'night'] : ['night', 'day']
        const atLoad = [...requested]
        expect(atLoad.length, `${width}px: hero images during the load`).toBeGreaterThan(0)
        expect(atLoad.every(url => url.includes(`/hero/${want}-street-${cut}.webp`)), `${width}px: ${atLoad.join(', ')}`).toBe(true)
        // Exactly one hero preload applies, from <head> (each carries a media
        // query), and it names the same one image. The inline script adds none.
        const applied = await page.locator('link[rel="preload"][as="image"][imagesrcset*="hero"]').evaluateAll(links => links
          .filter(link => !link.getAttribute('media') || window.matchMedia(link.getAttribute('media')!).matches)
          .map(link => decodeURIComponent(link.getAttribute('imagesrcset') ?? '')))
        expect(applied, `${width}px`).toHaveLength(1)
        expect(applied[0]).toContain(`/hero/${want}-street-${cut}.webp`)
        await expect(page.locator('link[data-hero-preload]')).toHaveCount(0)
        // Idle: the other scene is laid out, invisible, and loads, ready for the first switch.
        await expect(page.locator('#hero-section [data-both-scenes]')).toHaveCount(1, { timeout: 10000 })
        await expect.poll(() => requested.some(url => url.includes(`/hero/${other}-street-${cut}.webp`)), { timeout: 10000 }).toBe(true)
        page.off('request', listener)
      }
    })
  }

  test('a visitor who chose the theme opposite to the system gets that scene preloaded by the inline script', async ({ page }) => {
    await seenIntro(page)
    await page.emulateMedia({ colorScheme: 'light' })
    await page.addInitScript(() => localStorage.setItem('adjeet-theme', 'dark'))
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'load' })
    const preload = page.locator('link[data-hero-preload]')
    await expect(preload).toHaveCount(1)
    await expect(preload).toHaveAttribute('data-hero-preload', 'night')
    await expect(preload).toHaveAttribute('fetchpriority', 'high')
    expect(decodeURIComponent((await preload.getAttribute('imagesrcset')) ?? '')).toContain('/hero/night-street-tall.webp')
  })

  test('reaching for the theme toggle loads the other scene even before the page is idle', async ({ page }) => {
    await seenIntro(page)
    await page.addInitScript(() => { window.requestIdleCallback = (() => 0) as typeof window.requestIdleCallback })
    await page.setViewportSize({ width: 390, height: 844 })
    const requested: string[] = []
    page.on('request', request => { requested.push(decodeURIComponent(request.url())) })
    await page.goto('/', { waitUntil: 'load' })
    await page.waitForTimeout(500)
    expect(requested.some(url => url.includes('/hero/night-street'))).toBe(false)
    await page.getByRole('button', { name: 'Switch to dark mode' }).focus()
    await expect.poll(() => requested.some(url => url.includes('/hero/night-street-tall.webp'))).toBe(true)
  })

  test('switching the theme changes the whole page in one cross-fade, in place', async ({ page }) => {
    await seenIntro(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator('#hero-section [data-both-scenes]')).toHaveCount(1, { timeout: 10000 })
    await expect(page.locator(NIGHT)).toHaveAttribute('data-image-status', 'loaded', { timeout: 10000 })
    const board = await box(page, '[data-hero-board]')
    const art = await box(page, DAY)

    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    // One view transition: the page's theme and the hero's scene change in the
    // same frame, and the new look fades in over the old one, which stays
    // fully drawn underneath, over 700ms. The page's own transitions are off.
    await expect(page.locator('html')).toHaveAttribute('data-theme-switching', '')
    const during = await page.evaluate(() => ({
      theme: document.documentElement.getAttribute('data-theme'),
      light: document.documentElement.getAttribute('data-hero-light'),
      fades: document.getAnimations().map(animation => {
        const effect = animation.effect as KeyframeEffect | null
        const timing = effect?.getTiming()
        return { pseudo: effect?.pseudoElement ?? null, duration: Number(timing?.duration) }
      }).filter(fade => fade.pseudo?.startsWith('::view-transition')),
      // A CSS animation's easing lives on its keyframes, so read it from the style.
      easing: getComputedStyle(document.documentElement, '::view-transition-new(root)').animationTimingFunction,
    }))
    expect(during.theme).toBe('dark')
    expect(during.light).toBe('night')
    expect(during.fades).toContainEqual({ pseudo: '::view-transition-new(root)', duration: 700 })
    expect(during.easing).toBe('ease')
    expect(during.fades.filter(fade => fade.pseudo === '::view-transition-old(root)')).toEqual([])
    await expect(page.locator('html')).not.toHaveAttribute('data-theme-switching', '')

    await expect(page.locator('#hero-section')).toHaveCSS('background-color', COLOURS.dark.ground)
    await expect(page.locator('#hero-section h1 em')).toHaveCSS('color', COLOURS.dark.accent)
    await expect(page.locator(NIGHT)).not.toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator(DAY)).toHaveAttribute('aria-hidden', 'true')
    // Nothing moved: the board lettering and the artwork are where they were.
    expect(await box(page, '[data-hero-board]')).toEqual(board)
    expect(await box(page, NIGHT)).toEqual(art)

    await page.getByRole('button', { name: 'Switch to light mode' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-hero-light', 'day')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.locator('#hero-section')).toHaveCSS('background-color', COLOURS.light.ground)
  })

  // The owner saw dark to light "phase in two halves": the colours changed,
  // then the picture. Screenshots taken through the switch, slowed down, must
  // show the hero's ground and its artwork moving together, with no dip.
  for (const [width, height] of [[390, 844], [1440, 900]] as const) {
    test(`dark to light changes the ground and the artwork together at ${width}px`, async ({ page }) => {
      test.slow()
      await seenIntro(page)
      await page.addInitScript(() => localStorage.setItem('adjeet-theme', 'dark'))
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await expect(page.locator('#hero-section [data-both-scenes]')).toHaveCount(1, { timeout: 10000 })
      await expect(page.locator(DAY)).toHaveAttribute('data-image-status', 'loaded', { timeout: 10000 })
      await page.waitForTimeout(300)
      const shot = async () => {
        const { data, info } = await sharp(await page.screenshot({ scale: 'css' })).raw().toBuffer({ resolveWithObject: true })
        return { data, info }
      }
      const before = await shot()
      const cdp = await page.context().newCDPSession(page)
      await cdp.send('Animation.enable')
      await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.1 })
      const frames: Array<Awaited<ReturnType<typeof shot>>> = []
      await page.getByRole('button', { name: 'Switch to light mode' }).click()
      const started = Date.now()
      while (Date.now() - started < 9000) frames.push(await shot())
      await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 })
      await expect(page.locator('html')).toHaveAttribute('data-hero-light', 'day')
      await expect(page.locator('html')).not.toHaveAttribute('data-theme-switching', '')
      await page.waitForTimeout(900)
      const after = await shot()

      // The pixel that changes most in the hero's ground (the band above the
      // artwork) and in the artwork itself (the lower half).
      const luma = (image: typeof before, x: number, y: number) => {
        const index = (y * image.info.width + x) * image.info.channels
        return (image.data[index] + image.data[index + 1] + image.data[index + 2]) / 3
      }
      const strongest = (top: number, bottom: number, right: number) => {
        let best = { x: 0, y: 0, delta: 0 }
        for (let y = Math.floor(top * height); y < bottom * height; y += 6) {
          for (let x = 8; x < right * width; x += 6) {
            const delta = Math.abs(luma(after, x, y) - luma(before, x, y))
            if (delta > best.delta) best = { x, y, delta }
          }
        }
        return best
      }
      const ground = width > 1000 ? strongest(0.02, 0.1, 0.3) : strongest(0.02, 0.08, 1)
      const artwork = width > 1000 ? strongest(0.5, 0.95, 1) : strongest(0.55, 0.85, 1)
      expect(ground.delta, 'the ground changes').toBeGreaterThan(60)
      expect(artwork.delta, 'the artwork changes').toBeGreaterThan(40)
      const progress = (image: typeof before, point: typeof ground) =>
        (luma(image, point.x, point.y) - luma(before, point.x, point.y)) / (luma(after, point.x, point.y) - luma(before, point.x, point.y))
      const samples = frames.map(frame => ({ ground: progress(frame, ground), artwork: progress(frame, artwork) }))
      const moving = samples.filter(sample => sample.ground > 0.05 && sample.ground < 0.95)
      expect(moving.length, 'frames caught mid-switch').toBeGreaterThan(2)
      for (const sample of samples) {
        expect(Math.abs(sample.ground - sample.artwork), JSON.stringify(samples)).toBeLessThan(0.25)
        // No dip: nothing goes darker or lighter than both ends.
        expect(sample.artwork, JSON.stringify(samples)).toBeGreaterThan(-0.1)
        expect(sample.artwork, JSON.stringify(samples)).toBeLessThan(1.1)
      }
    })
  }

  test('if the other scene has not loaded, the whole page waits for it, then changes at once', async ({ page }) => {
    await seenIntro(page)
    await page.addInitScript(() => { window.requestIdleCallback = (() => 0) as typeof window.requestIdleCallback })
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    await page.route('**/_next/image?**', async route => {
      if ((new URL(route.request().url()).searchParams.get('url') ?? '').startsWith('/hero/night-street')) await gate
      await route.continue()
    })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    try {
      await page.getByRole('button', { name: 'Switch to dark mode' }).click()
      await page.waitForTimeout(800)
      // Nothing has changed yet: not the page's theme, not the hero.
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
      await expect(page.locator('html')).toHaveAttribute('data-hero-light', 'day')
      await expect(page.locator('#hero-section')).toHaveCSS('background-color', COLOURS.light.ground)
      await expect(page.locator(DAY)).toBeVisible()
      release()
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
      await expect(page.locator('html')).toHaveAttribute('data-hero-light', 'night')
      await expect(page.locator('#hero-section')).toHaveCSS('background-color', COLOURS.dark.ground)
    } finally {
      release()
    }
  })

  test('with reduced motion the switch is immediate', async ({ page }) => {
    await seenIntro(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-hero-light', 'night')
    const state = await page.evaluate(() => {
      const hero = document.getElementById('hero-section')!
      const layer = document.querySelector('[data-hero-image="night"]')!.closest('picture')!
      return {
        ground: getComputedStyle(hero).backgroundColor,
        opacity: getComputedStyle(layer).opacity,
        running: [hero, layer].flatMap(element => element.getAnimations()).length,
      }
    })
    expect(state).toEqual({ ground: 'rgb(5, 21, 35)', opacity: '1', running: 0 })
  })

  test('"Your shop name" is decorative lettering that stays on the board', async ({ page }) => {
    await seenIntro(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const [width, height] of [[390, 844], [320, 640], [768, 1024], [1440, 900], [1280, 720], [1920, 1080]]) {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      const board = page.locator('[data-hero-board]')
      await expect(board).toHaveAttribute('aria-hidden', 'true')
      await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Advertising that gets you noticed.')
      // The words fit inside the board's rectangle, which sits on the artwork.
      const fit = await board.evaluate(element => {
        const range = document.createRange()
        range.selectNodeContents(element)
        const text = range.getBoundingClientRect()
        const rect = element.getBoundingClientRect()
        return { left: text.left - rect.left, right: rect.right - text.right, top: text.top - rect.top, bottom: rect.bottom - text.bottom }
      })
      for (const [side, room] of Object.entries(fit)) expect(room, `${width}x${height}: room on the ${side}`).toBeGreaterThan(0)
      const art = await box(page, DAY)
      const lettering = await board.boundingBox()
      expect(lettering!.x).toBeGreaterThan(art.x)
      expect(lettering!.x + lettering!.width).toBeLessThan(art.x + art.width)
    }
  })

  test('the gold WhatsApp action is in the first phone screen, below the two figures', async ({ page }) => {
    await seenIntro(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const [width, height] of [[390, 844], [390, 664], [360, 700], [320, 640]]) {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      const action = page.locator('#hero-section').getByRole('link', { name: 'WhatsApp your project' })
      await expect(action).toBeVisible()
      const cta = (await action.boundingBox())!
      const art = await box(page, DAY)
      const lead = await box(page, '#hero-section [data-hero-lead]')
      expect(cta.y + cta.height, `${width}x${height}: on screen`).toBeLessThanOrEqual(height)
      expect(cta.y, `${width}x${height}: below the figures`).toBeGreaterThan(art.y + art.height * FIGURES_FOOT)
      const board = await box(page, '[data-hero-board]')
      expect(board.y, `${width}x${height}: the board is clear of the copy`).toBeGreaterThan(lead.y + lead.height)
      await expect(page.locator('#hero-section').getByRole('link', { name: 'See finished shopfronts' })).toBeInViewport()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    }
  })

  test('with the consent banner showing, the action stays above it and below the figures', async ({ page }) => {
    await seenIntro(page, { consent: null })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const [width, height] of [[390, 664], [390, 844], [360, 640]]) {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      const banner = page.getByRole('dialog', { name: /consent/i })
      await expect(banner).toBeVisible()
      const action = page.locator('#hero-section').getByRole('link', { name: 'WhatsApp your project' })
      await expect(action).toBeVisible()
      // The lift is a transform, so wait for the banner's height to be published.
      await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--consent-h'))).not.toBe('')
      const cta = (await action.boundingBox())!
      const bannerBox = (await banner.boundingBox())!
      const art = await box(page, DAY)
      expect(cta.y + cta.height, `${width}x${height}: above the banner`).toBeLessThanOrEqual(bannerBox.y)
      expect(cta.y, `${width}x${height}: still below the figures`).toBeGreaterThan(art.y + art.height * FIGURES_FOOT)
    }
  })

  test('desktop keeps the action, the jump to real work and the four trades on the hero, clear of the chat button', async ({ page }) => {
    await seenIntro(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const [width, height] of [[1440, 900], [1280, 720], [1920, 1080]]) {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      const hero = page.locator('#hero-section')
      await expect(hero.getByRole('link', { name: 'WhatsApp your project' })).toBeInViewport()
      await expect(hero.getByRole('link', { name: 'See finished shopfronts' })).toHaveText('See finished shopfronts')
      const trades = hero.getByRole('navigation', { name: 'Main trades' }).getByRole('link')
      await expect(trades).toHaveText(['Glow Sign Boards', 'ACP & LED Signage', 'Flex Printing', 'Vehicle Branding'])
      const bubble = page.locator('.chatbot-bubble')
      await expect(bubble).toBeVisible()
      const chat = (await bubble.boundingBox())!
      for (const link of await trades.all()) {
        const area = (await link.boundingBox())!
        const overlaps = area.x < chat.x + chat.width && chat.x < area.x + area.width && area.y < chat.y + chat.height && chat.y < area.y + area.height
        expect(overlaps, `${width}x${height}: ${await link.textContent()} is clear of the chat button`).toBe(false)
      }
    }
  })

  test('on a phone the tall artwork is the largest paint', async ({ page }) => {
    await seenIntro(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator(DAY)).toHaveAttribute('data-image-status', 'loaded')
    const lcp = await page.evaluate(() => new Promise<{ url: string; time: number }>(resolve => {
      new PerformanceObserver(list => {
        const entries = list.getEntries() as Array<PerformanceEntry & { url?: string }>
        const last = entries[entries.length - 1]
        resolve({ url: last.url ?? '', time: last.startTime })
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    }))
    expect(decodeURIComponent(lcp.url)).toContain('/hero/day-street-tall.webp')
    expect(lcp.time).toBeLessThan(3300)
  })

  test('reduced motion paints the artwork at once and plays nothing', async ({ page }) => {
    await seenIntro(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator(DAY)).toHaveAttribute('data-image-status', 'loaded')
    await expect(page.locator('#hero-section button')).toHaveCount(0)
    await expect(page.locator('#hero-section video')).toHaveCount(0)
    const transform = await page.locator('[data-hero-actions]').evaluate(element => getComputedStyle(element).transform)
    expect(transform).toBe('none')
  })

  test('without JavaScript the hero is complete and the header readable', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
    const page = await context.newPage()
    await page.goto('/')
    const hero = page.locator('#hero-section')
    await expect(hero.getByRole('heading', { level: 1 })).toBeVisible()
    // No theme script runs, so it is the light theme's day scene.
    await expect(hero.getByRole('img', { name: /^Visualisation: a small market street on a misty morning/ })).toBeVisible()
    await expect(page.locator(NIGHT)).toBeHidden()
    await expect(hero.getByRole('link', { name: 'WhatsApp your project' })).toBeInViewport()
    // A concept scene carries no visible label (16 November 2026); its alt text names it.
    await expect(hero.getByText(/visualisation/i)).toHaveCount(0)
    const header = page.getByRole('banner')
    await expect(header).toHaveAttribute('data-over-hero', 'true')
    await expect(header.getByRole('img', { name: 'AD JEET, since 1990' })).toBeVisible()
    // Nothing switches it back to the cream bar, so it scrolls away with the hero.
    await expect(header).toHaveCSS('position', 'absolute')
    await context.close()
  })
})
