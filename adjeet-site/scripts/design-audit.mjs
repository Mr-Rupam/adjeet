/* Reproducible local visual audit. Does not submit forms or send chat messages. */
import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const baseURL = process.argv[2] || 'http://localhost:3100'
const run = process.argv[3] || 'review'
const out = path.resolve('..', 'output', 'fieldwork', run)
const routes = ['/', '/services', '/portfolio', '/about', '/contact', '/services/glow-sign-boards', '/services/flex-printing', '/glow-sign-board-in-siliguri', '/privacy']

async function main() {
  await fs.mkdir(out, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  try {
  const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' })
  await context.addInitScript(() => { localStorage.setItem('adjeet-consent', 'declined'); localStorage.setItem('adjeet-theme', 'light') })
  const page = await context.newPage()
  page.setDefaultNavigationTimeout(60000)
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  const results = []
  for (const width of [1440, 390, 768]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of routes) {
      const response = await page.goto(baseURL + route, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => document.fonts.ready)
      for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 650) {
        await page.evaluate(y => window.scrollTo(0, y), y)
        await page.waitForTimeout(70)
      }
      await page.waitForTimeout(250)
      const checks = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
        h1: [...document.querySelectorAll('h1')].map(e => e.textContent),
        overflow: [...document.querySelectorAll('main *')].filter(e => { const b=e.getBoundingClientRect(); return b.width > 0 && (b.right > innerWidth + 1 || b.left < -1) && getComputedStyle(e).position !== 'absolute' }).slice(0,12).map(e => ({ tag:e.tagName, class:e.className, text:e.textContent?.slice(0,60) })),
        brokenImages: [...document.querySelectorAll('img')].filter(e => e.getBoundingClientRect().width > 0 && (!e.complete || !e.naturalWidth)).map(e => e.getAttribute('src')),
      }))
      await page.evaluate(() => window.scrollTo(0,0))
      const name = (route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')) + '-' + width
      await page.screenshot({ path: path.join(out,name+'.png'), fullPage: true, animations: 'disabled' })
      if(route === '/') await page.screenshot({ path: path.join(out,'home-fold-'+width+'.png'), animations: 'disabled' })
      results.push({ route, width, status:response?.status(), ...checks })
      console.log(route, width, response?.status(), 'overflow', checks.scrollWidth-width, 'broken', checks.brokenImages.length)
    }
  }
  await page.setViewportSize({ width:1440, height:900 })
  await page.goto(baseURL)
  await page.getByRole('button',{name:'Switch to dark mode'}).click()
  await page.screenshot({ path:path.join(out,'home-dark.png'), fullPage:true, animations:'disabled' })
  await fs.writeFile(path.join(out,'audit.json'),JSON.stringify({baseURL,results,errors},null,2))
  if(results.some(r => r.status !== 200 || r.scrollWidth > r.width || r.brokenImages.length) || errors.length) process.exitCode=1
  } finally {
    await browser.close()
  }
}
main().catch(e => { console.error(e); process.exitCode=1 })
