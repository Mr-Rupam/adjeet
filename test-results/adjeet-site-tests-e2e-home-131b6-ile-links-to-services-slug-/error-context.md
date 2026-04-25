# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adjeet-site\tests\e2e\home.spec.ts >> Home page >> each service tile links to /services/[slug]
- Location: adjeet-site\tests\e2e\home.spec.ts:32:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Home page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Accept consent so it doesn't interfere with other assertions
> 6  |     await page.goto('/')
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  7  |     await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
  8  |     await page.reload()
  9  |   })
  10 | 
  11 |   test('hero heading is visible', async ({ page }) => {
  12 |     await expect(
  13 |       page.getByRole('heading', { name: /north bengal's most trusted signage company/i })
  14 |     ).toBeVisible()
  15 |   })
  16 | 
  17 |   test('hero has link to /services', async ({ page }) => {
  18 |     await expect(page.getByRole('link', { name: 'Our Services' })).toBeVisible()
  19 |   })
  20 | 
  21 |   test('hero has WhatsApp link', async ({ page }) => {
  22 |     const waLink = page.getByRole('link', { name: /whatsapp/i }).first()
  23 |     const href = await waLink.getAttribute('href')
  24 |     expect(href).toMatch(/^https:\/\/wa\.me\//)
  25 |   })
  26 | 
  27 |   test('services grid renders 10 tiles', async ({ page }) => {
  28 |     const serviceLinks = page.locator('a[href^="/services/"]')
  29 |     await expect(serviceLinks).toHaveCount(10)
  30 |   })
  31 | 
  32 |   test('each service tile links to /services/[slug]', async ({ page }) => {
  33 |     const links = await page.locator('a[href^="/services/"]').all()
  34 |     for (const link of links) {
  35 |       const href = await link.getAttribute('href')
  36 |       expect(href).toMatch(/^\/services\/[\w-]+$/)
  37 |     }
  38 |   })
  39 | 
  40 |   test('proof block stats are visible', async ({ page }) => {
  41 |     await page.locator('dl').scrollIntoViewIfNeeded()
  42 |     await expect(page.getByText('Projects')).toBeVisible()
  43 |     await expect(page.getByText('Clients')).toBeVisible()
  44 |   })
  45 | 
  46 |   test('gallery teaser shows 6 photo buttons', async ({ page }) => {
  47 |     const photoButtons = page.locator('[aria-label^="View photo:"]')
  48 |     await expect(photoButtons).toHaveCount(6)
  49 |   })
  50 | 
  51 |   test('trust band shows category tags', async ({ page }) => {
  52 |     await expect(page.getByText(/Illuminated/)).toBeVisible()
  53 |     await expect(page.getByText(/Branding/)).toBeVisible()
  54 |   })
  55 | })
  56 | 
```