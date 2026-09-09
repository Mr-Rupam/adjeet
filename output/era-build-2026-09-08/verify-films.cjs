const { createRequire } = require('node:module')
const fs = require('node:fs/promises')
const path = require('node:path')
const requireProject = createRequire('C:/Users/KIIT0001/Downloads/AD_JEET/.superpowers/worktrees/era-build/adjeet-site/package.json')
const { chromium } = requireProject('playwright')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
  await page.addInitScript(() => {
    localStorage.setItem('adjeet-consent', 'declined')
    localStorage.setItem('adjeet-theme', 'dark')
  })
  const report = { toggles: [] }
  try {
    await page.goto('http://127.0.0.1:4180/', { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('[data-hero-title] > span[style]') && document.querySelector('[data-hero-scene]').dataset.time === document.documentElement.dataset.theme)
    await page.locator('video').evaluateAll(videos => {
      window.__filmEvents = []
      for (const video of videos) for (const event of ['loadstart', 'loadedmetadata', 'canplay', 'playing', 'pause', 'stalled', 'error', 'ended']) {
        video.addEventListener(event, () => window.__filmEvents.push({ event, video: video.dataset.testid, time: video.currentTime, ready: video.readyState, error: video.error?.code, clock: performance.now() }))
      }
    })
    for (let i = 0; i < 2; i++) {
      const before = await page.locator('[data-hero-scene]').getAttribute('data-time')
      const toggle = page.getByRole('button', { name: /switch to (dark|light) mode/i })
      const label = await toggle.getAttribute('aria-label')
      const direction = before === 'light' ? 'day-to-night' : 'night-to-day'
      report.toggles.push({ before, label, direction })
      console.log('TOGGLE', JSON.stringify(report.toggles.at(-1)))
      await toggle.click()
      await page.waitForFunction(direction => {
        const video = document.querySelector(`[data-testid="hero-${direction}-video"]`)
        return video.currentTime > 0 && video.dataset.visible === 'true'
      }, direction, { timeout: 7000 })
      await page.waitForFunction(() => document.querySelector('[data-hero-scene]').dataset.transition === 'idle', undefined, { timeout: 12000 })
      report.toggles.at(-1).after = await page.locator('[data-hero-scene]').getAttribute('data-time')
      console.log('COMPLETED', JSON.stringify(report.toggles.at(-1)))
    }
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /switch to (dark|light) mode/i }).click()
    await page.waitForFunction(() => document.querySelector('[data-hero-scene]').dataset.transition === 'idle', undefined, { timeout: 12000 })
    report.status = 'pass'
  } catch (error) { report.status = 'fail'; report.error = error.message; process.exitCode = 1 }
  report.state = await page.locator('[data-hero-scene]').evaluate(scene => ({ htmlTheme: document.documentElement.dataset.theme, theme: scene.dataset.time, transition: scene.dataset.transition, films: [...scene.querySelectorAll('video')].map(video => ({ id: video.dataset.testid, visible: video.dataset.visible, time: video.currentTime, paused: video.paused, ready: video.readyState, network: video.networkState, duration: video.duration, error: video.error?.code })) }))
  report.events = await page.evaluate(() => window.__filmEvents)
  console.log(JSON.stringify(report, null, 2))
  await fs.writeFile(path.join(__dirname, 'film-verification.json'), JSON.stringify(report, null, 2))
  await browser.close()
})().catch(error => { console.error(error); process.exitCode = 1 })
