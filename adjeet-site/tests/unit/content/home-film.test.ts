// @vitest-environment node
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import {
  BRANDS, BRIEF, CHAPTERS, FINALE, HILLS, JUNCTION, MALDA_BOARDS, MALDA_DAYS, MALDA_NORMAL, MALDA_ROWS, ROAD, WALL,
  WORK, WORK_PICKS, WORKSHOP_CHAPTER, FILM_SOURCES, SKIP_LABEL, DEFAULT_SHOP_NAME, isGate, stopP, stopsAttr, tenureLine, workPicks,
} from '@/content/home-film'
import {
  ALSO_SERVICES, BRAND_TENURES, COMPANIES_SERVED, CREW_NETWORK, GPS_PHOTO_LINE, JOB_DAYS, JOB_DAYS_CAPTION, MALDA_STORY,
  VEHICLES, WORKSHOP, brandTenureLines, jobDaysLabel, yearsWith,
} from '@/content/company-figures'
import { getPhotoById } from '@/content/gallery'
import { photoPlace } from '@/content/photo-places'
import { SERVICE_SLUGS, getServiceBySlug } from '@/content/services'
import { SERVICE_LINK_LABELS } from '@/content/site-links'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { DESK_WALL, PHONE_WALL, workBeats, workCaption } from '@/components/film/FilmWork'
import { BRAND_LEDGER } from '@/content/for-brands'
import { WALL_COLS, wallPlaces, wallRows } from '@/components/film/FilmBrands'
import { SURFACE_AT } from '@/components/film/FilmJunction'

/** What the film never names (storyboard v2, section 7a). */
const NOT_PROMOTED = /hoarding|billboard/i

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
  walk([CHAPTERS, BRANDS, WORK, WALL.map(brand => brand.name), BRIEF, WORKSHOP_CHAPTER, ROAD, HILLS, JUNCTION, FINALE, SKIP_LABEL, DEFAULT_SHOP_NAME])
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
    // Each chapter is its pinned length plus one screen. With the scroll driver of storyboard-v2
    // section 3b the chapters are about 1.6 times their first lengths (about one screen of scroll
    // per 1 to 1.5 seconds of motion), so the film is at most 26 screens; tuned by feel from here.
    expect(CHAPTERS.reduce((sum, chapter) => sum + chapter.len, 0) + 1).toBeLessThanOrEqual(26)
    for (const chapter of CHAPTERS) {
      expect(chapter.rest, chapter.id).toBeGreaterThanOrEqual(0)
      expect(chapter.rest, chapter.id).toBeLessThanOrEqual(1)
      // The stepper's stops (stepper-contract.md) are p values, rising, inside the
      // chapter (the hero's is its top); the rest is one of them; a showpiece's own
      // duration stays inside the contract's 4 seconds.
      const stops = chapter.stops.map(stopP)
      for (const stop of stops) expect(stop >= 0 && stop < 1, `${chapter.id} ${stop}`).toBe(true)
      expect([...stops].sort((a, b) => a - b)).toEqual(stops)
      expect(stops, chapter.id).toContain(chapter.rest)
      for (const stop of chapter.stops) if (typeof stop !== 'number') expect(stop.ms ?? 0).toBeLessThanOrEqual(4000)
    }
    // About 23 stops, one a screenful: every frame meant to be read is a stop.
    expect(CHAPTERS.flatMap(chapter => chapter.stops)).toHaveLength(23)
    expect(CHAPTERS.find(chapter => chapter.id === 'work')?.stops).toHaveLength(6)
    expect(CHAPTERS.find(chapter => chapter.id === 'junction')?.stops).toHaveLength(6)
    expect(stopsAttr(CHAPTERS.find(chapter => chapter.id === 'road')?.stops)).toBe('0.14 0.78:3500!')
    // Eight gates, one per chapter after the hero, on the frame that carries its message.
    const gates = CHAPTERS.flatMap(chapter => chapter.stops.filter(isGate).map(stop => `${chapter.id} ${stopP(stop)}`))
    expect(gates).toEqual(['brands 0.5', 'work 0.8', 'brief 0.57', 'workshop 0.66', 'road 0.78', 'hills 0.8', 'junction 0.8', 'finale 0.72'])
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

  it('the Malda beat compares only with the normal time, in the approved words', () => {
    expect([MALDA_BOARDS, MALDA_DAYS, MALDA_NORMAL.min, MALDA_NORMAL.max]).toEqual([100, 7, 20, 25])
    expect(MALDA_STORY).toContain(`normally ${MALDA_NORMAL.min} to ${MALDA_NORMAL.max} days of work.`)
    expect(ROAD.normal).toBe('Normally 20 to 25 days of work.')
    expect(MALDA_STORY.toLowerCase()).toContain(ROAD.normal.toLowerCase())
    // The field is whole rows; nothing beyond what the sentence says.
    expect(MALDA_BOARDS % MALDA_ROWS).toBe(0)
    for (const text of [ROAD.fieldLabel, ROAD.stripLabel, ROAD.normal, ROAD.hold]) {
      expect(text, text).not.toMatch(/saved|faster|quicker|than|guarantee|always|every job/i)
    }
  })

  it('the road declares its stops: the title frame and the hold, a showpiece', () => {
    const road = CHAPTERS.find(entry => entry.id === 'road')!
    expect(road.stops).toEqual([road.rest, { p: 0.78, ms: 3500, gate: true }])
    for (const stop of road.stops.map(stopP)) {
      expect(stop).toBeGreaterThan(0)
      expect(stop).toBeLessThan(1)
    }
  })

  it('the proof figures are the company figures', () => {
    expect(`${BRANDS.companies.value} ${BRANDS.companies.label}`).toBe(COMPANIES_SERVED)
    expect(WORK.gps).toBe(GPS_PHOTO_LINE)
    const now = new Date('2026-11-16T12:00:00Z')
    expect(BRANDS.tenure(now)).toBe(tenureLine(now))
    expect(BRANDS.tenure(now)).toBe('16 years with Havells, 15 with Lloyd, 12 with Shyam Steel, 7 with Star Cement and 5 with Anchor by Panasonic.')
    for (const { since } of BRAND_TENURES) expect(BRANDS.tenure(now)).toContain(`${yearsWith(since, now)}`)
  })

  it('no number in the film is typed outside the figures, except chapter timings', () => {
    const allowed = new Set([
      ...[COMPANIES_SERVED, MALDA_STORY, CREW_NETWORK.line, VEHICLES.line, WORKSHOP.area, GPS_PHOTO_LINE].flatMap(text => text.match(/\d[\d,]*/g) ?? []),
      ...JOB_DAYS.flatMap(job => [String(job.min), String(job.max)]),
      ...brandTenureLines().flatMap(line => line.match(/\d+/g) ?? []),
    ])
    const numbers = [BRIEF, WORKSHOP_CHAPTER, ROAD, HILLS, JUNCTION, FINALE, WORK, { ...BRANDS, tenure: BRANDS.tenure() }, CHAPTERS.map(chapter => chapter.title)]
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

  it('links all ten services by their site labels, and names the other work without pages as text', () => {
    const linked = JUNCTION.trades.filter(trade => trade.href)
    expect(linked.map(trade => trade.href)).toEqual(SERVICE_SLUGS.map(slug => `/services/${slug}`))
    expect(linked.map(trade => trade.label)).toEqual(SERVICE_SLUGS.map(slug => SERVICE_LINK_LABELS[slug]))
    // The site's other work, as recorded, less what the owner does not promote.
    expect(JUNCTION.trades.filter(trade => !trade.href).map(trade => trade.label))
      .toEqual([...ALSO_SERVICES])
    for (const surface of JUNCTION.surfaces) {
      if (!surface) continue
      expect(JUNCTION.trades.some(trade => trade.label === surface.label && trade.href === surface.href), surface.label).toBe(true)
    }
    // Hoardings are not promoted (owner, 16 November 2026).
    expect(JSON.stringify(JUNCTION)).not.toMatch(/hoarding|billboard/i)
  })
})

describe('the brands wall', () => {
  const tenure = BRAND_TENURES.map(entry => entry.brand as string)

  it('is the owner-approved board plus Lloyd: the five tenure brands first, then the board in its order, brands only', () => {
    const board = BRAND_LEDGER.flatMap(row => row.brands.map(brand => (brand.name === 'Anchor' ? 'Anchor by Panasonic' : brand.name)))
    const names = WALL.map(brand => brand.name)
    expect(names).toHaveLength(22)
    expect(new Set(names).size).toBe(names.length)
    expect(names.slice(0, tenure.length)).toEqual(tenure)
    // Every brand on the wall is on the approved board or has a recorded tenure, and every approved brand is on the wall.
    for (const name of names) expect(board.includes(name) || tenure.includes(name), name).toBe(true)
    for (const name of board) expect(names, name).toContain(name)
    // No local outlets: the one in the photographs stays off the wall.
    expect(names).not.toContain('Tanyamakeovers')
  })

  it('prints each logo from its own file, at its pixel size, never the Adani mark for another brand', async () => {
    for (const brand of WALL) {
      if (!brand.logo) continue
      const meta = await sharp(path.join(ROOT, 'public', brand.logo.src)).metadata()
      expect([meta.width, meta.height], brand.name).toEqual([brand.logo.width, brand.logo.height])
      if (brand.name !== 'Adani Cement') expect(brand.logo.src, brand.name).not.toMatch(/adani/)
    }
    // Lettered until a larger file is approved.
    expect(WALL.filter(brand => !brand.logo).map(brand => brand.name)).toEqual(['SRMB'])
  })

  it('lays 22 boards out as deliberate rows: 3 across on a phone, 8, 7 and 7 on a desktop, each short row centred', () => {
    expect(wallRows(22, WALL_COLS.phone)).toEqual([3, 3, 3, 3, 3, 3, 2, 2])
    expect(wallRows(22, WALL_COLS.desk)).toEqual([8, 7, 7])
    for (const cols of [WALL_COLS.phone, WALL_COLS.desk]) {
      const places = wallPlaces(WALL.length, cols)
      expect(places).toHaveLength(WALL.length)
      const keys = places.map(place => `${place.row}:${place.col}`)
      expect(new Set(keys).size).toBe(keys.length)
      for (const place of places) expect(place.col >= 1 && place.col + 1 <= 2 * cols).toBe(true)
    }
  })

  it('the junction lights five surfaces, each naming a service with a page, evenly spaced', () => {
    expect(JUNCTION.surfaces.map(surface => surface.href)).toEqual([
      '/services/glow-sign-boards', '/services/wall-painting', '/services/f-pole-installation',
      '/services/vehicle-branding', '/services/in-shop-branding',
    ])
    expect(JUNCTION.surfaces.map(surface => surface.label)).toEqual(
      ['glow-sign-boards', 'wall-painting', 'f-pole-installation', 'vehicle-branding', 'in-shop-branding'].map(slug => SERVICE_LINK_LABELS[slug as keyof typeof SERVICE_LINK_LABELS]),
    )
    expect(SURFACE_AT).toHaveLength(JUNCTION.surfaces.length)
    const gaps = SURFACE_AT.slice(1).map((at, index) => +(at - SURFACE_AT[index]).toFixed(3))
    expect(new Set(gaps).size, String(gaps)).toBe(1)
  })

  it('the junction declares its scroll controller stops: each surface lit, then the list settled', () => {
    const junction = CHAPTERS.find(chapter => chapter.id === 'junction')!
    expect(junction.stops).toHaveLength(JUNCTION.surfaces.length + 1)
    expect(stopP(junction.stops.at(-1)!)).toBe(junction.rest)
    // Each surface's stop falls after it lights and before the next one does.
    SURFACE_AT.forEach((at, index) => {
      expect(stopP(junction.stops[index]), `surface ${index}`).toBeGreaterThan(at)
      if (index + 1 < SURFACE_AT.length) expect(stopP(junction.stops[index])).toBeLessThan(SURFACE_AT[index + 1])
    })
    for (const stop of junction.stops.map(stopP)) {
      expect(stop).toBeGreaterThan(0)
      expect(stop).toBeLessThan(1)
    }
  })
})

describe('what the film does not show', () => {
  // The owner, 16 November 2026: large roadside display structures are not promoted.
  it('names no hoarding or billboard anywhere in its words or data', () => {
    for (const text of filmStrings()) expect(text, text).not.toMatch(NOT_PROMOTED)
    expect(JSON.stringify(CHAPTERS)).not.toMatch(NOT_PROMOTED)
  })

  it('shows none in its scene art: no alt text or junction class names one', () => {
    const dir = path.join(ROOT, 'components', 'film')
    for (const file of fs.readdirSync(dir).filter(name => name.endsWith('.tsx'))) {
      const source = fs.readFileSync(path.join(dir, file), 'utf8')
      for (const match of source.matchAll(/alt="([^"]*)"/g)) expect(match[1], file).not.toMatch(NOT_PROMOTED)
    }
    expect(fs.readFileSync(path.join(dir, 'FilmJunction.tsx'), 'utf8')).not.toMatch(/hoard|billboard|flood/i)
    expect(fs.readdirSync(path.join(dir, 'art')).filter(name => name.startsWith('junction-'))).toEqual([
      'junction-plain-tall-dark.avif', 'junction-plain-tall-dark.webp', 'junction-plain-tall.avif', 'junction-plain-tall.webp',
      'junction-plain-wide-dark.avif', 'junction-plain-wide-dark.webp', 'junction-plain-wide.avif', 'junction-plain-wide.webp',
    ])
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
