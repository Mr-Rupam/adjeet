import { test, expect } from '@playwright/test'
import { JOB_DAYS, JOB_DAYS_CAPTION } from '../../content/company-figures'

// /for-brands, the credentials page for brand and trade marketing teams.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('adjeet-consent', 'declined')
    localStorage.setItem('adjeet-theme', 'light')
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
  })
})

test('a phone sees the profile action and real brand work in the first screen, with no layout shift', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/for-brands')
  const profile = page.getByRole('link', { name: 'Ask for the company profile' }).first()
  await expect(profile).toBeInViewport()
  await expect(profile).toHaveAttribute('href', /wa\.me/)
  const lead = page.locator('.page-masthead figure img').first()
  await expect(lead).toBeInViewport()
  await expect(lead).toHaveJSProperty('complete', true)

  const scroll = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  expect(scroll).toBe(0)

  // Walk the page so every image and reveal has run, then read the shift.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) }
  })
  const shift = await page.evaluate(() => new Promise<number>(resolve => {
    let total = 0
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) total += entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
    setTimeout(() => resolve(total), 300)
  }))
  expect(shift).toBeLessThan(0.01)
})

test('the job days read as a table with the trades, the day scale and the range', async ({ page }) => {
  await page.goto('/for-brands')
  const table = page.getByRole('table', { name: JOB_DAYS_CAPTION })
  await expect(table).toBeVisible()
  for (const job of JOB_DAYS) {
    const row = table.getByRole('row', { name: new RegExp(job.label) })
    await expect(row).toContainText(`${job.min} to ${job.max} days`)
  }
  await expect(table.getByRole('columnheader', { name: 'Day 5' })).toBeAttached()
})
