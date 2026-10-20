import { test, expect, type Page } from '@playwright/test'
import { stubTurnstile, waitForTurnstileToken } from './support/turnstile'

// Hermetic: every /api/lead request is answered here, so no enquiry is sent.

async function fillBrief(page: Page) {
  await page.locator('#lead-name').fill('রূপম দাস')
  await page.locator('#lead-phone').fill('9876543210')
  await page.locator('#lead-city').selectOption('Siliguri')
  await page.getByRole('checkbox', { name: /help choosing/i }).check()
  await expect(page.locator('#lead-timeline')).toHaveValue('unspecified')
  await waitForTurnstileToken(page)
}

test('invalid success and a lost response preserve the brief and reference; an edit gets a new reference', async ({ page }) => {
  await stubTurnstile(page)
  const posted: Record<string, unknown>[] = []
  await page.route('/api/lead', async route => {
    const body = route.request().postDataJSON()
    posted.push(body)
    if (posted.length === 1) return route.fulfill({ json: { ok: true } })
    if (posted.length === 2) return route.abort('failed')
    return route.fulfill({ json: { ok: true, receiptId: body.submissionId } })
  })
  await page.goto('/contact')
  await fillBrief(page)
  const send = page.getByRole('button', { name: /send the brief/i })
  const alert = page.locator('form').getByRole('alert')
  await send.click()
  await expect(alert).toContainText('could not confirm')
  await expect(alert).toContainText(String(posted[0].submissionId))
  await expect(page.getByText('Message received.')).toHaveCount(0)
  await waitForTurnstileToken(page)
  await send.click()
  await expect(alert).toContainText('connection was interrupted')
  expect(posted[1].submissionId).toBe(posted[0].submissionId)
  await expect(page.locator('#lead-name')).toHaveValue('রূপম দাস')
  await page.locator('#lead-message').fill('Different shopfront details')
  await waitForTurnstileToken(page)
  await send.click()
  await expect(page.getByText('Message received.')).toBeVisible()
  expect(posted[2].submissionId).not.toBe(posted[1].submissionId)
  expect(posted[2]).toMatchObject({ name: 'রূপম দাস', timeline: 'unspecified', serviceInterest: ['help-choosing'] })
  await expect(page.getByRole('status').filter({ hasText: 'Message received.' })).toBeFocused()
})

test('carries only approved source labels from the landing page through internal navigation', async ({ page }) => {
  await stubTurnstile(page)
  let submitted: Record<string, unknown> | undefined
  await page.route('/api/lead', route => {
    submitted = route.request().postDataJSON()
    return route.fulfill({ json: { ok: true, receiptId: submitted?.submissionId } })
  })
  await page.goto('/?utm_source=google&utm_medium=organic&utm_campaign=gbp&phone=9876543210')
  // Use the existing client navigation, retaining only the in-memory landing labels.
  await page.locator('a[href="/contact"]').first().click()
  await expect(page).toHaveURL(/\/contact$/)
  await fillBrief(page)
  await page.getByRole('button', { name: /send the brief/i }).click()
  await expect(page.getByText('Message received.')).toBeVisible()
  expect(submitted?.source).toEqual({ landingPage: '/', source: 'google', medium: 'organic', campaign: 'gbp' })
})

for (const width of [320, 390, 768, 1440]) {
  test(`the contact form stays usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await stubTurnstile(page)
    // Fail closed even if this layout check is later extended with a submit click.
    await page.route('/api/lead', route => route.fulfill({ status: 503, json: { error: 'Local test only' } }))
    await page.goto('/contact')
    await expect(page.locator('h1')).toBeVisible()
    await page.locator('#lead-name').scrollIntoViewIfNeeded()
    await page.locator('#lead-name').focus()
    await page.keyboard.press('Tab')
    await expect(page.locator('#lead-phone')).toBeFocused()
    await page.getByRole('checkbox', { name: /help choosing/i }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('checkbox', { name: /help choosing/i })).toBeVisible()
    await page.getByRole('button', { name: /send the brief/i }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: /send the brief/i })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
  })
}
