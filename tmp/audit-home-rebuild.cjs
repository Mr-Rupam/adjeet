const { chromium } = require('../adjeet-site/node_modules/playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const out = path.resolve(__dirname, '../output');
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = [];

  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(theme => {
      localStorage.setItem('adjeet-theme', theme);
      localStorage.setItem('adjeet-consent', 'accepted');
    }, theme);
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Load offscreen photos for the full-page export as well as the viewport.
    await page.locator('img').evaluateAll(images => images.forEach(img => { img.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0), { timeout: 30000 });

    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      const data = await page.evaluate(() => {
        const hero = document.querySelector('#hero-section');
        const overflow = [...document.querySelectorAll('main *')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width && r.height && (r.left < -1 || r.right > innerWidth + 1) && getComputedStyle(el).position !== 'absolute';
        }).map(el => ({ tag: el.tagName, className: el.className, text: el.textContent.slice(0, 50) }));
        return {
          title: document.title,
          pageWidth: document.documentElement.scrollWidth,
          viewport: innerWidth,
          heading: hero.querySelector('h1').innerText,
          headingCount: document.querySelectorAll('h1').length,
          oldSequenceRequests: performance.getEntriesByType('resource').filter(entry => entry.name.includes('/hero/seq/')).length,
          images: [...document.images].map(img => ({ alt: img.alt, loaded: img.complete && img.naturalWidth > 0 })),
          overflow,
        };
      });
      report.push({ theme, width, errors: [...errors], ...data });
      if (width === 1440 || width === 390) {
        const size = width === 1440 ? 'desktop' : 'mobile';
        await page.screenshot({ path: path.join(out, `adjeet-home-${size}-${theme}.png`), fullPage: true, animations: 'disabled' });
        await page.screenshot({ path: path.join(out, `adjeet-hero-${size}-${theme}.png`), animations: 'disabled' });
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    if (theme === 'light') {
      for (const [name, label] of [['projects', 'Selected signage projects'], ['comparison', 'Lighting presets']]) {
        const target = name === 'projects' ? page.getByRole('region', { name: label }) : page.getByRole('slider', { name: 'Compare day and night' }).locator('..');
        await target.scrollIntoViewIfNeeded();
        await target.screenshot({ path: path.join(out, `adjeet-${name}-detail.png`), animations: 'disabled' });
      }
    }
    await page.close();
  }
  await fs.writeFile(path.join(out, 'adjeet-home-audit.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.map(item => ({ theme: item.theme, width: item.width, pageWidth: item.pageWidth, errors: item.errors, unloadedImages: item.images.filter(img => !img.loaded).length, oldSequenceRequests: item.oldSequenceRequests, overflow: item.overflow })), null, 2));
  await browser.close();
}

main().catch(error => { console.error(error); process.exitCode = 1; });
