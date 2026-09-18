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
  { name: 'Siliguri', hq: true, lat: 26.7271, lon: 88.3953 },
  { name: 'Darjeeling', lat: 27.0360, lon: 88.2627 },
  { name: 'Jalpaiguri', lat: 26.5435, lon: 88.7205 },
  { name: 'Cooch Behar', lat: 26.3452, lon: 89.4491 },
  { name: 'Alipurduar', lat: 26.4919, lon: 89.5271 },
  { name: 'Kalimpong', lat: 27.0670, lon: 88.4740 },
  { name: 'Malda', lat: 25.0108, lon: 88.1433 },
  // The two Dinajpur districts are plotted at their headquarters towns,
  // Raiganj and Balurghat, because a district has no single point.
  { name: 'North Dinajpur', lat: 25.6185, lon: 88.1246 },
  { name: 'South Dinajpur', lat: 25.2200, lon: 88.7794 },
  { name: 'The Dooars', lat: 26.8500, lon: 89.0000 },
  // The 2025 company profile sells "North Bengal & Sikkim", with installs
  // photographed in Gangtok and Rangpo. Plotted at Gangtok.
  { name: 'Sikkim', lat: 27.3314, lon: 88.6138 },
] as const

/** The workshop. The map measures every distance and reach ring from here. */
export const COVERAGE_BASE = COVERAGE_AREAS[0]

/**
 * Compatibility export for legacy modules. New user-facing copy should use
 * the named coverage list, because it mixes cities, districts and a region.
 */
export const DISTRICTS_SERVED = COVERAGE_AREAS.length
