import { describe, it, expect } from 'vitest'
import { programmaticPages, CITY_LABELS, type ProgrammaticCity } from '@/content/programmatic'

// `relatedCities` is the only way `rotateFrom` is observable. The rotation is
// not cosmetic: plain declared order would put Gangtok last on every page, so
// it would never survive the page's top-three cut and the two Sikkim pages
// would receive no lateral links at all.
const CITY_ORDER = Object.keys(CITY_LABELS) as ProgrammaticCity[]

describe('regional page siblings', () => {
  it('offers every other city exactly once, never itself', () => {
    for (const page of programmaticPages) {
      expect(page.relatedCities, page.slug).toHaveLength(CITY_ORDER.length - 1)
      expect(new Set(page.relatedCities).size, page.slug).toBe(page.relatedCities.length)
      expect(page.relatedCities, page.slug).not.toContain(page.city)
      for (const city of page.relatedCities) expect(CITY_ORDER, page.slug).toContain(city)
    }
  })

  // Read as a ring, the page's own city followed by its siblings must walk the
  // declared order one step at a time and wrap back round to where it started.
  // This is what catches an off-by-one in the slice, and it is the only check
  // that exercises the wrap for the last-declared city (Gangtok) and for the
  // first (Siliguri, which wraps only at the end of its own list).
  it('reads the declared order onwards from its own city and wraps', () => {
    for (const page of programmaticPages) {
      const ring = [page.city, ...page.relatedCities]
      expect(ring, page.slug).toHaveLength(CITY_ORDER.length)
      for (let i = 0; i < ring.length; i++) {
        const nextDeclared = CITY_ORDER[(CITY_ORDER.indexOf(ring[i]) + 1) % CITY_ORDER.length]
        expect(ring[(i + 1) % ring.length], `${page.slug} after ${ring[i]}`).toBe(nextDeclared)
      }
    }
  })

  // The templated `body` paragraph was identical on all 27 pages. It is gone,
  // and the JSON-LD description now reads `localBrief`. A reintroduced `body`
  // would quietly bring back duplicate copy across every regional page.
  it('carries a prose trade name and no templated body paragraph', () => {
    for (const page of programmaticPages) {
      expect(page, page.slug).not.toHaveProperty('body')
      expect(page.localBrief.trim().length, page.slug).toBeGreaterThan(80)
      expect(page.work, page.slug).toBeTruthy()
    }

    // `work` exists so running prose can name the trade without lowercasing
    // `service.name`, which turns "ACP & LED Signage" into "acp & led signage"
    // and "F-Pole Sign" into "f-pole sign" inside a 40px display heading.
    const byService = new Map(programmaticPages.map(page => [page.service, page.work]))
    expect(byService.get('acp-led-signage')).toBe('ACP and LED signage')
    expect(byService.get('f-pole-installation')).toBe('F-pole signs')
    expect(byService.get('glow-sign-boards')).toBe('glow sign boards')
    for (const work of byService.values()) expect(work).not.toContain('&')
  })
})
