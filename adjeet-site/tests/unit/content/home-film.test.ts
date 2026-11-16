// @vitest-environment node
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import {
  BRANDS, BRIEF, CHAPTERS, FINALE, HILLS, JUNCTION, MALDA_BOARDS, MALDA_DAYS, ROAD, WALL_DESKTOP_MAX, WALL_LOGOS, WALL_PHONE_MAX,
  WORK, WORK_PICKS, WORKSHOP_CHAPTER, FILM_SOURCES, SKIP_LABEL, DEFAULT_SHOP_NAME, wallCompanies, workPicks,
} from '@/content/home-film'
import {
  ALSO_SERVICES, BRAND_TENURES, COMPANIES_SERVED, CREW_NETWORK, GPS_PHOTO_LINE, JOB_DAYS, JOB_DAYS_CAPTION, MALDA_STORY,
  VEHICLES, WORKSHOP, brandTenureLines, jobDaysLabel,
} from '@/content/company-figures'
import { getPhotoById, photos } from '@/content/gallery'
import { photoPlace } from '@/content/photo-places'
import { SERVICE_SLUGS, getServiceBySlug } from '@/content/services'
import { SERVICE_LINK_LABELS } from '@/content/site-links'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { DESK_WALL, PHONE_WALL, workBeats, workCaption } from '@/components/film/FilmWork'

/**
 * The home film's words and data (content/home-film.ts). Every figure traces
 * to content/company-figures.ts, every photograph and caption to its gallery
 * record, and nothing breaks the house rules.
 */

const ROOT = path.resolve('.')

/** Every string the film shows, from its content file. */
function filmStrings(): string[] {
  const out: string[] = []
  const walk = (value: unknown) => {
    if (typeof value === 'string') out.push(value)
    else if (typeof value === 'function') walk((value as () => unknown)())
    else if (Array.isArray(value)) value.forEach(walk)
    else if (value && typeof value === 'object') Object.values(value).forEach(walk)
  }
  walk([CHAPTERS, BRANDS, WORK, wallCompanies().map(company => company.name), BRIEF, WORKSHOP_CHAPTER, ROAD, HILLS, JUNCTION, FINALE, SKIP_LABEL, DEFAULT_SHOP_NAME])
  return out
}

const BANNED = /\b(solutions?|end-to-end|seamless(ly)?|unforgettable|experience|elevate[sd]?|transform(s|ed|ing)?|cutting-edge|one-stop|passionate)\b|24\/7/i

describe('the film follows the storyboard', () => {
  it('has the nine chapters, proof first, with one heading each and the storyboard lines', () => {
    expect(CHAPTERS.map(chapter => chapter.id)).toEqual(['hero', 'brands', 'work', 'brief', 'workshop', 'road', 'hills', 'junction', 'finale'])
    expect(CHAPTERS.map(chapter => chapter.title)).toEqual([
      'Advertising that gets you noticed.', 'Brands stay for years.', 'Seen on real streets.', 'It starts with a photo.', 'Made in our own workshop.',
      'Then it goes out on the road.', 'From the plains to the hills.', 'Shopfronts, walls, vehicles, events.', 'Your name is next.',
    ])
    // Each chapter is its pinned length plus one screen. storyboard-v2 asks for 14 or fewer once the
    // scroll controller lets the other chapters shorten; until then the bound is 16.5
    // (the work wall needs about 2.8 screens to rise at no more than one and a half times the scroll).
    expect(CHAPTERS.reduce((sum, chapter) => sum + chapter.len, 0) + 1).toBeLessThanOrEqual(16.5)
    for (const chapter of CHAPTERS) {
      expect(chapter.rest, chapter.id).toBeGreaterThanOrEqual(0)
      expect(chapter.rest, chapter.id).toBeLessThanOrEqual(1)
      // The controller's stops are p values, rising, inside the chapter.
      const stops = (chapter.stops ?? '').split(' ').filter(Boolean).map(Number)
      for (const stop of stops) expect(stop > 0 && stop < 1, `${chapter.id} ${stop}`).toBe(true)
      expect([...stops].sort((a, b) => a - b)).toEqual(stops)
    }
    expect(CHAPTERS.find(chapter => chapter.id === 'brands')?.stops).toBe('.5')
  })

  it('uses only the house wording: no banned words, no dashes, no question headings', () => {
    for (const text of filmStrings()) {
      expect(text.match(BANNED)?.[0], text).toBeUndefined()
      expect(text, text).not.toMatch(/[–—]/)
      expect(text, text).not.toMatch(/sign ?board makers?|signage company/i)
      expect(text, text).not.toMatch(/₹|\bRs\.? ?\d|\bINR\b|1985|Sylvan|UltraTech|24 hours|same day|site visit/i)
    }
    for (const chapter of CHAPTERS) expect(chapter.title).not.toMatch(/\?/)
  })

  it('names a distinct WhatsApp source per chapter action', () => {
    const sources = Object.values(FILM_SOURCES)
    expect(new Set(sources).size).toBe(sources.length)
    for (const source of sources) expect(source).toMatch(/^film-/)
  })
})

describe('every figure traces to content/company-figures.ts', () => {
  it('the job times are the approved five, captioned "Days from the order."', () => {
    expect(WORKSHOP_CHAPTER.caption).toBe(JOB_DAYS_CAPTION)
    expect(WORKSHOP_CHAPTER.times.map(time => time.line)).toEqual(JOB_DAYS.map(job => `${job.label}. ${jobDaysLabel(job.slug)}.`))
    expect(WORKSHOP_CHAPTER.times.map(time => time.line)).toEqual([
      'Glow sign boards. 1 to 3 days.', 'F-pole sign boards. 1 to 3 days.', 'In-shop branding. 1 to 3 days.', 'Wall painting. 2 to 5 days.', 'LED boards. 3 to 5 days.',
    ])
    expect(WORKSHOP_CHAPTER.line).toBe(`${WORKSHOP.area} at ${WORKSHOP.place}.`)
  })

  it('the crew, the vehicles and the Malda job read from their approved wording', () => {
    expect(ROAD.line).toBe('A crew network of 300 fitters and painters. 15 to 20 vehicles.')
    expect(ROAD.line.toLowerCase()).toContain(CREW_NETWORK.line)
    expect(ROAD.line).toContain(VEHICLES.line)
    expect(ROAD.story).toBe(MALDA_STORY)
    expect(MALDA_STORY).toContain(`needed ${MALDA_BOARDS} glow sign boards`)
    expect(MALDA_STORY).toContain(`finished on day ${MALDA_DAYS}.`)
    expect(ROAD.hold).toBe(`${MALDA_BOARDS} boards. Day ${MALDA_DAYS}.`)
  })

  it('the proof figures are the company figures', () => {
    expect(`${BRANDS.companies.value} ${BRANDS.companies.label}`).toBe(COMPANIES_SERVED)
    expect(WORK.gps).toBe(GPS_PHOTO_LINE)
    const now = new Date('2026-11-16T12:00:00Z')
    expect(BRANDS.years(now)).toEqual(brandTenureLines(now))
  })

  it('no number in the film is typed outside the figures, except chapter timings', () => {
    const allowed = new Set([
      ...[COMPANIES_SERVED, MALDA_STORY, CREW_NETWORK.line, VEHICLES.line, WORKSHOP.area, GPS_PHOTO_LINE].flatMap(text => text.match(/\d[\d,]*/g) ?? []),
      ...JOB_DAYS.flatMap(job => [String(job.min), String(job.max)]),
      ...brandTenureLines().flatMap(line => line.match(/\d+/g) ?? []),
    ])
    const numbers = [BRIEF, WORKSHOP_CHAPTER, ROAD, HILLS, JUNCTION, FINALE, WORK, { ...BRANDS, years: undefined }, CHAPTERS.map(chapter => chapter.title)]
      .flatMap(value => JSON.stringify(value).match(/(?<![\w-])\d[\d,]*(?![\w-])/g) ?? [])
    // CHAPTERS' own len/rest/still are timings, read through the JSON of titles only above.
    for (const number of numbers) expect(allowed.has(number), number).toBe(true)
  })
})

describe('places and services come from their records', () => {
  it('names every coverage place once, in the storyboard order, each the same', () => {
    expect([...HILLS.places]).toEqual(['Malda', 'South Dinajpur', 'North Dinajpur', 'Cooch Behar', 'Alipurduar', 'Jalpaiguri', 'The Dooars', 'Siliguri', 'Kalimpong', 'Darjeeling', 'Sikkim'])
    expect([...HILLS.places].sort()).toEqual(COVERAGE_AREAS.map(area => area.name).sort())
    expect(HILLS.link.href).toBe('/areas')
  })

  it('links all ten services by their site labels, and names the three without pages as text', () => {
    const linked = JUNCTION.trades.filter(trade => trade.href)
    expect(linked.map(trade => trade.href)).toEqual(SERVICE_SLUGS.map(slug => `/services/${slug}`))
    expect(linked.map(trade => trade.label)).toEqual(SERVICE_SLUGS.map(slug => SERVICE_LINK_LABELS[slug]))
    expect(JUNCTION.trades.filter(trade => !trade.href).map(trade => trade.label)).toEqual([...ALSO_SERVICES])
    for (const surface of JUNCTION.surfaces) {
      expect(JUNCTION.trades.some(trade => trade.label === surface.label && trade.href === surface.href), surface.label).toBe(true)
    }
  })
})

describe('the brands wall', () => {
  const tenure = BRAND_TENURES.map(entry => entry.brand as string)
  const clients = new Set(photos.map(photo => photo.client))

  it('shows only companies the repo records: tenure brands first, then gallery clients by photograph count', () => {
    const wall = wallCompanies()
    expect(wall.length).toBeLessThanOrEqual(WALL_DESKTOP_MAX)
    expect(WALL_PHONE_MAX).toBe(15)
    expect(wall.slice(0, tenure.length).map(company => company.name)).toEqual(tenure)
    for (const company of wall) expect(tenure.includes(company.name) || clients.has(company.name), company.name).toBe(true)
    const rest = wall.slice(tenure.length)
    for (let i = 1; i < rest.length; i++) expect(rest[i - 1].photos, rest[i].name).toBeGreaterThanOrEqual(rest[i].photos)
    for (const company of wall) expect(company.photos).toBe(photos.filter(photo => photo.client === company.name).length)
    // Lloyd and Shyam Steel stay on the wall for their tenures.
    expect(wall.map(company => company.name)).toEqual(expect.arrayContaining(['Lloyd', 'Shyam Steel']))
    for (const company of wall) {
      const recorded = BRAND_TENURES.find(entry => entry.brand === company.name)
      expect(company.since, company.name).toBe(recorded?.since)
    }
  })

  it('prints a logo only from a clean file wide enough for the board, at its own pixel size', async () => {
    for (const [name, logo] of Object.entries(WALL_LOGOS)) {
      expect(tenure.includes(name) || clients.has(name), name).toBe(true)
      const meta = await sharp(path.join(ROOT, 'public', logo.src)).metadata()
      expect([meta.width, meta.height], name).toEqual([logo.width, logo.height])
      // The board's printed area at 2x on a phone.
      expect(logo.width, name).toBeGreaterThanOrEqual(192)
      // Never the Adani group mark for Ambuja or ACC.
      expect(logo.src, name).not.toMatch(/adani/)
    }
  })
})

describe('the real photographs', () => {
  it('are gallery records, in the curated order, 12 to 16 of them, none skipped', () => {
    const { shown, skipped } = workPicks()
    expect(skipped).toEqual([])
    expect(shown.length).toBeGreaterThanOrEqual(12)
    expect(shown.length).toBeLessThanOrEqual(16)
    expect(shown.map(pick => pick.id)).toEqual(WORK_PICKS.map(pick => pick.id))
    expect(new Set(WORK_PICKS.map(pick => pick.id)).size).toBe(WORK_PICKS.length)
    // Night pictures lead; the one with a readable GPS stamp closes, beside the GPS line.
    expect(WORK_PICKS.slice(0, 3).map(pick => pick.id)).toEqual(['star-cement-137', 'tanyamakeovers-154', 'anchor-by-panasonic-106'])
    expect(WORK_PICKS[WORK_PICKS.length - 1].id).toBe('star-cement-132')
    expect(WORK_PICKS.map(pick => pick.id)).not.toContain('havells-015')
  })

  it('carry the pixel size of their file, so none is drawn larger', async () => {
    for (const pick of WORK_PICKS) {
      const photo = getPhotoById(pick.id)
      const meta = await sharp(path.join(ROOT, 'public', photo.src)).metadata()
      expect([meta.width, meta.height], pick.id).toEqual([pick.width, pick.height])
    }
  })

  it('are captioned only with what the gallery records', () => {
    for (const pick of WORK_PICKS) {
      const photo = getPhotoById(pick.id)
      const caption = workCaption(photo)
      const place = photoPlace(photo)
      const expected = [photo.client, getServiceBySlug(photo.service)!.name]
      if (place && photo.year) expected.push(`${place}, ${photo.year}`)
      else if (place) expected.push(place)
      else if (photo.year) expected.push(String(photo.year))
      expect(caption, pick.id).toEqual(expected)
    }
    // Places are claimed only where recorded.
    expect(workCaption(getPhotoById('star-cement-137'))).toEqual(['Star Cement', 'Vehicle Branding'])
  })

  it('switch on in order as the wall rises, on a phone and on a desktop', () => {
    for (const model of [PHONE_WALL, DESK_WALL]) {
      const wall = workBeats(WORK_PICKS.slice(0, -1), model)
      expect(wall).toHaveLength(WORK_PICKS.length - 1)
      for (let i = 1; i < wall.length; i++) expect(wall[i]).toBeGreaterThanOrEqual(wall[i - 1])
      for (const at of wall) expect(at >= 0 && at < 0.8).toBe(true)
      expect(wall[0]).toBe(0)
    }
  })
})

describe('scene art', () => {
  it('every scene image in the film says it is a visualisation, and no photograph sits on a drawn surface', () => {
    const dir = path.join(ROOT, 'components', 'film')
    const sources = fs.readdirSync(dir).filter(file => file.endsWith('.tsx')).map(file => fs.readFileSync(path.join(dir, file), 'utf8'))
    const alts = sources.flatMap(source => [...source.matchAll(/alt="([^"]*)"/g), ...source.matchAll(/const ALT = '([^']*)'/g)].map(match => match[1]))
    for (const alt of alts) expect(alt === '' || alt.startsWith('Visualisation:'), alt).toBe(true)
    expect(sources.join('\n')).not.toMatch(/images\/work/)
  })
})
