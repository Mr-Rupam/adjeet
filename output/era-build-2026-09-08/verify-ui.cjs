const { createRequire } = require('node:module')
const fs = require('node:fs/promises')
const path = require('node:path')
const projectRequire = createRequire('C:/Users/KIIT0001/Downloads/AD_JEET/.superpowers/worktrees/era-build/adjeet-site/package.json')
const { chromium } = projectRequire('playwright')
const base = process.env.ADJEET_QA_URL || 'http://127.0.0.1:4180'
const output = __dirname
const results = []

async function check(name, run) {
  try { const evidence = await run(); results.push({ name, status: 'pass', evidence }); console.log('PASS', name) }
  catch (error) { results.push({ name, status: 'fail', error: error.message }); console.log('FAIL', name, error.message) }
}
function assert(value, message) { if (!value) throw new Error(message) }
async function visit(page, route = '') {
  return page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 60000 })
}
async function settleHero(page) {
  await page.waitForFunction(() => document.querySelector('[data-hero-title] > span[style]') && document.querySelector('[data-hero-scene]').dataset.time === document.documentElement.dataset.theme && [...document.querySelectorAll('[data-hero-title] *')].every(el => Number(getComputedStyle(el).opacity) > 0.99))
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 390, height: 845 }, reducedMotion: 'reduce' })
  await context.addInitScript(() => localStorage.setItem('adjeet-consent', 'declined'))
  await context.addInitScript(() => {
    window.__adjeetMetrics = { lcp: null, cls: 0 }
    new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__adjeetMetrics.lcp = entry.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__adjeetMetrics.cls += entry.value }).observe({ type: 'layout-shift', buffered: true })
  })
  await context.route('**/api/lead', route => route.abort())
  const page = await context.newPage()
  const runtimeErrors = []
  page.on('pageerror', error => runtimeErrors.push(error.message))

  await check('Initial homepage does not fetch optional theme films', async () => {
    const mediaRequests = []
    const recordMedia = request => { if (/\/hero\/workshop\/.*\.mp4/.test(request.url())) mediaRequests.push(request.url()) }
    page.on('request', recordMedia)
    await visit(page)
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
    await page.evaluate(() => document.fonts.ready)
    // Observe the initial viewport's network window before any scroll or theme action.
    await page.waitForTimeout(2000)
    const policy = await page.locator('video').evaluateAll(videos => videos.map(video => video.getAttribute('preload')))
    page.off('request', recordMedia)
    assert(mediaRequests.length === 0, 'Optional films downloaded before a theme action')
    assert(policy.every(preload => preload === 'none'), 'Film preload is not deferred')
    const metrics = await page.evaluate(() => {
      const resources = [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')]
      return { ...window.__adjeetMetrics, transferBytes: resources.reduce((total, resource) => total + resource.transferSize, 0), encodedBytes: resources.reduce((total, resource) => total + resource.encodedBodySize, 0), resources: resources.map(resource => ({ url: resource.name, transferBytes: resource.transferSize, encodedBytes: resource.encodedBodySize })) }
    })
    return { mediaRequests, policy, measurement: 'Cold local Chromium, 390px, reduced motion, no network throttle; 2 seconds after fonts ready', metrics }
  })

  await check('Responsive routes have one heading and no horizontal overflow', async () => {
    const evidence = []
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/', '/services', '/services/glow-sign-boards', '/portfolio', '/about', '/contact', '/privacy', '/glow-sign-board-in-siliguri']) {
        const response = await visit(page, route)
        assert(response.status() === 200, `${route} returned ${response.status()}`)
        await page.locator('h1').waitFor({ state: 'visible' })
        const measure = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, h1: document.querySelectorAll('h1').length }))
        assert(measure.scrollWidth <= width, `${route} overflows at ${width}: ${measure.scrollWidth}`)
        assert(measure.h1 === 1, `${route} has ${measure.h1} main headings`)
        evidence.push({ route, ...measure })
      }
    }
    return evidence
  })

  await check('Reduced motion keeps content visible and changes the poster without film playback', async () => {
    await page.setViewportSize({ width: 390, height: 845 })
    await visit(page)
    const before = await page.locator('[data-hero-scene]').getAttribute('data-time')
    await page.getByRole('button', { name: /switch to (dark|light) mode/i }).click()
    await page.waitForFunction(before => document.querySelector('[data-hero-scene]').getAttribute('data-time') !== before, before)
    const filmState = await page.locator('[data-hero-scene]').evaluate(scene => ({ transition: scene.getAttribute('data-transition'), movies: [...scene.querySelectorAll('video')].map(video => ({ paused: video.paused, preload: video.preload, time: video.currentTime })) }))
    assert(filmState.transition === 'idle' && filmState.movies.every(video => video.paused && video.time === 0), 'Reduced motion played a film')
    for (const id of ['work-heading', 'services-heading', 'process-heading', 'coverage-heading', 'enquiry-heading']) {
      await page.locator('#' + id).scrollIntoViewIfNeeded()
      const visible = await page.locator('#' + id).evaluate(el => getComputedStyle(el).visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > 0.99)
      assert(visible, `${id} remains hidden`)
    }
    return filmState
  })

  await check('Selected project frames preserve source proportions on phones', async () => {
    await visit(page)
    const evidence = []
    for (const image of await page.locator('#selected-work img').all()) {
      await image.scrollIntoViewIfNeeded()
      await image.evaluate(img => img.decode())
      const item = await image.evaluate(img => { const box = img.getBoundingClientRect(); return { alt: img.alt, intrinsicRatio: img.naturalWidth / img.naturalHeight, displayRatio: box.width / box.height, fit: getComputedStyle(img).objectFit } })
      assert(Math.abs(item.intrinsicRatio - item.displayRatio) < 0.04, `Photo frame adds bars or crops: ${item.alt}`)
      evidence.push(item)
    }
    return evidence
  })

  await check('Portfolio filters sit below the header and still open a lightbox', async () => {
    await visit(page, '/portfolio')
    const sticky = page.locator('main .sticky').first()
    const geometry = await sticky.evaluate(el => ({ top: parseFloat(getComputedStyle(el).top), header: document.querySelector('header').getBoundingClientRect().height }))
    assert(geometry.top >= geometry.header - 1, `Filter overlaps header: ${JSON.stringify(geometry)}`)
    const card = page.getByRole('button', { name: /view:/i }).first()
    await card.click()
    await page.getByRole('dialog').waitFor({ state: 'visible' })
    await page.keyboard.press('Escape')
    return geometry
  })

  await check('Selected-work lightbox restores focus to its opener', async () => {
    await visit(page)
    const opener = page.locator('#selected-work').getByRole('button', { name: /view:/i }).first()
    await opener.scrollIntoViewIfNeeded()
    await opener.click()
    await page.getByRole('dialog', { name: 'Photo viewer' }).waitFor({ state: 'visible' })
    await page.keyboard.press('Escape')
    await page.getByRole('dialog', { name: 'Photo viewer' }).waitFor({ state: 'hidden' })
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label')?.startsWith('View:'))
    assert(await opener.evaluate(el => document.activeElement === el), 'Focus did not return to the selected work')
    return { focusRestored: true }
  })

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 845 } })
  await check('Server-rendered homepage remains useful without JavaScript', async () => {
    const staticPage = await noJS.newPage()
    await visit(staticPage)
    assert(await staticPage.getByRole('heading', { level: 1 }).isVisible(), 'No-JS heading hidden')
    assert(await staticPage.getByRole('link', { name: 'WhatsApp your project', exact: true }).first().isVisible(), 'No-JS enquiry hidden')
    const hidden = await staticPage.locator('h1,h2').evaluateAll(items => items.filter(el => getComputedStyle(el).visibility === 'hidden' || Number(getComputedStyle(el).opacity) === 0).map(el => el.textContent))
    assert(hidden.length === 0, 'No-JS headings are hidden: ' + hidden.join(', '))
    await staticPage.close()
    return { hiddenHeadings: hidden }
  })
  await noJS.close()

  await check('Normal motion survives breakpoint changes and navigation', async () => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await visit(page)
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
    await page.locator('#selected-work').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => {
      const heading = document.querySelector('#work-heading')
      return heading.getAttribute('aria-label') === "You've probably seen our work." && [...heading.querySelectorAll('*')].every(el => getComputedStyle(el).visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > 0.99)
    })
    await page.getByRole('banner').getByRole('link', { name: 'Services', exact: true }).click()
    await page.waitForURL('**/services')
    await page.goBack({ waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
    await page.setViewportSize({ width: 390, height: 845 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForFunction(() => !document.querySelector('[data-hero-media]').style.transform)
    const state = await page.locator('[data-hero-media]').evaluate(el => ({ transform: getComputedStyle(el).transform, width: document.documentElement.scrollWidth }))
    assert(state.transform === 'none' || state.transform === 'matrix(1, 0, 0, 1, 0, 0)', 'Scroll transform leaked into reduced motion')
    await visit(page, '/services')
    await visit(page)
    assert(await page.getByRole('heading', { level: 1 }).isVisible(), 'Heading hidden after navigation')
    return state
  })

  await check('Both supplied films complete on the matching poster, including rapid theme changes', async () => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1440, height: 900 })
    await visit(page)
    await settleHero(page)
    const scene = page.locator('[data-hero-scene]')
    const transitions = []
    for (let i = 0; i < 2; i++) {
      const before = await scene.getAttribute('data-time')
      await page.getByRole('button', { name: /switch to (dark|light) mode/i }).click()
      const direction = before === 'light' ? 'day-to-night' : 'night-to-day'
      await page.waitForFunction(direction => {
        const film = document.querySelector(`[data-testid="hero-${direction}-video"]`)
        return film.currentTime > 0 && film.dataset.visible === 'true'
      }, direction)
      await page.waitForFunction(() => document.querySelector('[data-hero-scene]').dataset.transition === 'idle', undefined, { timeout: 12000 })
      const theme = await scene.getAttribute('data-time')
      const poster = page.getByTestId(theme === 'dark' ? 'hero-night-layer' : 'hero-day-layer')
      assert(await poster.getAttribute('data-visible') === 'true', `Wrong poster after ${direction}`)
      transitions.push({ direction, theme })
    }
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /switch to (dark|light) mode/i }).click()
    await page.waitForFunction(() => document.querySelector('[data-hero-scene]').dataset.transition === 'idle', undefined, { timeout: 12000 })
    const finalTheme = await scene.getAttribute('data-time')
    assert(await page.getByTestId(finalTheme === 'dark' ? 'hero-night-layer' : 'hero-day-layer').getAttribute('data-visible') === 'true', 'Rapid toggles left the wrong poster')
    return { transitions, finalTheme }
  })

  await check('Production visuals at desktop and phone widths', async () => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const screenshots = []
    const capture = async name => { await page.screenshot({ path: path.join(output, name) }); screenshots.push(name) }
    await page.setViewportSize({ width: 1440, height: 900 })
    await visit(page)
    await settleHero(page)
    if (await page.locator('[data-hero-scene]').getAttribute('data-time') === 'dark') {
      await page.getByRole('button', { name: 'Switch to light mode' }).click()
      await page.waitForFunction(() => document.querySelector('[data-hero-scene]').dataset.transition === 'idle')
    }
    await settleHero(page)
    await capture('desktop-hero-day.png')
    for (const [id, name] of [['selected-work', 'desktop-selected-work.png'], ['how-it-works', 'desktop-process.png']]) {
      await page.locator('#' + id).evaluate(el => window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - 88, behavior: 'instant' }))
      await page.locator('#' + id + ' img').first().evaluate(img => img.decode())
      await page.waitForFunction(id => [...document.querySelector('#' + id).querySelectorAll('h2 *')].every(el => Number(getComputedStyle(el).opacity) > 0.99), id)
      await capture(name)
    }
    await visit(page, '/services')
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
    await page.waitForFunction(() => document.querySelector('h1').hasAttribute('aria-label') && [...document.querySelectorAll('h1 *')].every(el => Number(getComputedStyle(el).opacity) > 0.99))
    await capture('desktop-services.png')
    await page.setViewportSize({ width: 390, height: 845 })
    await visit(page)
    await settleHero(page)
    await capture('mobile-hero-day.png')
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await page.waitForFunction(() => document.querySelector('[data-hero-scene]').dataset.transition === 'idle')
    await capture('mobile-hero-night.png')
    await page.locator('#selected-work').scrollIntoViewIfNeeded()
    await page.locator('#selected-work img').first().evaluate(img => img.decode())
    await page.waitForFunction(() => [...document.querySelectorAll('#work-heading *')].every(el => Number(getComputedStyle(el).opacity) > 0.99))
    await capture('mobile-selected-work.png')
    await page.setViewportSize({ width: 320, height: 740 })
    await visit(page)
    await settleHero(page)
    await capture('small-phone-hero.png')
    return screenshots
  })

  await check('Browser has no uncaught application errors', async () => { assert(runtimeErrors.length === 0, runtimeErrors.join('\n')); return runtimeErrors })
  await context.close()
  await browser.close()
  await fs.writeFile(path.join(output, 'ui-verification.json'), JSON.stringify({ base, date: new Date().toISOString(), results }, null, 2))
  if (results.some(result => result.status === 'fail')) process.exitCode = 1
})().catch(error => { console.error(error); process.exitCode = 1 })
