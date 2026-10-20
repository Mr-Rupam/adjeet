export const CITY_SLUGS = ['siliguri', 'jalpaiguri', 'cooch-behar', 'darjeeling', 'malda'] as const

export type CitySlug = (typeof CITY_SLUGS)[number]

/** How each recorded city is written in captions and copy. */
export const CITY_NAMES: Record<CitySlug, string> = {
  siliguri: 'Siliguri',
  jalpaiguri: 'Jalpaiguri',
  'cooch-behar': 'Cooch Behar',
  darjeeling: 'Darjeeling',
  malda: 'Malda',
}
