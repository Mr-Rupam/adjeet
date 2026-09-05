import { describe, it, expect } from 'vitest'
import {
  FOUNDED_YEAR,
  YEARS_ACTIVE,
  COVERAGE_AREAS,
  DISTRICTS_SERVED,
} from '@/lib/coverage'

describe('coverage constants', () => {
  // YEARS_ACTIVE is a literal so client and server cannot disagree across a
  // New Year boundary. This is the alarm that makes the yearly bump visible:
  // when it fires, update YEARS_ACTIVE in lib/coverage.ts.
  it('YEARS_ACTIVE still matches the real elapsed years since founding', () => {
    const actual = new Date().getFullYear() - FOUNDED_YEAR
    expect(
      YEARS_ACTIVE,
      `YEARS_ACTIVE is ${YEARS_ACTIVE} but ${actual} years have passed since ${FOUNDED_YEAR}. Bump it in lib/coverage.ts.`,
    ).toBe(actual)
  })

  it('every coverage area has a name and exactly one is the HQ', () => {
    for (const area of COVERAGE_AREAS) expect(area.name).toBeTruthy()
    const hqs = COVERAGE_AREAS.filter(a => 'hq' in a && a.hq)
    expect(hqs).toHaveLength(1)
    expect(hqs[0].name).toBe('Siliguri')
  })

  it('coverage area names are unique', () => {
    const names = COVERAGE_AREAS.map(a => a.name)
    expect(new Set(names).size).toBe(names.length)
  })

  // The copy must never claim more districts than the site is willing to name
  // by more than a token amount — that gap is what made the old numbers read
  // as invented. If this fires, either name the missing areas or lower the claim.
  it('the districts claim stays within reach of the named coverage areas', () => {
    expect(DISTRICTS_SERVED).toBeGreaterThanOrEqual(COVERAGE_AREAS.length)
    expect(DISTRICTS_SERVED - COVERAGE_AREAS.length).toBeLessThanOrEqual(2)
  })
})
