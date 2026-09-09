const { chromium } = require('../../adjeet-site/node_modules/playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

let browser;
(async () => {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await context.addInitScript(() => localStorage.setItem('adjeet-consent', 'declined'));
  const page = await context.newPage();
  const base = process.env.REVIEW_URL || 'http://localhost:3000';
  const output = path.join(__dirname, 'screenshots');
  const records = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('#home-heading').waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#hero-section').screenshot({ path: path.join(output, `hero-${width}-light-final.png`) });
    records.push({ width, theme: 'light', scrim: await page.locator('[class*="heroScrim"]').evaluate(element => getComputedStyle(element).backgroundImage) });
    await page.locator('#how-it-works').scrollIntoViewIfNeeded();
    await page.locator('#how-it-works img').evaluate(image => image.decode());
    await page.locator('#how-it-works').screenshot({ path: path.join(output, `process-${width}-final.png`) });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await page.locator('#hero-section').screenshot({ path: path.join(output, `hero-${width}-dark-final.png`) });
    for (const route of ['/services', '/portfolio', '/about', '/contact', '/services/glow-sign-boards', '/privacy']) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.locator('h1').waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
      const record = await page.evaluate(() => ({
        width: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        theme: document.documentElement.getAttribute('data-theme'),
        headingColor: getComputedStyle(document.querySelector('h1')).color,
        background: getComputedStyle(document.body).backgroundColor,
        overflow: [...document.querySelectorAll('h1,h2,h3,p,main a')].filter(element => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 3);
        }).map(element => element.textContent.trim().slice(0, 80)),
      }));
      records.push({ route, ...record });
      if (['/services', '/contact', '/about'].includes(route)) {
        await page.screenshot({ path: path.join(output, `${route.slice(1)}-${width}-dark-final.png`) });
      }
    }
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
  }
  await fs.writeFile(path.join(__dirname, 'final-visual-check.json'), JSON.stringify(records, null, 2));
  console.log(JSON.stringify(records, null, 2));
  await browser.close();
  if (records.some(record => record.overflow?.length || record.pageWidth > record.width)) process.exitCode = 1;
})().catch(async error => { console.error(error); await browser?.close(); process.exitCode = 1; });
