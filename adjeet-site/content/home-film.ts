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
  jobDaysLabel,
  yearsWith,
} from '@/content/company-figures'
import { photos, type GalleryPhoto } from '@/content/gallery'
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

export type ChapterId = 'hero' | 'brands' | 'work' | 'brief' | 'workshop' | 'road' | 'hills' | 'junction' | 'finale'

/**
 * A stop: where the film rests (a p value, 0 to 1 of the chapter's pinned
 * scroll), and for the showpieces how long the move into it takes, in ms.
 */
export type Stop = number | { readonly p: number; readonly ms: number }
export const stopP = (stop: Stop) => (typeof stop === 'number' ? stop : stop.p)
/** `data-stops` on the section: "0.14 0.78:3500" (p, or p:ms for a showpiece). */
export const stopsAttr = (stops?: readonly Stop[]) => stops?.map(stop => (typeof stop === 'number' ? String(stop) : `${stop.p}:${stop.ms}`)).join(' ')

/**
 * Each chapter: how long it stays pinned (`len`, in screens), how far its
 * start overlaps the one before (`over`), where an anchor or a skip link lands
 * (`rest`, one of its stops), the camera frame for the still version (`still`,
 * default 1), its heading, and its stops. The film is stepped
 * (stepper-contract.md): one gesture moves exactly one stop, every move is
 * timed, and the film rests only on stops, so every frame meant to be read is
 * a stop. The rail labels each chapter with its heading, without the full stop.
 */
export interface Chapter {
  id: ChapterId
  title: string
  len: number
  over?: number
  rest: number
  still?: number
  stops: readonly Stop[]
  /**
   * Seconds the chapter's whole timeline (p 0 to 1) takes when the stepper
   * plays it: a move from stop a to stop b takes (b - a) times this, held to
   * 0.8 to 1.6 s, unless the stop it goes into is a showpiece with its own ms.
   */
  dur: number
}

/**
 * Proof first (storyboard-v2, section 2): the brands, then the real
 * photographs, then the story. 23 stops (stepper-contract.md):
 * - hero: at rest.
 * - brands: the wall lit, the title, the figure and the actions (the hero's
 *   push and the wave are the move into it, a showpiece).
 * - work: the title with the first photographs, then a screenful of
 *   photographs per stop as the wall rises (6 to 78% of the chapter), then the
 *   closing photograph with the GPS sentence and the link.
 * - brief: the chat played; the words and the action.
 * - workshop: the first board lit with the title; every board lit with the
 *   job times and the line.
 * - road: the title and the crew line; the Malda hold (the count plays
 *   during the move, a showpiece).
 * - hills: the title over the land; every light on, the whole list of
 *   places under the title and the link (the lights and the names come on
 *   together during the move, a showpiece).
 * - junction: each of the five surfaces with its caption; the settled list.
 * - finale: the title and the actions.
 */
export const CHAPTERS: readonly Chapter[] = [
  { id: 'hero', title: 'Advertising that gets you noticed.', len: 1.4, rest: 0, still: 0, stops: [0], dur: 1.5 },
  { id: 'brands', title: 'Brands stay for years.', len: 1.6, over: 0, rest: 0.5, stops: [{ p: 0.5, ms: 2500 }], dur: 2.5 },
  { id: 'work', title: 'Seen on real streets.', len: 4.5, over: 0, rest: 0.06, stops: [0.06, 0.2, 0.34, 0.48, 0.62, 0.8], dur: 8 },
  { id: 'brief', title: 'It starts with a photo.', len: 2.6, over: 0, rest: 0.57, stops: [0.4, 0.57], dur: 6 },
  { id: 'workshop', title: 'Made in our own workshop.', len: 2.7, over: 0, rest: 0.66, stops: [0.37, 0.66], dur: 4.5 },
  { id: 'road', title: 'Then it goes out on the road.', len: 3.2, over: 0, rest: 0.14, stops: [0.14, { p: 0.78, ms: 3500 }], dur: 5 },
  { id: 'hills', title: 'From the plains to the hills.', len: 3.2, over: 0, rest: 0.8, stops: [0.17, { p: 0.8, ms: 3000 }], dur: 5 },
  { id: 'junction', title: 'Shopfronts, walls, vehicles, events.', len: 3.4, over: 0, rest: 0.8, stops: [0.13, 0.25, 0.37, 0.49, 0.6, 0.8], dur: 9 },
  { id: 'finale', title: 'Your name is next.', len: 2.1, over: 0, rest: 0.72, stops: [0.72], dur: 3 },
]

export function chapter(id: ChapterId): Chapter {
  const found = CHAPTERS.find(entry => entry.id === id)
  if (!found) throw new Error(`home-film: no chapter ${id}`)
  return found
}

/** The rail's label for a chapter: its heading without the full stop. */
export const railLabel = (entry: Chapter) => entry.title.replace(/\.$/, '')

/** The hero's link past the film's opening, to the real photographs (#work). */
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
/** "normally 20 to 25 days of work": the job's normal time, the only comparison the film makes. */
export const MALDA_NORMAL = {
  min: maldaNumber(/normally (\d+) to \d+ days of work/),
  max: maldaNumber(/normally \d+ to (\d+) days of work/),
} as const

/**
 * The Malda beat (storyboard v2, section 7): the boards as a field of 10 rows,
 * nearest first, and a strip of one mark per day up to the top of the normal
 * time, the first MALDA_DAYS of them gold.
 */
export const MALDA_ROWS = 10

export const ROAD = {
  line: `${sentence(CREW_NETWORK.line)} ${sentence(VEHICLES.line)}`,
  /**
   * The Malda beat's heading, the owner's own words (16 November 2026). Mirrors
   * the heading of the Malda section on /for-brands on main
   * (app/(marketing)/for-brands/page.tsx, "brands-speed-heading"), which is
   * not a shared constant there yet.
   */
  maldaTitle: 'We put our clients first.',
  story: MALDA_STORY,
  hold: `${MALDA_BOARDS} boards. Day ${MALDA_DAYS}.`,
  /** The approved sentence's second clause, as a line of its own. */
  normal: `Normally ${MALDA_NORMAL.min} to ${MALDA_NORMAL.max} days of work.`,
  unit: 'boards',
  day: 'Day',
  fieldLabel: `${MALDA_BOARDS} glow sign boards, lit row by row from day 1 to day ${MALDA_DAYS}`,
  stripLabel: `One mark for each day up to day ${MALDA_NORMAL.max}. Day 1 to day ${MALDA_DAYS} are gold: the job was finished on day ${MALDA_DAYS}`,
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

export type TradeLink = { label: string; href?: string }
const tradeOf = (slug: ServiceSlug): TradeLink => ({ label: SERVICE_LINK_LABELS[slug], href: `/services/${slug}` })

export const JUNCTION = {
  surfaces: SURFACES.map(tradeOf),
  line: 'Made at one workshop. Put up by one crew network.',
  /** Every trade: the ten with pages as links, then the other work as text. */
  trades: [
    ...SERVICE_SLUGS.map(tradeOf),
    ...ALSO_SERVICES.map(label => ({ label })),
  ] as TradeLink[],
  listLabel: 'Our work',
} as const

/* ---------- Chapter 1, brands: "Brands stay for years." ----------
   The wall is the owner-approved client board: the 21 brands of ROW_1 and
   ROW_2 in components/street/ClientStreet.tsx on main (the board the home
   page carried until 16 November 2026; the same names as BRAND_LEDGER in
   content/for-brands.ts), plus Lloyd, the one tenure brand the board left
   out for want of a logo file. Brands only, no local outlets. The five
   tenure brands come first, in BRAND_TENURES order, then the other 17 in
   the board's order. Owner's instruction, 16 November 2026. */

export type LogoFile = { src: string; width: number; height: number }
export type WallBrand = { name: string; logo?: LogoFile }

/**
 * Every brand on the wall, with its logo from /client-logos. `width` and
 * `height` are the file's own pixels: a logo is never drawn larger, never
 * recoloured, and on a phone at most half its width so it stays sharp at 2x
 * (film.css). A brand without a file sharp enough for the board is lettered
 * in the film's face until a larger file is approved.
 */
export const WALL: readonly WallBrand[] = [
  { name: 'Havells', logo: { src: '/client-logos/havells.webp', width: 424, height: 280 } },
  // Lloyd's clean logo is the owner-approved file from the company profile deck.
  { name: 'Lloyd', logo: { src: '/client-logos/lloyd.png', width: 700, height: 203 } },
  { name: 'Shyam Steel', logo: { src: '/client-logos/shyam-steel.webp', width: 220, height: 97 } },
  { name: 'Star Cement', logo: { src: '/client-logos/star-cement.webp', width: 280, height: 280 } },
  { name: 'Anchor by Panasonic', logo: { src: '/client-logos/anchor.webp', width: 536, height: 155 } },
  { name: 'Airtel', logo: { src: '/client-logos/airtel.webp', width: 660, height: 271 } },
  { name: 'Supreme Pipe', logo: { src: '/client-logos/supreme-pipe.webp', width: 660, height: 213 } },
  // The only SRMB file is 105 x 32: lettered until a larger one is approved.
  { name: 'SRMB' },
  { name: 'Emami', logo: { src: '/client-logos/emami.png', width: 612, height: 567 } },
  { name: 'OYO', logo: { src: '/client-logos/oyo.webp', width: 660, height: 232 } },
  { name: 'Dalmia Cement', logo: { src: '/client-logos/dalmia-cement.png', width: 400, height: 225 } },
  { name: 'Jio', logo: { src: '/client-logos/jio.webp', width: 83, height: 83 } },
  { name: 'Vivo', logo: { src: '/client-logos/vivo.webp', width: 660, height: 173 } },
  { name: 'Toptech TMT', logo: { src: '/client-logos/toptech-tmt.webp', width: 660, height: 185 } },
  { name: 'Captain TMT Bar', logo: { src: '/client-logos/captain-tmt-bar.webp', width: 190, height: 36 } },
  { name: 'Supershakti', logo: { src: '/client-logos/supershakti.webp', width: 146, height: 49 } },
  { name: 'Elegant TMT Bar', logo: { src: '/client-logos/elegant-tmt-bar.webp', width: 150, height: 71 } },
  { name: 'Astral Pipe', logo: { src: '/client-logos/astral-pipe.webp', width: 150, height: 52 } },
  { name: 'SEL TMT', logo: { src: '/client-logos/sel-tmt.webp', width: 150, height: 62 } },
  { name: 'Adani Cement', logo: { src: '/client-logos/adani-cement.webp', width: 462, height: 174 } },
  { name: 'SD Lion TMT', logo: { src: '/client-logos/sd-lion-tmt.webp', width: 517, height: 280 } },
  { name: 'Dish TV', logo: { src: '/client-logos/dish-tv.webp', width: 660, height: 240 } },
]

/** "200+" and "companies since 1990". */
const [companiesValue, ...companiesWords] = COMPANIES_SERVED.split(' ')

/**
 * The years with each tenure brand as one quiet line, from BRAND_TENURES and
 * yearsWith: "16 years with Havells, 15 with Lloyd, ... and 5 with Anchor by
 * Panasonic."
 */
export function tenureLine(now?: Date): string {
  const parts = BRAND_TENURES.map(({ brand, since }, index) => `${yearsWith(since, now)}${index === 0 ? ' years' : ''} with ${brand}`)
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}.`
}

export const BRANDS = {
  wallLabel: 'Brands we have worked for',
  companies: { value: companiesValue, label: companiesWords.join(' ') },
  tenure: (now?: Date) => tenureLine(now),
  profile: 'Ask for the company profile',
  brands: { href: '/for-brands', label: 'For brand teams' },
} as const

/* ---------- Chapter 2, work: "Seen on real streets." ----------
   Real photographs from content/gallery.ts by id, in play order
   (storyboard/curation/picks-v2.json, with the coordinator's order of
   16 November 2026). To change the set, edit this list: a pick whose id is
   not in the gallery is skipped. `size` is the rhythm on a phone: a large
   photograph across the width, or one of a pair side by side. `width` and
   `height` are the file's own pixels, so none is drawn larger. The last pick
   closes the chapter beside the GPS line (its stamp is readable). */
export type WorkPick = { id: string; width: number; height: number; size: 'large' | 'pair' }

export const WORK_PICKS: readonly WorkPick[] = [
  { id: 'star-cement-137', width: 1504, height: 1004, size: 'large' },
  { id: 'tanyamakeovers-154', width: 1600, height: 800, size: 'pair' },
  { id: 'anchor-by-panasonic-106', width: 1435, height: 738, size: 'pair' },
  { id: 'acc-105', width: 1280, height: 960, size: 'large' },
  { id: 'havells-117', width: 1156, height: 775, size: 'pair' },
  { id: 'sel-tmt-058', width: 1600, height: 1200, size: 'pair' },
  { id: 'srmb-143', width: 1024, height: 768, size: 'large' },
  { id: 'ambuja-cement-126', width: 738, height: 725, size: 'pair' },
  { id: 'anchor-by-panasonic-111', width: 968, height: 726, size: 'pair' },
  { id: 'supreme-pipe-110', width: 1040, height: 780, size: 'large' },
  { id: 'sd-lion-tmt-139', width: 1280, height: 1280, size: 'pair' },
  { id: 'dish-tv-142', width: 780, height: 1040, size: 'pair' },
  { id: 'airtel-008', width: 1280, height: 960, size: 'pair' },
  { id: 'havells-115', width: 1280, height: 720, size: 'pair' },
  { id: 'star-cement-132', width: 1600, height: 1200, size: 'large' },
]

/** The picks the gallery has, and the ids it does not (skipped). */
export function workPicks(): { shown: (WorkPick & { photo: GalleryPhoto })[]; skipped: string[] } {
  const shown: (WorkPick & { photo: GalleryPhoto })[] = []
  const skipped: string[] = []
  for (const pick of WORK_PICKS) {
    const photo = photos.find(entry => entry.id === pick.id)
    if (photo) shown.push({ ...pick, photo })
    else skipped.push(pick.id)
  }
  return { shown, skipped }
}

export const WORK = {
  wallLabel: 'Installations, from the gallery',
  gps: GPS_PHOTO_LINE,
  all: { href: '/portfolio', label: 'See all the work' },
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
  brandsProfile: 'film-brands-profile',
  finale: 'film-finale',
  finaleProfile: 'film-finale-profile',
} as const
