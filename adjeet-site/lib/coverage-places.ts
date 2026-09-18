import { COVERAGE_AREAS, COVERAGE_BASE } from '@/lib/coverage'
import { COVERAGE_CITIES } from '@/lib/lead-schema'

/**
 * The places the coverage map draws, and how far each one is from the workshop.
 *
 * Every area is treated identically here. An earlier version graded the boards
 * by how many gallery photos could be pinned to each place, which put "4
 * projects" next to "on route" and read as a league table of where we have and
 * have not worked. The claim the page actually makes is that these places are
 * all covered, so the map now says exactly that and nothing more.
 *
 * Distance from Siliguri replaces it: true for every place, checkable, and it
 * gives the reach rings on the map something to mean.
 */

/**
 * Coverage areas mapped onto the enquiry form's city list.
 *
 * `COVERAGE_CITIES` in `lib/lead-schema.ts` is a Zod enum, so a value that is
 * not in it fails validation on submit. Areas with no matching option fall back
 * to `Other`, which the form accepts, rather than sending a value that would be
 * rejected after the visitor has filled the rest in.
 */
const AREA_TO_LEAD_CITY: Record<string, (typeof COVERAGE_CITIES)[number]> = {
  'Siliguri': 'Siliguri',
  'Darjeeling': 'Darjeeling',
  'Jalpaiguri': 'Jalpaiguri',
  'Cooch Behar': 'Cooch Behar',
  'Alipurduar': 'Alipurduar',
  'Kalimpong': 'Kalimpong',
  'Malda': 'Malda',
  'Sikkim': 'Gangtok',
  'North Dinajpur': 'Other',
  'South Dinajpur': 'Other',
  'The Dooars': 'Other',
}

/** The enquiry form city to preselect for an area. Always a valid enum value. */
export function leadCityForArea(area: string): (typeof COVERAGE_CITIES)[number] {
  return AREA_TO_LEAD_CITY[area] ?? 'Other'
}

/** Great circle distance in kilometres, rounded to something a person would say. */
export function distanceFromBase(lat: number, lon: number): number {
  const R = 6371
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRad(lat - COVERAGE_BASE.lat)
  const dLon = toRad(lon - COVERAGE_BASE.lon)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(COVERAGE_BASE.lat)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(a)))
}

/**
 * Extra post height for boards that would otherwise hide behind a neighbour,
 * measured in board heights so the flat map and the terrain stay in step.
 *
 * Darjeeling and Kalimpong are 25km apart, Kalimpong sits in front of Sikkim,
 * and Cooch Behar sits almost directly in front of Alipurduar, so at map scale
 * their boards cover each other. Raising one of each pair clears it.
 *
 * Label placement on a real map is always partly by hand: the generated SVG
 * this replaced carried a manual offset per label for exactly the same reason.
 */
export const BOARD_LIFT: Record<string, number> = {
  Kalimpong: 1.15,
  Sikkim: 2.3,
  Alipurduar: 1.25,
  'The Dooars': 0.5,
}

export interface CoveragePlace {
  name: string
  lat: number
  lon: number
  /** The workshop. The only board the map singles out. */
  isBase: boolean
  /** Straight line kilometres from the Siliguri workshop. */
  distanceKm: number
  /** The enquiry form city this place preselects. */
  leadCity: (typeof COVERAGE_CITIES)[number]
}

export const COVERAGE_PLACES: CoveragePlace[] = COVERAGE_AREAS.map(area => ({
  name: area.name,
  lat: area.lat,
  lon: area.lon,
  isBase: 'hq' in area && area.hq === true,
  distanceKm: distanceFromBase(area.lat, area.lon),
  leadCity: leadCityForArea(area.name),
}))

/**
 * Reach rings drawn on both map layers, in kilometres from the workshop.
 *
 * Chosen to bracket the real spread: everything except Malda sits inside 150km,
 * and the outer ring reaches it.
 */
export const REACH_RINGS_KM = [50, 100, 150, 200] as const
