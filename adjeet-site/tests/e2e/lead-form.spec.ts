import { test, expect, type Page } from '@playwright/test';

// Turnstile (dev test key) auto-passes with no user interaction, but the
// iframe challenge round-trip is async — cfTurnstileResponse isn't populated
// until onSuccess fires, which submit must wait for or the form's required
// CAPTCHA validation blocks the request before it ever reaches /api/lead.
async function waitForTurnstile(page: Page) {
  await page
    .frameLocator('iframe[src*="challenges.cloudflare.com"]')
    .locator('body')
    .waitFor({ timeout: 10000 })
    .catch(() => {});
  await page.waitForTimeout(2000);
}

test.describe('Lead Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('Required field validation', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#lead-name-err')).toBeVisible();
    await expect(page.locator('#lead-phone-err')).toBeVisible();
    await expect(page.locator('#lead-city-err')).toBeVisible();
  });

  test('Happy path submission', async ({ page }) => {
    await page.route('/api/lead', async (route) => {
      await route.fulfill({ json: { ok: true } });
    });

    await page.fill('#lead-name', 'Test User');
    await page.fill('#lead-phone', '9876543210');
    await page.selectOption('#lead-city', 'Siliguri');
    await page.locator('input[type="checkbox"]').first().check();
    await waitForTurnstile(page);

    await page.click('button[type="submit"]');

    await expect(page.getByText('Message received.')).toBeVisible();
  });

  test('Server error shows error message and WhatsApp fallback', async ({ page }) => {
    await page.route('/api/lead', async (route) => {
      await route.fulfill({
        status: 500,
        json: { error: 'Something went wrong. Please try WhatsApp instead.' }
      });
    });

    await page.fill('#lead-name', 'Test User');
    await page.fill('#lead-phone', '9876543210');
    await page.selectOption('#lead-city', 'Siliguri');
    await page.locator('input[type="checkbox"]').first().check();
    await waitForTurnstile(page);

    await page.click('button[type="submit"]');

    await expect(page.getByText('Something went wrong. Please try WhatsApp instead.')).toBeVisible();
  });
});
