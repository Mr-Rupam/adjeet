/**
 * Single source of truth for the coverage and tenure claims.
 *
 * Areas are named individually rather than summarized as a district count.
 * The list deliberately includes cities, districts and a region, so a single
 * administrative label would be misleading.
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
 * Places and areas the installation vans cover, in the order the coverage
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
 * Compatibility export for legacy modules. New user-facing copy should use
 * the named coverage list, because it mixes cities, districts and a region.
 */
export const DISTRICTS_SERVED = COVERAGE_AREAS.length
