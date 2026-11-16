import { describe, expect, it } from 'vitest'
import {
  ALSO_SERVICES, BRAND_TENURES, COMPANIES_SERVED, CREW_NETWORK, GPS_PHOTO_LINE, HOARDINGS_ON_REQUEST, JOB_DAYS, JOB_DAYS_CAPTION, MALDA_STORY,
  VEHICLES, WORKSHOP, brandTenureLines, jobDaysLabel, yearsWith,
} from '@/content/company-figures'
import { getServiceBySlug } from '@/content/services'

// The owner approved exactly these figures and wordings on 16 November 2026.
describe('company figures', () => {
  it('keeps the approved wordings', () => {
    expect(COMPANIES_SERVED).toBe('200+ companies since 1990')
    expect(WORKSHOP).toEqual({ area: '7,200 sq ft', place: 'Patiram Jote, Siliguri' })
    expect(CREW_NETWORK.line).toBe('a crew network of 300 fitters and painters')
    expect(CREW_NETWORK.line).not.toMatch(/staff|team|employ/i)
    expect(VEHICLES.line).toBe('15 to 20 vehicles')
    expect(GPS_PHOTO_LINE).toBe('Every installation is photographed with a GPS stamp: place, date and time.')
    expect(MALDA_STORY).toBe('In 2025 Star Cement needed 100 glow sign boards across Malda in one week. That is normally 20 to 25 days of work. We put extra crews and vehicles on it and finished on day 7.')
    expect(JOB_DAYS_CAPTION).toBe('Days from the order.')
    expect([...ALSO_SERVICES]).toEqual(['Exhibitions and dealer meets', 'Activations and road shows'])
    expect(HOARDINGS_ON_REQUEST).toBe('Hoardings are taken up on request.')
  })

  it('computes years with each brand from its start year, so they never go stale', () => {
    const nov2026 = new Date('2026-11-16T12:00:00Z')
    expect(BRAND_TENURES.map(({ brand, since }) => [brand, since])).toEqual([
      ['Havells', 2010], ['Lloyd', 2011], ['Shyam Steel', 2014], ['Star Cement', 2019], ['Anchor by Panasonic', 2021],
    ])
    expect(brandTenureLines(nov2026)).toEqual([
      '16 years with Havells', '15 years with Lloyd', '12 years with Shyam Steel', '7 years with Star Cement', '5 years with Anchor by Panasonic',
    ])
    expect(yearsWith(2010, new Date('2030-06-01T00:00:00Z'))).toBe(20)
    expect(yearsWith(2030, nov2026)).toBe(0)
  })

  it('gives the five approved job times and feeds them to the service records', () => {
    expect(JOB_DAYS.map(job => [job.slug, job.min, job.max])).toEqual([
      ['glow-sign-boards', 1, 3], ['f-pole-installation', 1, 3], ['in-shop-branding', 1, 3], ['wall-painting', 2, 5], ['acp-led-signage', 3, 5],
    ])
    for (const job of JOB_DAYS) {
      expect(jobDaysLabel(job.slug)).toBe(`${job.min} to ${job.max} days`)
      expect(getServiceBySlug(job.slug)!.turnaround, job.slug).toBe(jobDaysLabel(job.slug))
    }
    expect(jobDaysLabel('flex-printing')).toBeUndefined()
  })
})
