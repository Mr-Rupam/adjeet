import { test, expect, type Page } from '@playwright/test'
import { programmaticPages, CITY_LABELS, type ProgrammaticPage } from '../../content/programmatic'
import { getServiceBySlug } from '../../content/services'
import { getPhotosByService } from '../../content/gallery'

// The 27 service-area pages rendered by app/(programmatic)/[slug]/page.tsx.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('adjeet-consent', 'declined')
    localStorage.setItem('adjeet-theme', 'light')
  })
})

function firstPageIn(city: ProgrammaticPage['city']): ProgrammaticPage {
  const found = programmaticPages.find(p => p.city === city)
  if (!found) throw new Error(`content/programmatic.ts has no regional page for ${city}`)
  return found
}

/**
 * The outline the page is built to have: the masthead h1, then one h2 per
 * section in source order (gallery, about, FAQ, commission, brief form).
 * The local brief and its "Send us" list lead the page with no heading of
 * their own. The gallery title mirrors the page's choice between photos taken
 * in this city and the trade's photos from elsewhere.
 */
function expectedOutline(regional: ProgrammaticPage): string[] {
  const service = getServiceBySlug(regional.service)!
  const city = CITY_LABELS[regional.city]
  const photographedHere = getPhotosByService(regional.service).some(photo => photo.city === regional.city)
  return [
    `h1: ${regional.headline}`,
    `h2: ${photographedHere ? `${service.name} in ${city}: project photos` : `${service.name}: recent AD JEET work`}`,
    `h2: About ${regional.work}`,
    `h2: ${regional.searchPhrase} in ${city}: questions before you order`,
    `h2: ${service.name} in ${city}.`,
    'h2: Or send the brief here.',
  ]
}

/** Every h1 and h2 in the page content, in document order, as "h2: text". A <br> reads as a space. */
function headingOutline(page: Page): Promise<string[]> {
  return page.locator('#main-content').locator('h1, h2').evaluateAll(headings => headings.map(heading => {
    const copy = heading.cloneNode(true) as HTMLElement
    copy.querySelectorAll('br').forEach(br => br.replaceWith(' '))
    return `${heading.tagName.toLowerCase()}: ${(copy.textContent ?? '').replace(/\s+/g, ' ').trim()}`
  }))
}

test.describe('regional page heading outline', () => {
  // One page with photos of its trade in that city, one Sikkim page without.
  for (const city of ['siliguri', 'gangtok'] as const) {
    const regional = firstPageIn(city)

    test(`${regional.slug}: one h1, the section h2s in order, "Send us" is not a heading`, async ({ page }) => {
      await page.goto('/' + regional.slug)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect.poll(() => headingOutline(page)).toEqual(expectedOutline(regional))

      // "Send us" labels the list beside the brief. It was briefly a 12px h2,
      // an outline peer of the 40px "About" heading.
      await expect(page.locator('.regional-sendus').getByText('Send us', { exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: /^send us/i })).toHaveCount(0)
    })
  }
})

/** How .regional-body arranges its two children, measured in the browser. */
function bodyLayout(page: Page) {
  return page.locator('.regional-body').evaluate(body => {
    const lead = body.querySelector('.regional-lead')!.getBoundingClientRect()
    const sendUs = body.querySelector('.regional-sendus')!.getBoundingClientRect()
    const style = getComputedStyle(body)
    const arrangement =
      sendUs.top >= lead.bottom - 1 && Math.abs(sendUs.left - lead.left) <= 1 ? 'stacked'
      : sendUs.left >= lead.right - 1 && Math.abs(sendUs.top - lead.top) <= 1 ? 'side by side'
      : 'overlapping'
    return {
      arrangement,
      // Resolved track widths in px. Only a grid resolves them: on a flex or
      // block body the property reads back as declared, whatever the layout.
      tracks: style.display.endsWith('grid') && style.gridTemplateColumns !== 'none'
        ? style.gridTemplateColumns.split(' ').map(parseFloat)
        : [],
    }
  })
}

function sidewaysOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

test.describe('regional page body columns', () => {
  // design/fieldwork.css: .regional-body is a flex column by default and a
  // `1.6fr 1fr` grid from @media (min-width:1024px), so 1024 is two columns.
  const regional = firstPageIn('siliguri')

  for (const width of [390, 1023]) {
    test(`${width}px: one column, "Send us" below the brief, no sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/' + regional.slug)
      await page.evaluate(() => document.fonts.ready)
      const layout = await bodyLayout(page)
      expect(layout.arrangement).toBe('stacked')
      expect(layout.tracks.length).toBeLessThan(2)
      expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0)
    })
  }

  for (const width of [1024, 1440]) {
    test(`${width}px: 1.6fr 1fr columns, "Send us" beside the brief, no sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/' + regional.slug)
      await page.evaluate(() => document.fonts.ready)
      const layout = await bodyLayout(page)
      expect(layout.arrangement).toBe('side by side')
      expect(layout.tracks).toHaveLength(2)
      expect(layout.tracks[0] / layout.tracks[1]).toBeCloseTo(1.6, 2)
      expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0)
    })
  }
})
