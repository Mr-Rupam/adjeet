import { describe, expect, it } from 'vitest'
import { SITE_REVIEWED, formatReviewDate, newestReview, reviewedOn } from '@/content/page-reviews'

describe('page review dates', () => {
  it('is a real ISO date that is not in the future', () => {
    expect(SITE_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(new Date(SITE_REVIEWED).getTime())).toBe(false)
    // A future date would be fake freshness.
    // One day of grace: dates are UTC midnight, and India is 5.5 hours ahead.
    expect(new Date(SITE_REVIEWED).getTime()).toBeLessThanOrEqual(Date.now() + 24 * 60 * 60 * 1000)
  })

  // 15 November 2026 was a review of the whole site, privacy policy included.
  it('dates every page from the 15 November 2026 site review', () => {
    expect(SITE_REVIEWED).toBe('2026-11-15')
    for (const path of ['/about', '/contact', '/privacy', '/for-brands', '/services/flex-printing', '/areas/cooch-behar']) {
      expect(reviewedOn(path), path).toBe('2026-11-15')
    }
  })

  // The home hero changed on 16 November 2026 (the day and night visualisation).
  it('dates the home page from its hero change', () => {
    expect(reviewedOn('/')).toBe('2026-11-16')
  })

  it('gives summaries the newest review on the site', () => {
    expect(newestReview()).toBe('2026-11-16')
  })

  it('prints the date the way the pages show it, on the same day in every time zone', () => {
    expect(formatReviewDate('2026-09-24')).toBe('24 September 2026')
    expect(formatReviewDate('2026-01-01')).toBe('1 January 2026')
  })
})
