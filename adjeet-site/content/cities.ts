export const CITY_SLUGS = ['siliguri', 'jalpaiguri', 'cooch-behar', 'darjeeling', 'malda'] as const

export type CitySlug = (typeof CITY_SLUGS)[number]
