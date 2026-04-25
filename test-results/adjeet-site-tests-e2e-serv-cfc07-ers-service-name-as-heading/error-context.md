# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adjeet-site\tests\e2e\services.spec.ts >> /services/[slug] detail >> renders service name as heading
- Location: adjeet-site\tests\e2e\services.spec.ts:31:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/services/glow-sign-boards", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('/services overview', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/services')
  6  |     await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
  7  |     await page.reload()
  8  |     await page.goto('/services')
  9  |   })
  10 | 
  11 |   test('page heading is visible', async ({ page }) => {
  12 |     await expect(page.getByRole('heading', { name: 'Our Services' })).toBeVisible()
  13 |   })
  14 | 
  15 |   test('renders 10 service tiles with taglines', async ({ page }) => {
  16 |     const serviceLinks = page.locator('a[href^="/services/"]')
  17 |     await expect(serviceLinks).toHaveCount(10)
  18 |     // First service tagline visible in expanded mode
  19 |     await expect(page.getByText('Illuminate your brand 24/7')).toBeVisible()
  20 |   })
  21 | })
  22 | 
  23 | test.describe('/services/[slug] detail', () => {
  24 |   test.beforeEach(async ({ page }) => {
> 25 |     await page.goto('/services/glow-sign-boards')
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  26 |     await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
  27 |     await page.reload()
  28 |     await page.goto('/services/glow-sign-boards')
  29 |   })
  30 | 
  31 |   test('renders service name as heading', async ({ page }) => {
  32 |     await expect(
  33 |       page.getByRole('heading', { name: 'Glow Sign Boards' })
  34 |     ).toBeVisible()
  35 |   })
  36 | 
  37 |   test('breadcrumb shows correct path', async ({ page }) => {
  38 |     await expect(page.getByRole('link', { name: 'Services' })).toBeVisible()
  39 |     await expect(page.getByText('Glow Sign Boards', { exact: false })).toBeVisible()
  40 |   })
  41 | 
  42 |   test('FAQ accordion opens and closes', async ({ page }) => {
  43 |     const firstQuestion = page.getByRole('button', { name: /how long do the led strips last/i })
  44 |     await expect(firstQuestion).toBeVisible()
  45 |     await firstQuestion.click()
  46 |     await expect(page.getByText(/30,000–50,000 hours/)).toBeVisible()
  47 |     await firstQuestion.click()
  48 |     await expect(page.getByText(/30,000–50,000 hours/)).not.toBeVisible()
  49 |   })
  50 | 
  51 |   test('WhatsApp CTA href starts with wa.me', async ({ page }) => {
  52 |     const waLink = page.getByRole('link', { name: /chat on whatsapp/i })
  53 |     await expect(waLink).toBeVisible()
  54 |     const href = await waLink.getAttribute('href')
  55 |     expect(href).toMatch(/^https:\/\/wa\.me\//)
  56 |   })
  57 | 
  58 |   test('related services section renders', async ({ page }) => {
  59 |     await expect(page.getByText('Related Services')).toBeVisible()
  60 |   })
  61 | 
  62 |   test('returns 404 for unknown slug', async ({ page }) => {
  63 |     await page.goto('/services/not-a-real-service')
  64 |     await expect(page.getByText(/404|not found/i)).toBeVisible()
  65 |   })
  66 | })
  67 | 
```