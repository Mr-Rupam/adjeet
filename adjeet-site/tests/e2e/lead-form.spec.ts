import { test, expect, type Page } from '@playwright/test';
import { stubTurnstile, waitForTurnstileToken, TURNSTILE_DUMMY_TOKEN } from './support/turnstile';

// Hermetic by design. Turnstile is stubbed in the browser (see
// ./support/turnstile.ts for why the real widget cannot be driven), and every
// submission is answered here rather than by the real /api/lead. That route
// verifies the token with Cloudflare from Node, where Playwright cannot
// intercept it, and with .env.local loaded it would write the lead to the
// MongoDB and Google Sheet configured there and send the email and WhatsApp
// notifications.

type LeadReply = { status: number; json: Record<string, unknown> };

/** Answer /api/lead with `replies` in order, repeating the last, and record every body posted. */
async function routeLeadApi(page: Page, replies: LeadReply[]) {
  const posted: Record<string, unknown>[] = [];
  await page.route('/api/lead', async (route) => {
    posted.push(route.request().postDataJSON());
    await route.fulfill(replies[Math.min(posted.length, replies.length) - 1]);
  });
  return posted;
}

test.describe('Lead Form', () => {
  test.beforeEach(async ({ page }) => {
    await stubTurnstile(page);
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
    await waitForTurnstileToken(page);

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
    await waitForTurnstileToken(page);

    await page.click('button[type="submit"]');

    await expect(page.getByText('Something went wrong. Please try WhatsApp instead.')).toBeVisible();

    // The banner that says "try WhatsApp" carries the link itself, prefilled
    // with the town the visitor picked. Scoped to the form: Next's route
    // announcer is also role="alert".
    const alert = page.locator('form').filter({ has: page.locator('#lead-name') }).getByRole('alert');
    const whatsApp = alert.getByRole('link', { name: /whatsapp your brief/i });
    await expect(whatsApp).toBeVisible();
    const href = (await whatsApp.getAttribute('href')) ?? '';
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(decodeURIComponent(href)).toContain('in Siliguri');
  });
});

// The 27 regional pages pass the city and trade they are about into LeadForm,
// so the visitor never picks either again. This one is Glow Sign Boards in
// Siliguri.
test.describe('Lead Form on a regional service-area page', () => {
  const regionalPath = '/glow-sign-board-in-siliguri';
  const serverError = 'Something went wrong. Please try WhatsApp instead.';

  // The page has a second form and its own submit button, so scope to the lead form.
  const leadForm = (page: Page) => page.locator('form').filter({ has: page.locator('#lead-name') });
  const sendButton = (page: Page) => leadForm(page).getByRole('button', { name: /send the brief/i });
  const received = (page: Page) => page.getByRole('status').filter({ hasText: 'Message received.' });

  test.beforeEach(async ({ page }) => {
    await stubTurnstile(page);
    await page.goto(regionalPath);
  });

  test('arrives with the city and trade filled in and submits', async ({ page }) => {
    const posted = await routeLeadApi(page, [{ status: 200, json: { ok: true } }]);
    const form = leadForm(page);

    await expect(form.locator('#lead-city')).toHaveValue('Siliguri');
    await expect(form.locator('input[type="checkbox"][value="glow-sign-boards"]')).toBeChecked();
    await expect(form.locator('input[type="checkbox"]:checked')).toHaveCount(1);

    await form.locator('#lead-name').fill('Test User');
    await form.locator('#lead-phone').fill('9876543210');
    await waitForTurnstileToken(page);
    await sendButton(page).click();

    await expect(received(page)).toBeVisible();
    await expect(received(page)).toBeFocused();
    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({
      name: 'Test User',
      phone: '9876543210',
      city: 'Siliguri',
      serviceInterest: ['glow-sign-boards'],
      cfTurnstileResponse: TURNSTILE_DUMMY_TOKEN,
    });
  });

  test('a server error is announced, keeps the brief and succeeds on retry', async ({ page }) => {
    const posted = await routeLeadApi(page, [
      { status: 500, json: { error: serverError } },
      { status: 200, json: { ok: true } },
    ]);
    const form = leadForm(page);

    await form.locator('#lead-name').fill('Test User');
    await form.locator('#lead-phone').fill('9876543210');
    await waitForTurnstileToken(page);
    await sendButton(page).click();

    // Scoped to the form: Next's route announcer is also role="alert".
    const alert = form.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(serverError);

    // The fallback the message points to sits inside the banner, prefilled with
    // this brief's trade and town, so the visitor neither hunts for it nor
    // types the brief again.
    const whatsApp = alert.getByRole('link', { name: /whatsapp your brief/i });
    await expect(whatsApp).toBeVisible();
    const href = (await whatsApp.getAttribute('href')) ?? '';
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(decodeURIComponent(href)).toContain('Glow Sign Boards in Siliguri');

    // Nothing the visitor typed or was given is lost.
    await expect(form.locator('#lead-name')).toHaveValue('Test User');
    await expect(form.locator('#lead-phone')).toHaveValue('9876543210');
    await expect(form.locator('#lead-city')).toHaveValue('Siliguri');
    await expect(form.locator('input[type="checkbox"][value="glow-sign-boards"]')).toBeChecked();

    // LeadForm resets the widget and clears its token after a failure, so the
    // retry only goes through once the widget has issued a fresh one.
    await waitForTurnstileToken(page);
    await sendButton(page).click();

    await expect(received(page)).toBeVisible();
    await expect(alert).toHaveCount(0);
    expect(posted).toHaveLength(2);
    expect(posted[1]).toMatchObject({
      name: 'Test User',
      city: 'Siliguri',
      serviceInterest: ['glow-sign-boards'],
      cfTurnstileResponse: TURNSTILE_DUMMY_TOKEN,
    });
  });
});
