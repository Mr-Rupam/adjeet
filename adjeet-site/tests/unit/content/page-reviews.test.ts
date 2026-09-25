import { describe, expect, it } from 'vitest'
import { SITE_REVIEWED, formatReviewDate, reviewedOn } from '@/content/page-reviews'

describe('page review dates', () => {
  it('is a real ISO date that is not in the future', () => {
    expect(SITE_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(new Date(SITE_REVIEWED).getTime())).toBe(false)
    // A future date would be fake freshness.
    // One day of grace: dates are UTC midnight, and India is 5.5 hours ahead.
    expect(new Date(SITE_REVIEWED).getTime()).toBeLessThanOrEqual(Date.now() + 24 * 60 * 60 * 1000)
  })

  it('uses the site review unless a page has its own date', () => {
    expect(reviewedOn('/services/flex-printing')).toBe(SITE_REVIEWED)
    expect(reviewedOn('/')).toBe('2026-09-25')
  })

  it('prints the date the way the pages show it, on the same day in every time zone', () => {
    expect(formatReviewDate('2026-09-24')).toBe('24 September 2026')
    expect(formatReviewDate('2026-01-01')).toBe('1 January 2026')
  })
})
