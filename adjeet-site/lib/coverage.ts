/**
 * Single source of truth for the coverage and tenure claims.
 *
 * These numbers used to be typed by hand in nine places and had drifted into
 * four different answers: "12 districts" in the hero, About, Portfolio and the
 * mobile nav; "12+ districts" on Contact; "15+ districts" in the root metadata,
 * the og:description and the chatbot's system prompt; and an areaServed in the
 * JSON-LD naming only five. A buyer comparing fabricators reads that as
 * carelessness, and Google reads the smallest number.
 */

/** The year the workshop opened. Everything about tenure derives from this. */
export const FOUNDED_YEAR = 1990

/**
 * Years in business, as stated in copy.
 *
 * Deliberately a literal rather than `new Date().getFullYear() - FOUNDED_YEAR`:
 * this value is read by client components, so computing it at runtime would
 * make the server and client disagree across a New Year boundary and trip
 * hydration. `tests/unit/lib/coverage.test.ts` fails as soon as this drifts
 * from the true elapsed years, which turns the yearly bump into a caught test
 * rather than silent rot.
 */
export const YEARS_ACTIVE = 36

/**
 * Districts and areas the installation vans cover, in the order the coverage
 * board lists them. This is the checkable claim: it is what renders on the
 * page and what goes into `areaServed` in the LocalBusiness JSON-LD.
 */
export const COVERAGE_AREAS = [
  { name: 'Siliguri', hq: true },
  { name: 'Darjeeling' },
  { name: 'Jalpaiguri' },
  { name: 'Cooch Behar' },
  { name: 'Alipurduar' },
  { name: 'Kalimpong' },
  { name: 'Malda' },
  { name: 'North Dinajpur' },
  { name: 'South Dinajpur' },
  { name: 'The Dooars' },
] as const

/**
 * The number used in copy ("Serving 10 districts").
 *
 * Confirmed by the owner on 2026-09-05: 10, matching COVERAGE_AREAS exactly,
 * so every claim on the site is backed by a place the coverage board names.
 * If the van routes grow, add the area to COVERAGE_AREAS and this follows.
 */
export const DISTRICTS_SERVED = COVERAGE_AREAS.length
