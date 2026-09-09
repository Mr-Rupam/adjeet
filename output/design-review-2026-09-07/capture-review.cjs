// Local visual audit through the project's Playwright test runtime. It creates
// an isolated browser and never controls the user's tabs or submits enquiries.
const { chromium } = require('../../adjeet-site/node_modules/playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  const output = path.join(__dirname, 'screenshots');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.addInitScript(() => localStorage.setItem('adjeet-consent', 'declined'));
  const records = [];
  const routes = ['/', '/services', '/portfolio', '/about', '/contact', '/services/glow-sign-boards', '/privacy'];
  const base = process.env.REVIEW_URL || 'http://localhost:3000';

  for (const width of [390, 1440, 320, 768, 1024]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    for (const route of (width === 768 || width === 1024 ? ['/'] : routes)) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      const initial = await page.evaluate(() => ({
        headerBackground: getComputedStyle(document.querySelector('.site-header')).background,
        menuVisible: getComputedStyle(document.querySelector('.mobile-nav-trigger')).display !== 'none',
        headerWidth: document.querySelector('[aria-label="Main navigation"]').getBoundingClientRect().width,
      }));
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 720) {
        await page.evaluate(y => window.scrollTo(0, y), y);
        await page.waitForTimeout(60);
      }
      await page.waitForFunction(() => [...document.images].filter(image => image.offsetParent !== null).every(image => image.complete), { timeout: 15000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      const name = route === '/' ? 'home' : route.replace(/^\//, '').replaceAll('/', '-');
      if (width === 390 || width === 1440 || route === '/') {
        await page.screenshot({ path: path.join(output, `${name}-${width}-light-after.png`), fullPage: true });
      }
      const metrics = await page.evaluate(() => ({
        width: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        brokenImages: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.getAttribute('src')),
        overflow: [...document.querySelectorAll('main h1, main h2, main h3, main p, main a, header a, header button')].filter(element => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 3);
        }).map(element => ({ text: element.textContent.trim().slice(0, 80), className: element.className })),
      }));
      records.push({ route, status: response.status(), viewport: width, ...initial, ...metrics });
      console.log(JSON.stringify(records[records.length - 1]));
      if (route === '/' && (width === 390 || width === 1440)) {
        await page.getByRole('button', { name: 'Switch to dark mode' }).click();
        await page.screenshot({ path: path.join(output, `home-${width}-dark-after.png`), fullPage: true });
        const cdp = await context.newCDPSession(page);
        await cdp.send('DOM.enable');
        await cdp.send('CSS.enable');
        const doc = await cdp.send('DOM.getDocument');
        for (const selector of ['#home-heading', '#home-heading span']) {
          const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector });
          records.push({ viewport: width, selector, platformFonts: await cdp.send('CSS.getPlatformFontsForNode', { nodeId }) });
        }
        await cdp.detach();
        await page.getByRole('button', { name: 'Switch to light mode' }).click();
      }
    }
  }
  await fs.writeFile(path.join(__dirname, 'browser-audit.json'), JSON.stringify({ records, errors }, null, 2));
  await browser.close();
  if (errors.length || records.some(record => record.status >= 400 || record.brokenImages?.length || record.overflow?.length || record.pageWidth > record.viewport)) {
    process.exitCode = 1;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
