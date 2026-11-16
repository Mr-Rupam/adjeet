import type { ServiceSlug } from '@/content/services'
import {
  ALSO_SERVICES,
  BRAND_TENURES,
  COMPANIES_SERVED,
  CREW_NETWORK,
  GPS_PHOTO_LINE,
  VEHICLES,
  WORKSHOP,
  yearsWith,
} from '@/content/company-figures'
import { COVERAGE_AREAS, FOUNDED_YEAR } from '@/lib/coverage'

/**
 * /for-brands: the credentials page for regional, zonal and trade marketing
 * teams (rebuilt 16 November 2026 to the owner's brief: who trusts us, what
 * we run, how big, how we report, how fast, what next).
 *
 * Every figure is read from content/company-figures.ts or lib/coverage.ts and
 * never typed here. Photographs are gallery records and their captions say only
 * what content/gallery.ts records. Brands are named only where the gallery has
 * their photographs or the client logo board carries their logo
 * (tests/unit/app/for-brands-page.test.tsx checks both). No prices, reply
 * times, site visits or client counts for today.
 */

export const FOR_BRANDS_PATH = '/for-brands'

export const FOR_BRANDS_PAGE = {
  title: 'Advertising Agency for Brands in North Bengal & Sikkim',
  description: 'Dealer boards, wall painting, in-shop branding, fleets and Puja gates for brands. Made in Siliguri, fitted across North Bengal and Sikkim.',
  path: FOR_BRANDS_PATH,
}

export const FOR_BRANDS_LEAD =
  `Dealer boards, wall paintings, shop interiors, fleets and Puja gates since ${FOUNDED_YEAR}. Made at our own Siliguri workshop, put up by our own crews.`

/** The gold action: the company profile, sent on WhatsApp. */
export const PROFILE_WHATSAPP_MESSAGE = 'Please send me the AD JEET company profile.'

/** The quiet second action. The brand team edits it before it goes. */
export const FOR_BRANDS_WHATSAPP_MESSAGE =
  'Hi AD JEET, I am on a brand or trade marketing team and want to send an outlet list for a rollout. Can we discuss it?'

/** The opening mosaic: one brand job per trade, the first one preloaded. */
export const MOSAIC_PHOTO_IDS = [
  'star-cement-137',
  'captain-tmt-bar-144',
  'sel-tmt-058',
  'toptech-tmt-040',
  'supreme-pipe-085',
] as const

/** Split "200+ companies since 1990" into the numeral and its words. */
function splitFigure(text: string): { value: string; label: string } {
  const [value, ...rest] = text.split(' ')
  return { value, label: rest.join(' ') }
}

export interface Figure {
  value: string
  label: string
}

/** The lead figure, set largest. */
export const LEAD_FIGURE: Figure = splitFigure(COMPANIES_SERVED)

/** Years with a brand, counted from its start year. */
export function tenureFigures(now: Date = new Date()): Figure[] {
  return BRAND_TENURES.map(({ brand, since }) => ({ value: String(yearsWith(since, now)), label: `years with ${brand}` }))
}

/** The size of the operation, each as a numeral and a few words. */
export const SCALE_FIGURES: Figure[] = [
  { value: WORKSHOP.area.replace(/ sq ft$/, ''), label: `sq ft workshop at ${WORKSHOP.place}` },
  { value: String(CREW_NETWORK.size), label: CREW_NETWORK.line.replace(` ${CREW_NETWORK.size}`, '') },
  { value: VEHICLES.range, label: VEHICLES.line.replace(`${VEHICLES.range} `, '') },
  { value: String(COVERAGE_AREAS.length), label: 'areas covered' },
]

export interface LedgerBrand {
  name: string
  logo: string
  /** The logo file's own pixel size, so it can be set to one optical height. */
  width: number
  height: number
}

/**
 * The client logo board as a ledger, one row per sector. The same names and
 * files as the client logo board the homepage carried until 16 November 2026.
 */
export const BRAND_LEDGER: { sector: string; brands: LedgerBrand[] }[] = [
  {
    sector: 'Cement',
    brands: [
      { name: 'Star Cement', logo: '/client-logos/star-cement.webp', width: 280, height: 280 },
      { name: 'Adani Cement', logo: '/client-logos/adani-cement.webp', width: 462, height: 174 },
      { name: 'Dalmia Cement', logo: '/client-logos/dalmia-cement.png', width: 400, height: 225 },
    ],
  },
  {
    sector: 'Steel and TMT',
    brands: [
      { name: 'Shyam Steel', logo: '/client-logos/shyam-steel.webp', width: 220, height: 97 },
      { name: 'SRMB', logo: '/client-logos/srmb.webp', width: 105, height: 32 },
      { name: 'Captain TMT Bar', logo: '/client-logos/captain-tmt-bar.webp', width: 190, height: 36 },
      { name: 'Toptech TMT', logo: '/client-logos/toptech-tmt.webp', width: 660, height: 185 },
      { name: 'SEL TMT', logo: '/client-logos/sel-tmt.webp', width: 150, height: 62 },
      { name: 'SD Lion TMT', logo: '/client-logos/sd-lion-tmt.webp', width: 517, height: 280 },
      { name: 'Supershakti', logo: '/client-logos/supershakti.webp', width: 146, height: 49 },
      { name: 'Elegant TMT Bar', logo: '/client-logos/elegant-tmt-bar.webp', width: 150, height: 71 },
    ],
  },
  {
    sector: 'Pipes',
    brands: [
      { name: 'Supreme Pipe', logo: '/client-logos/supreme-pipe.webp', width: 660, height: 213 },
      { name: 'Astral Pipe', logo: '/client-logos/astral-pipe.webp', width: 150, height: 52 },
    ],
  },
  {
    sector: 'Electricals',
    brands: [
      { name: 'Havells', logo: '/client-logos/havells.webp', width: 424, height: 280 },
      { name: 'Anchor', logo: '/client-logos/anchor.webp', width: 536, height: 155 },
    ],
  },
  {
    sector: 'Telecom and DTH',
    brands: [
      { name: 'Airtel', logo: '/client-logos/airtel.webp', width: 660, height: 271 },
      { name: 'Jio', logo: '/client-logos/jio.webp', width: 83, height: 83 },
      { name: 'Vivo', logo: '/client-logos/vivo.webp', width: 660, height: 173 },
      { name: 'Dish TV', logo: '/client-logos/dish-tv.webp', width: 660, height: 240 },
    ],
  },
  {
    sector: 'Consumer and hospitality',
    brands: [
      { name: 'Emami', logo: '/client-logos/emami.png', width: 612, height: 567 },
      { name: 'OYO', logo: '/client-logos/oyo.webp', width: 660, height: 232 },
    ],
  },
]

export const LEDGER_NOTE = 'Selected history includes assignments through regional agencies.'

export interface BrandTrade {
  title: string
  photoId: string
  link: { slug: ServiceSlug; label: string }
}

/** The five trades with a photographed brand job each. */
export const BRAND_TRADES: BrandTrade[] = [
  { title: 'Dealer boards', photoId: 'supreme-pipe-107', link: { slug: 'glow-sign-boards', label: 'Glow sign boards' } },
  { title: 'In-shop branding', photoId: 'dish-tv-142', link: { slug: 'in-shop-branding', label: 'In-shop branding' } },
  { title: 'Wall painting campaigns', photoId: 'sd-lion-tmt-140', link: { slug: 'wall-painting', label: 'Wall painting' } },
  { title: 'Vehicle and fleet branding', photoId: 'srmb-143', link: { slug: 'vehicle-branding', label: 'Vehicle branding' } },
  { title: 'Puja gates and events', photoId: 'anchor-by-panasonic-111', link: { slug: 'events-and-puja', label: 'Puja and event branding' } },
]

/** Work with no photographs on the site yet: named, one honest line each, never a borrowed picture. */
export const TYPE_ONLY_TRADES: { title: (typeof ALSO_SERVICES)[number]; line: string }[] = [
  { title: ALSO_SERVICES[0], line: 'Tell us the towns and the sizes you need.' },
  { title: ALSO_SERVICES[1], line: 'Branding for your stall or your dealer meet.' },
  { title: ALSO_SERVICES[2], line: 'Ask about a road show through your districts.' },
]

/** A real Star Cement job beside the Malda story, captioned with its own place. */
export const SPEED_PHOTO_ID = 'star-cement-134'

export const ROLLOUT_STEPS = [
  'One outlet list',
  'A frontage photo and a size for each',
  'Artwork named per outlet',
  'Made in Siliguri, fitted on site',
]

export const VENDOR_LINE = 'Vendor documents for your empanelment, on request.'

/** Every gallery photo on the page, for the sitemap. */
export const BRAND_PHOTO_IDS: string[] = [...MOSAIC_PHOTO_IDS, ...BRAND_TRADES.map(trade => trade.photoId), SPEED_PHOTO_ID]

const areaNames = COVERAGE_AREAS.map(area => area.name)

export const FOR_BRANDS_FAQS = [
  {
    q: 'Can you work from our head office design kit?',
    a: 'Yes. Send the brand manual or kit with the outlet list. Each board carries the dealer\'s own name, and your team approves it before it is made.',
  },
  {
    q: 'How do we check the work without visiting every outlet?',
    a: `${GPS_PHOTO_LINE} The photos come back to your team.`,
  },
  {
    q: 'Can you share vendor documents for our empanelment?',
    a: 'Yes. Name the documents your vendor process asks for, and they come with the quote.',
  },
  {
    q: 'Which places do you cover?',
    a: `${areaNames.slice(0, -1).join(', ')} and ${areaNames.at(-1)}. All made in Siliguri, then fitted on site.`,
  },
]
