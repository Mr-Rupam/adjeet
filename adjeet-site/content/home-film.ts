import {
  ALSO_SERVICES,
  BRAND_TENURES,
  COMPANIES_SERVED,
  CREW_NETWORK,
  GPS_PHOTO_LINE,
  JOB_DAYS,
  JOB_DAYS_CAPTION,
  MALDA_STORY,
  VEHICLES,
  WORKSHOP,
  brandTenureLines,
  jobDaysLabel,
} from '@/content/company-figures'
import { SERVICE_SLUGS, type ServiceSlug } from '@/content/services'
import { SERVICE_LINK_LABELS } from '@/content/site-links'
import { COVERAGE_AREAS } from '@/lib/coverage'

/**
 * The home film's own words and data (DESIGN.md, "Home film"; the storyboard
 * of 16 November 2026). Every figure is read from content/company-figures.ts,
 * every place from lib/coverage.ts, every service from content/services.ts
 * and content/site-links.ts, and every photograph from content/gallery.ts by
 * its id; nothing here types a figure in. tests/unit/content/home-film.test.ts
 * checks all of it.
 */

/** "a crew network..." as the start of a sentence. */
const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1) + '.'

export { DEFAULT_SHOP_NAME, SHOP_NAME_MAX } from '@/content/shop-name'

export type ChapterId = 'hero' | 'brief' | 'workshop' | 'road' | 'hills' | 'junction' | 'proof' | 'finale'

/**
 * Each chapter: how long it stays pinned (`len`, in screens), how far its
 * start overlaps the one before (`over`), where an anchor or a skip link lands
 * (`rest`, 0 to 1 of its pinned scroll), the camera frame for the still
 * version (`still`, default 1), and its heading. The rail labels each
 * chapter with its heading, without the full stop.
 */
export interface Chapter {
  id: ChapterId
  title: string
  len: number
  over?: number
  rest: number
  still?: number
  /** The scroll controller's rest positions (p values), for `data-stops` on the section. */
  stops?: readonly number[]
}

export const CHAPTERS: readonly Chapter[] = [
  { id: 'hero', title: 'Advertising that gets you noticed.', len: 0.9, rest: 0, still: 0 },
  { id: 'brief', title: 'It starts with a photo.', len: 1.6, over: 0, rest: 0.6 },
  { id: 'workshop', title: 'Made in our own workshop.', len: 1.7, over: 0, rest: 0.66 },
  { id: 'road', title: 'Then it goes out on the road.', len: 2, over: 0, rest: 0.14 },
  { id: 'hills', title: 'From the plains to the hills.', len: 2, over: 0, rest: 0.8 },
  // Stops: each of the five surfaces lit with its caption, then the whole list settled.
  { id: 'junction', title: 'Shopfronts, walls, vehicles, events.', len: 2.1, over: 0, rest: 0.8, stops: [0.13, 0.25, 0.37, 0.49, 0.6, 0.8] },
  { id: 'proof', title: 'Brands stay for years.', len: 2.4, over: 0, rest: 0.04 },
  { id: 'finale', title: 'Your name is next.', len: 1.3, over: 0, rest: 0.72 },
]

export function chapter(id: ChapterId): Chapter {
  const found = CHAPTERS.find(entry => entry.id === id)
  if (!found) throw new Error(`home-film: no chapter ${id}`)
  return found
}

/** The rail's label for a chapter: its heading without the full stop. */
export const railLabel = (entry: Chapter) => entry.title.replace(/\.$/, '')

/** The hero's link past the film, to the proof chapter. */
export const SKIP_LABEL = 'See finished work'

export const BRIEF = {
  line: 'Send a photo of your shop on WhatsApp. Brand teams send the outlet list.',
  sent: 'This is my shop. I need a sign board.',
  reply: 'Artwork, material, size and lighting: we work through them with you.',
  chatName: 'AD JEET',
  inputLabel: "Type your shop's name",
  inputPlaceholder: "Your shop's name",
  action: 'Send a photo of your shop',
  outlets: 'Send your outlet list',
} as const

export const WORKSHOP_CHAPTER = {
  caption: JOB_DAYS_CAPTION,
  /** "Glow sign boards. 1 to 3 days.", in the order company-figures.ts gives. */
  times: JOB_DAYS.map(job => ({ slug: job.slug, line: `${job.label}. ${jobDaysLabel(job.slug)}.` })),
  line: `${WORKSHOP.area} at ${WORKSHOP.place}.`,
} as const

/** The Malda job's numbers, read from its approved sentence. */
function maldaNumber(pattern: RegExp): number {
  const match = MALDA_STORY.match(pattern)
  if (!match) throw new Error(`home-film: ${pattern} is not in MALDA_STORY`)
  return Number(match[1])
}
export const MALDA_BOARDS = maldaNumber(/needed (\d+) /)
export const MALDA_DAYS = maldaNumber(/finished on day (\d+)\./)

export const ROAD = {
  line: `${sentence(CREW_NETWORK.line)} ${sentence(VEHICLES.line)}`,
  story: MALDA_STORY,
  hold: `${MALDA_BOARDS} boards. Day ${MALDA_DAYS}.`,
  gridLabel: `A grid of ${MALDA_BOARDS} glow sign boards, filled row by row from day 1 to day ${MALDA_DAYS}`,
} as const

type Place = (typeof COVERAGE_AREAS)[number]['name']

/** Plains to peaks, the order the lights come on in (storyboard, shot 4). */
const PLACE_ORDER: readonly Place[] = [
  'Malda', 'South Dinajpur', 'North Dinajpur', 'Cooch Behar', 'Alipurduar', 'Jalpaiguri',
  'The Dooars', 'Siliguri', 'Kalimpong', 'Darjeeling', 'Sikkim',
]

export const HILLS = {
  line: 'North Bengal and Sikkim.',
  places: PLACE_ORDER,
  listLabel: 'Areas we serve',
  link: { href: '/areas', label: 'See where we work' },
} as const

/**
 * The surfaces at the junction, in the order they light up: the glow sign
 * board over the shop, the painted wall, the pole sign, the van and the open
 * shop. Each names the service it shows and links to its page.
 */
const SURFACES: readonly ServiceSlug[] = [
  'glow-sign-boards',
  'wall-painting',
  'f-pole-installation',
  'vehicle-branding',
  'in-shop-branding',
]

/**
 * The owner does not promote large roadside display structures (16 November
 * 2026, storyboard v2 section 7a), so the film never names them, even while
 * the site's list of other work still does.
 */
const NOT_PROMOTED = /hoarding|billboard/i

export type TradeLink = { label: string; href?: string }
const tradeOf = (slug: ServiceSlug): TradeLink => ({ label: SERVICE_LINK_LABELS[slug], href: `/services/${slug}` })

export const JUNCTION = {
  surfaces: SURFACES.map(tradeOf),
  line: 'Made at one workshop. Put up by one crew network.',
  /** Every trade: the ten with pages as links, then the other work as text. */
  trades: [
    ...SERVICE_SLUGS.map(tradeOf),
    ...ALSO_SERVICES.filter(label => !NOT_PROMOTED.test(label)).map(label => ({ label })),
  ] as TradeLink[],
  listLabel: 'Our work',
} as const

/**
 * The six photographs, in the order they play (storyboard curation, report.md
 * and picks.json). Each is a gallery record; its caption is built from that
 * record only. `width` and `height` are the file's own pixels, so it is never
 * drawn larger. Frames from the third on wait for the strip to bring them near.
 */
export const PROOF_PICKS = [
  { id: 'tanyamakeovers-154', width: 1600, height: 800 },
  { id: 'star-cement-137', width: 1504, height: 1004 },
  { id: 'anchor-by-panasonic-106', width: 1435, height: 738 },
  { id: 'acc-105', width: 1280, height: 960 },
  { id: 'havells-120', width: 1600, height: 1062 },
  { id: 'havells-015', width: 1156, height: 868 },
] as const

/** Logos on the ledger board, from /client-logos, at their own pixel size or smaller. */
export const LEDGER_LOGOS = [
  { brand: 'Havells', src: '/client-logos/havells.webp', width: 424, height: 280, height1x: 62 },
  { brand: 'Anchor by Panasonic', src: '/client-logos/anchor.webp', width: 536, height: 155, height1x: 36 },
  { brand: 'Star Cement', src: '/client-logos/star-cement.webp', width: 280, height: 280, height1x: 58 },
  { brand: 'Shyam Steel', src: '/client-logos/shyam-steel.webp', width: 220, height: 97, height1x: 40 },
] as const satisfies readonly { brand: (typeof BRAND_TENURES)[number]['brand']; src: string; width: number; height: number; height1x: number }[]

/** "200+" and "companies since 1990". */
const [companiesValue, ...companiesWords] = COMPANIES_SERVED.split(' ')

export const PROOF = {
  reelLabel: 'Six installations, from the gallery',
  gps: GPS_PHOTO_LINE,
  companies: { value: companiesValue, label: companiesWords.join(' ') },
  years: (now?: Date) => brandTenureLines(now),
  profile: 'Ask for the company profile',
  brands: { href: '/for-brands', label: 'For brand teams' },
  work: { href: '/portfolio', label: 'See all the work' },
} as const

export const FINALE = {
  line: 'Send a photo of your shop, or your outlet list.',
  action: 'WhatsApp your project',
  profile: 'Ask for the company profile',
} as const

/** Where each WhatsApp action reports from, one per chapter (lib/analytics.ts). */
export const FILM_SOURCES = {
  brief: 'film-brief',
  briefOutlets: 'film-brief-outlets',
  proofProfile: 'film-proof-profile',
  finale: 'film-finale',
  finaleProfile: 'film-finale-profile',
} as const
