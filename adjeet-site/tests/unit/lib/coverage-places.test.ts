import { describe, it, expect } from 'vitest'
import {
  COVERAGE_PLACES,
  REACH_RINGS_KM,
  distanceFromBase,
  leadCityForArea,
} from '@/lib/coverage-places'
import { COVERAGE_AREAS, COVERAGE_BASE } from '@/lib/coverage'
import { COVERAGE_CITIES } from '@/lib/lead-schema'

describe('coverage places', () => {
  it('plots every coverage area', () => {
    expect(COVERAGE_PLACES).toHaveLength(COVERAGE_AREAS.length)
    for (const place of COVERAGE_PLACES) {
      expect(Number.isFinite(place.lat)).toBe(true)
      expect(Number.isFinite(place.lon)).toBe(true)
    }
  })

  // The map deliberately says the same thing about every place. If a field ever
  // appears here that ranks one area above another, the boards stop reading as
  // "we cover all of these" and start reading as a league table of past work.
  it('carries nothing that would grade one place against another', () => {
    for (const place of COVERAGE_PLACES) {
      expect(Object.keys(place).sort()).toEqual(
        ['distanceKm', 'isBase', 'lat', 'leadCity', 'lon', 'name'],
      )
    }
  })

  it('marks exactly one place as the workshop', () => {
    const base = COVERAGE_PLACES.filter(place => place.isBase)
    expect(base).toHaveLength(1)
    expect(base[0].name).toBe('Siliguri')
    expect(base[0].distanceKm).toBe(0)
  })

  it('measures distance from the workshop, not from nothing', () => {
    // Siliguri to Cooch Behar is a little over 100km on the ground.
    const coochBehar = COVERAGE_PLACES.find(place => place.name === 'Cooch Behar')!
    expect(coochBehar.distanceKm).toBeGreaterThan(90)
    expect(coochBehar.distanceKm).toBeLessThan(130)

    expect(distanceFromBase(COVERAGE_BASE.lat, COVERAGE_BASE.lon)).toBe(0)
  })

  it('keeps every place inside the outermost reach ring', () => {
    const outer = REACH_RINGS_KM[REACH_RINGS_KM.length - 1]
    for (const place of COVERAGE_PLACES) {
      expect(
        place.distanceKm,
        `${place.name} is ${place.distanceKm}km out, past the ${outer}km ring the map draws`,
      ).toBeLessThanOrEqual(outer)
    }
  })

  it('draws its rings in ascending order', () => {
    const sorted = [...REACH_RINGS_KM].sort((a, b) => a - b)
    expect([...REACH_RINGS_KM]).toEqual(sorted)
  })

  // Every quote button sends a city straight into a Zod enum. An unmapped area
  // would be rejected after the visitor had already filled the form in.
  it('maps every area to a city the lead form accepts', () => {
    for (const area of COVERAGE_AREAS) {
      expect(COVERAGE_CITIES).toContain(leadCityForArea(area.name))
    }
    expect(leadCityForArea('Nowhere')).toBe('Other')
  })
})
