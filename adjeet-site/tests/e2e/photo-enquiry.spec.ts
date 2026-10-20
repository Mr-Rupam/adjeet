import { expect, test, type Locator } from '@playwright/test'
import { photos } from '../../content/gallery'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
    localStorage.setItem('adjeet-consent', 'declined')
  })
})

/** The prefilled WhatsApp text behind the viewer's action, decoded. */
async function message(link: Locator) {
  return new URL((await link.getAttribute('href'))!).searchParams.get('text') ?? ''
}

const acp = photos.filter(photo => photo.service === 'acp-led-signage')

test('the viewer asks about the photo on screen, through next, previous and a trade filter', async ({ page }) => {
  await page.goto('/portfolio')
  await page.getByRole('group', { name: 'Filter work by trade' }).getByRole('button', { name: 'ACP & LED Signage', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText(acp.length + ' projects')

  await page.getByRole('button', { name: /^View:/ }).nth(1).click()
  const dialog = page.getByRole('dialog', { name: 'Photo viewer' })
  const ask = dialog.getByRole('link', { name: 'Ask about a sign like this' })
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', acp[1].alt)
  await expect(ask).toBeVisible()
  expect(await ask.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
  expect(await ask.getAttribute('target')).toBe('_blank')
  const first = await message(ask)
  expect(first).toMatch(/^Hi AD JEET, I am interested in a sign like this example: /)
  expect(first).toContain(`${acp[1].client}, ACP & LED Signage`)
  expect(first).toContain(`(${acp[1].id})`)
  expect(first).toContain('My shop is in ___. Can you help me choose?')

  await page.keyboard.press('ArrowRight')
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', acp[2].alt)
  expect(await message(ask)).toContain(`(${acp[2].id})`)

  await dialog.getByRole('button', { name: 'Previous photo' }).click()
  await dialog.getByRole('button', { name: 'Previous photo' }).click()
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', acp[0].alt)
  expect(await message(ask)).toContain(`(${acp[0].id})`)
})

test('keyboard focus reaches the action, stays in the viewer and returns to the photo', async ({ page }) => {
  await page.goto('/portfolio')
  const project = page.getByRole('button', { name: /^View:/ }).first()
  await project.click()
  const dialog = page.getByRole('dialog', { name: 'Photo viewer' })
  const close = dialog.getByRole('button', { name: 'Close photo viewer' })
  const ask = dialog.getByRole('link', { name: 'Ask about a sign like this' })
  await expect(close).toBeFocused()

  await page.keyboard.press('Shift+Tab')
  await expect(ask).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  for (const name of ['Previous photo', 'Next photo']) {
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name })).toBeFocused()
  }
  await page.keyboard.press('Tab')
  await expect(ask).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(project).toBeFocused()
})

for (const width of [320, 390]) {
  test(`the action fits a ${width}px phone with a full touch target`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.goto('/portfolio')
    await page.getByRole('button', { name: /^View:/ }).first().click()
    const dialog = page.getByRole('dialog', { name: 'Photo viewer' })
    const ask = dialog.getByRole('link', { name: 'Ask about a sign like this' })
    await expect(ask).toBeInViewport({ ratio: 1 })
    const box = (await ask.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(width)
    for (const name of ['Previous photo', 'Next photo', 'Close photo viewer']) {
      const control = (await dialog.getByRole('button', { name }).boundingBox())!
      expect(control.width).toBeGreaterThanOrEqual(44)
      expect(control.height).toBeGreaterThanOrEqual(44)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}

test('a service page gallery carries the same reference into its viewer', async ({ page }) => {
  await page.goto('/services/acp-led-signage')
  const strip = page.getByRole('button', { name: /^View photo:/ }).first()
  await strip.scrollIntoViewIfNeeded()
  const alt = (await strip.getAttribute('aria-label'))!.replace(/^View photo: /, '')
  await strip.click()
  const ask = page.getByRole('dialog', { name: 'Photo viewer' }).getByRole('link', { name: 'Ask about a sign like this' })
  const photo = photos.find(candidate => candidate.alt === alt)!
  expect(await message(ask)).toContain(`(${photo.id})`)
})
