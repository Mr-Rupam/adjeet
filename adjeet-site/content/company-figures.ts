import { FOUNDED_YEAR } from '@/lib/coverage'
import type { ServiceSlug } from '@/content/services'

/**
 * The company's published figures, in the owner's approved wording
 * (16 November 2026). This file is the single source: a page or component
 * reads a figure from here and never types one in.
 *
 * Not here, and never on any page: how many clients AD JEET has today, prices
 * or rupee figures, reply-time or site-visit promises, and job times for trades
 * this file does not list.
 */

/** A running total, so it does not go stale. */
export const COMPANIES_SERVED = `200+ companies since ${FOUNDED_YEAR}`

/** Brands and the year AD JEET began working with each. */
export const BRAND_TENURES = [
  { brand: 'Havells', since: 2010 },
  { brand: 'Lloyd', since: 2011 },
  { brand: 'Shyam Steel', since: 2014 },
  { brand: 'Star Cement', since: 2019 },
  { brand: 'Anchor by Panasonic', since: 2021 },
] as const

/** Whole years with a brand, counted from its start year so the number never goes stale. */
export function yearsWith(since: number, now: Date = new Date()): number {
  return Math.max(0, now.getFullYear() - since)
}

/** "16 years with Havells", one per brand, in the order above. */
export function brandTenureLines(now: Date = new Date()): string[] {
  return BRAND_TENURES.map(({ brand, since }) => `${yearsWith(since, now)} years with ${brand}`)
}

export const WORKSHOP ={ area: '7,200 sq ft', place: 'Patiram Jote, Siliguri' } as const

/** A network of fitters and painters, not employees: never "staff" or "team of 300". */
export const CREW_NETWORK = { size: 300, line: 'a crew network of 300 fitters and painters' } as const

export const VEHICLES = { range: '15 to 20', line: '15 to 20 vehicles' } as const

/** Exactly this wording. Beside a photograph it keeps that photograph's own place. */
export const MALDA_STORY =
  'In 2025 Star Cement needed 100 glow sign boards across Malda in one week. That is normally 20 to 25 days of work. We put extra crews and vehicles on it and finished on day 7.'

export const GPS_PHOTO_LINE = 'Every installation is photographed with a GPS stamp: place, date and time.'

/** Job times counted from the order. Trades not listed keep what content/services.ts says. */
export const JOB_DAYS: readonly { slug: ServiceSlug; label: string; min: number; max: number }[] = [
  { slug: 'glow-sign-boards', label: 'Glow sign boards', min: 1, max: 3 },
  { slug: 'f-pole-installation', label: 'F-pole sign boards', min: 1, max: 3 },
  { slug: 'in-shop-branding', label: 'In-shop branding', min: 1, max: 3 },
  { slug: 'wall-painting', label: 'Wall painting', min: 2, max: 5 },
  { slug: 'acp-led-signage', label: 'LED boards', min: 3, max: 5 },
]

export const JOB_DAYS_CAPTION = 'Days from the order.'

/** "1 to 3 days" for a listed trade, or undefined for one this file does not cover. */
export function jobDaysLabel(slug: ServiceSlug): string | undefined {
  const job = JOB_DAYS.find(entry => entry.slug === slug)
  return job ? `${job.min} to ${job.max} days` : undefined
}

/**
 * Work AD JEET also does that has no page or photographs on the site yet
 * (confirmed by the owner on 16 November 2026). Name them where the offer is
 * listed; add no site, size, town, count, client or photograph to them.
 */
export const ALSO_SERVICES = ['Hoardings and billboards', 'Exhibitions and dealer meets', 'Activations and road shows'] as const
