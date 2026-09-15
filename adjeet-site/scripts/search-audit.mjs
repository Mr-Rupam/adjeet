/* Production crawl + responsive review. No forms submitted or external messages sent. */
import { JSDOM } from 'jsdom'
import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const base = process.argv[2] || 'http://localhost:3100'
const out = path.resolve('..', 'output', 'search-postmortem-20260914', process.argv[3] || 'review')
const canonicalBase = 'https://adjeet.in'
const normalize = text => (text || '').replace(/\s+/g, ' ').trim()
const report = { base, pages: [], bots: [], viewports: [], accessibility: [], errors: [] }
const axeSource = await fs.readFile(path.resolve('node_modules/axe-core/axe.min.js'), 'utf8')
async function checkAccessibility(page, route, theme, width) {
  await page.addScriptTag({ content: axeSource })
  const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })))
  report.accessibility.push({ route, theme, width, violations })
  assert.equal(violations.length, 0, route + ' accessibility: ' + JSON.stringify(violations))
}

async function crawl() {
  const sitemap = await fetch(base + '/sitemap.xml').then(response => response.text())
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
  assert.equal(urls.length, 42)
  assert.equal(new Set(urls).size, urls.length)
  assert(!urls.includes(canonicalBase + '/privacy'))
  const graph = new Map()
  for (const url of urls) {
    const route = new URL(url).pathname
    const response = await fetch(base + route, { headers: { 'User-Agent': 'Googlebot' } })
    assert.equal(response.status, 200, route)
    assert(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), route)
    const dom = new JSDOM(await response.text())
    try {
      const doc = dom.window.document
      const meta = name => doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.content
      const title = doc.title
      assert.equal(doc.querySelector('link[rel="canonical"]')?.href, new URL(url).href, route + ' canonical')
      assert.equal(new URL(meta('og:url')).href, new URL(url).href, route + ' og:url')
      assert.equal(meta('og:title'), title, route + ' og:title')
      assert.equal(meta('twitter:title'), title, route + ' twitter:title')
      assert.equal((title.match(/AD JEET/g) || []).length, 1, route + ' repeated brand')
      assert(meta('description')?.length > 30, route + ' description')
      assert(!/noindex/i.test(meta('robots') || ''), route + ' noindex')
      assert.equal(doc.querySelectorAll('h1').length, 1, route + ' h1')
      const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent))
      const business = schemas.find(schema => schema['@type'] === 'LocalBusiness')
      assert.equal(business?.email, 'ranjitadjeet@gmail.com', route + ' business email')
      assert.equal(business?.founder.name, 'Ranjit Das', route + ' founder')
      assert.equal(business?.['@id'], canonicalBase + '/#business', route + ' business ID')
      const main = doc.querySelector('main')
      assert(main.querySelector('h1'), route + ' main content requires JavaScript')
      if (route === '/portfolio') assert.equal(main.querySelectorAll('button[aria-label^="View:"]').length, 5, 'portfolio evidence missing from HTML')
      const body = main.cloneNode(true)
      body.querySelectorAll('script, style').forEach(node => node.remove())
      const content = normalize(body.textContent)
      let answers = 0
      for (const faq of schemas.filter(schema => schema['@type'] === 'FAQPage')) {
        for (const item of faq.mainEntity) {
          assert(content.includes(normalize(item.name)), route + ' missing FAQ question')
          assert(content.includes(normalize(item.acceptedAnswer.text)), route + ' missing FAQ answer')
          answers++
        }
      }
      assert(!/info@adjeet|Jeet Kumar Sarkar|500\+ installations|200\+ signs/i.test(content), route + ' stale claim')
      assert(doc.querySelector('a[href^="https://wa.me/"]'), route + ' enquiry path')
      const links = [...doc.querySelectorAll('a[href^="/"]')].map(link => new URL(link.getAttribute('href'), canonicalBase).pathname)
      graph.set(route, links)
      report.pages.push({ route, status: response.status, title, canonical: url, h1: normalize(doc.querySelector('h1').textContent), answersInHTML: answers })
    } finally { dom.window.close() }
  }
  const visited = new Set()
  const queue = ['/']
  while (queue.length) {
    const current = queue.shift()
    if (visited.has(current)) continue
    visited.add(current)
    queue.push(...(graph.get(current) || []).filter(link => graph.has(link)))
  }
  for (const url of urls) assert(visited.has(new URL(url).pathname), url + ' orphan page')
  report.reachableIndexablePages = urls.length
  for (const agent of ['Googlebot', 'bingbot', 'OAI-SearchBot']) {
    for (const route of ['/', '/flex-printing-in-darjeeling']) {
      const response = await fetch(base + route, { headers: { 'User-Agent': agent } })
      const html = await response.text()
      assert.equal(response.status, 200)
      assert(html.includes('<h1'))
      assert(html.includes('rel="canonical"'))
      report.bots.push({ agent, route, status: response.status })
    }
  }
  const robots = await fetch(base + '/robots.txt').then(response => response.text())
  assert(/User-Agent: \*/i.test(robots) && /Allow: \//.test(robots))
  assert(!/Disallow: \/\s/.test(robots))
  const llms = await fetch(base + '/llms.txt').then(response => response.text())
  assert(llms.includes('Ranjit Das') && llms.includes('ranjitadjeet@gmail.com'))
  assert(!/info@adjeet|Jeet Kumar Sarkar/.test(llms))
  const missing = await fetch(base + '/not-a-real-service')
  assert.equal(missing.status, 404)
  console.log('Crawl: ' + urls.length + ' canonical pages, matching metadata and FAQ text, all reachable from home; 6 bot-agent responses passed.')
}

async function visual() {
  const browser = await chromium.launch({ headless: true })
  try {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: theme })
      await context.addInitScript(theme => {
        localStorage.setItem('adjeet-consent', 'declined')
        localStorage.setItem('adjeet-theme', theme)
      }, theme)
      const page = await context.newPage()
      page.setDefaultTimeout(30000)
      page.setDefaultNavigationTimeout(60000)
      page.on('pageerror', error => report.errors.push(error.message))
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(base, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        assert.equal(normalize(await page.locator('h1').textContent()), 'Signage & outdoor advertising in Siliguri.')
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
        assert(overflow <= 0, `${theme} ${width}: overflow ${overflow}`)
        await page.screenshot({ path: path.join(out, `home-${theme}-${width}.png`), animations: 'disabled' })
        const footer = page.locator('footer')
        await footer.scrollIntoViewIfNeeded()
        const logo = footer.locator('.brand-logo')
        assert.equal(await logo.evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)')
        assert.equal(await logo.locator('img').evaluate(image => image.complete && image.naturalWidth > 0), true)
        if ([390, 1440].includes(width)) await footer.screenshot({ path: path.join(out, `footer-${theme}-${width}.png`), animations: 'disabled' })
        const faq = page.locator('details').first()
        await faq.locator('summary').click()
        assert(await faq.locator('p').isVisible())
        if ([390, 1440].includes(width)) await page.locator('section[aria-labelledby="home-faq-heading"]').screenshot({ path: path.join(out, `faq-${theme}-${width}.png`), animations: 'disabled' })
        if ([320, 1440].includes(width)) await checkAccessibility(page, '/', theme, width)
        report.viewports.push({ route: '/', theme, width, overflow, transparentFooter: true, faqOperable: true })
      }
      for (const route of ['/services', '/services/flex-printing', '/f-pole-installation-in-darjeeling', '/contact', '/about', '/portfolio']) {
        for (const width of [390, 1440]) {
          await page.setViewportSize({ width, height: 900 })
          await page.goto(base + route, { waitUntil: 'networkidle' })
          await page.evaluate(() => document.fonts.ready)
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
          assert(overflow <= 0, `${route} ${theme} ${width}: overflow ${overflow}`)
          const question = page.locator('main details summary').first()
          if (await question.count()) {
            await question.click()
            assert(await page.locator('main details[open] p').first().isVisible())
          }
          if (route === '/contact' && await page.locator('[data-form-unavailable]').count()) {
            assert(await page.getByRole('link', { name: 'WhatsApp your brief' }).isVisible())
            assert.equal(await page.locator('.contact-form form').count(), 0)
          }
          await page.evaluate(() => scrollTo(0, 0))
          await page.screenshot({ path: path.join(out, `${route.slice(1).replaceAll('/', '-')}-${theme}-${width}.png`), fullPage: true, animations: 'disabled' })
          if (width === 390) await checkAccessibility(page, route, theme, width)
          report.viewports.push({ route, theme, width, overflow })
        }
      }
      await context.close()
    }
    const noJS = await browser.newContext({ javaScriptEnabled: false })
    const page = await noJS.newPage()
    await page.goto(base)
    assert(await page.locator('h1').isVisible())
    await page.locator('details summary').first().click()
    assert(await page.locator('details p').first().isVisible())
    report.noJavaScriptHomeFAQ = true
    for (const route of ['/services/flex-printing', '/glow-sign-board-in-siliguri']) {
      await page.goto(base + route)
      assert(await page.locator('main h1').isVisible(), route + ' no-JS heading')
      const details = page.locator('main details').first()
      await details.locator('summary').click()
      assert(await details.locator('p').isVisible(), route + ' no-JS answer')
    }
    report.noJavaScriptServiceAndRegionalFAQ = true
    await page.goto(base + '/portfolio')
    assert.equal(await page.getByRole('button', { name: /^View:/ }).count(), 5)
    assert(await page.getByRole('button', { name: /^View:/ }).first().isVisible())
    report.noJavaScriptPortfolio = true
    await noJS.close()
  } finally { await browser.close() }
  assert.deepEqual(report.errors, [])
  console.log('Visual checks: 34 route/theme/width combinations, transparent footer, working FAQs and no horizontal overflow or page errors.')
}

await fs.mkdir(out, { recursive: true })
try {
  await crawl()
  await visual()
} catch (error) {
  report.failure = error.stack
  process.exitCode = 1
  console.error(error)
} finally {
  await fs.writeFile(path.join(out, 'audit.json'), JSON.stringify(report, null, 2))
}
