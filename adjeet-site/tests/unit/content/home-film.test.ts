// @vitest-environment node
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import {
  BRIEF, CHAPTERS, FINALE, HILLS, JUNCTION, LEDGER_LOGOS, MALDA_BOARDS, MALDA_DAYS, PROOF, PROOF_PICKS, ROAD,
  WORKSHOP_CHAPTER, FILM_SOURCES, SKIP_LABEL, DEFAULT_SHOP_NAME,
} from '@/content/home-film'
import {
  ALSO_SERVICES, BRAND_TENURES, COMPANIES_SERVED, CREW_NETWORK, GPS_PHOTO_LINE, JOB_DAYS, JOB_DAYS_CAPTION, MALDA_STORY,
  VEHICLES, WORKSHOP, brandTenureLines, jobDaysLabel,
} from '@/content/company-figures'
import { getPhotoById } from '@/content/gallery'
import { photoPlace } from '@/content/photo-places'
import { SERVICE_SLUGS, getServiceBySlug } from '@/content/services'
import { SERVICE_LINK_LABELS } from '@/content/site-links'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { proofCaption } from '@/components/film/FilmProof'
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
  walk([CHAPTERS, BRIEF, WORKSHOP_CHAPTER, ROAD, HILLS, JUNCTION, PROOF, FINALE, SKIP_LABEL, DEFAULT_SHOP_NAME])
  return out
}

const BANNED = /\b(solutions?|end-to-end|seamless(ly)?|unforgettable|experience|elevate[sd]?|transform(s|ed|ing)?|cutting-edge|one-stop|passionate)\b|24\/7/i

describe('the film follows the storyboard', () => {
  it('has the eight chapters, in order, with one heading each and the storyboard lines', () => {
    expect(CHAPTERS.map(chapter => chapter.id)).toEqual(['hero', 'brief', 'workshop', 'road', 'hills', 'junction', 'proof', 'finale'])
    expect(CHAPTERS.map(chapter => chapter.title)).toEqual([
      'Advertising that gets you noticed.', 'It starts with a photo.', 'Made in our own workshop.', 'Then it goes out on the road.',
      'From the plains to the hills.', 'Shopfronts, walls, vehicles, events.', 'Brands stay for years.', 'Your name is next.',
    ])
    // At most 15 screens on a phone (storyboard, section 4): each chapter is its pinned length plus one screen.
    expect(CHAPTERS.reduce((sum, chapter) => sum + chapter.len, 0) + 1).toBeLessThanOrEqual(15)
    for (const chapter of CHAPTERS) {
      expect(chapter.rest, chapter.id).toBeGreaterThanOrEqual(0)
      expect(chapter.rest, chapter.id).toBeLessThanOrEqual(1)
    }
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
    expect(`${PROOF.companies.value} ${PROOF.companies.label}`).toBe(COMPANIES_SERVED)
    expect(PROOF.gps).toBe(GPS_PHOTO_LINE)
    const now = new Date('2026-11-16T12:00:00Z')
    expect(PROOF.years(now)).toEqual(brandTenureLines(now))
  })

  it('no number in the film is typed outside the figures, except chapter timings', () => {
    const allowed = new Set([
      ...[COMPANIES_SERVED, MALDA_STORY, CREW_NETWORK.line, VEHICLES.line, WORKSHOP.area, GPS_PHOTO_LINE].flatMap(text => text.match(/\d[\d,]*/g) ?? []),
      ...JOB_DAYS.flatMap(job => [String(job.min), String(job.max)]),
      ...brandTenureLines().flatMap(line => line.match(/\d+/g) ?? []),
    ])
    const numbers = [BRIEF, WORKSHOP_CHAPTER, ROAD, HILLS, JUNCTION, FINALE, CHAPTERS.map(chapter => chapter.title)]
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
      .toEqual(ALSO_SERVICES.filter(label => !NOT_PROMOTED.test(label)))
    for (const surface of JUNCTION.surfaces) {
      expect(JUNCTION.trades.some(trade => trade.label === surface.label && trade.href === surface.href), surface.label).toBe(true)
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
    expect(junction.stops!.at(-1)).toBe(junction.rest)
    // Each surface's stop falls after it lights and before the next one does.
    SURFACE_AT.forEach((at, index) => {
      expect(junction.stops![index], `surface ${index}`).toBeGreaterThan(at)
      if (index + 1 < SURFACE_AT.length) expect(junction.stops![index]).toBeLessThan(SURFACE_AT[index + 1])
    })
    for (const stop of junction.stops!) {
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

describe('the six real photographs', () => {
  it('are gallery records in the curated order', () => {
    expect(PROOF_PICKS.map(pick => pick.id)).toEqual(['tanyamakeovers-154', 'star-cement-137', 'anchor-by-panasonic-106', 'acc-105', 'havells-120', 'havells-015'])
    for (const pick of PROOF_PICKS) expect(() => getPhotoById(pick.id), pick.id).not.toThrow()
  })

  it('carry the pixel size of their file, so none is drawn larger', async () => {
    for (const pick of PROOF_PICKS) {
      const photo = getPhotoById(pick.id)
      const meta = await sharp(path.join(ROOT, 'public', photo.src)).metadata()
      expect([meta.width, meta.height], pick.id).toEqual([pick.width, pick.height])
    }
  })

  it('are captioned only with what the gallery records', () => {
    for (const pick of PROOF_PICKS) {
      const photo = getPhotoById(pick.id)
      const caption = proofCaption(photo)
      const place = photoPlace(photo)
      const expected = [photo.client, getServiceBySlug(photo.service)!.name]
      if (place && photo.year) expected.push(`${place}, ${photo.year}`)
      else if (place) expected.push(place)
      else if (photo.year) expected.push(String(photo.year))
      expect(caption, pick.id).toEqual(expected)
    }
    // Places are claimed only where recorded.
    expect(proofCaption(getPhotoById('star-cement-137'))).toEqual(['Star Cement', 'Vehicle Branding'])
    expect(proofCaption(getPhotoById('havells-015'))).toEqual(['Havells', 'Glow Sign Boards', 'Jalpaiguri, 2021'])
  })

  it('logos on the ledger are brands with a recorded tenure, at their file size or smaller', async () => {
    const brands = BRAND_TENURES.map(entry => entry.brand as string)
    for (const logo of LEDGER_LOGOS) {
      expect(brands).toContain(logo.brand)
      const meta = await sharp(path.join(ROOT, 'public', logo.src)).metadata()
      expect([meta.width, meta.height], logo.brand).toEqual([logo.width, logo.height])
      // Drawn at most 1.45 times its phone height on a desktop (film.css).
      expect(logo.height1x * 1.45, logo.brand).toBeLessThanOrEqual(logo.height)
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
