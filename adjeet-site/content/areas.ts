import { photos, type GalleryPhoto } from '@/content/gallery'
import type { ServiceSlug } from '@/content/services'
import { business } from '@/lib/business'
import { COVERAGE_PLACES, REACH_RINGS_KM } from '@/lib/coverage-places'
import type { LeadInput } from '@/lib/lead-schema'

/**
 * Copy for `/areas` and the town pages under it.
 *
 * `/areas` treats every coverage place the same way: a name, a distance from
 * the workshop and how a job there is planned. No place carries a project
 * count, a grade or an evidence badge (the owner rejected that on the map).
 *
 * A town page is an addition earned by documented work, not a ranking. It shows
 * only photographs whose place is recorded in `content/gallery.ts`, and it is
 * indexed only once it passes the SEO plan's gate: at least two documented
 * local jobs, 600 or more words and at least 60% text of its own. The gate is
 * measured in `tests/unit/app/areas-pages.test.tsx`; a page below it ships
 * `noindex, follow` and stays out of the sitemap until it qualifies.
 *
 * Every sentence here has to be checkable: no prices, response times, visit
 * promises, branch claims or work the gallery cannot show.
 */

/** Straight-line kilometres from the workshop, the same figure the coverage map shows. */
export function distanceKm(area: string): number {
  const place = COVERAGE_PLACES.find(candidate => candidate.name === area)
  if (!place) throw new Error(`"${area}" is not a coverage place in lib/coverage.ts`)
  return place.distanceKm
}

export const TOWN_SLUGS = ['cooch-behar', 'jalpaiguri', 'gangtok'] as const
export type TownSlug = (typeof TOWN_SLUGS)[number]

export interface TownTrade {
  service: ServiceSlug
  /** Written for this town, from the brief its old trade page carried. */
  brief: string
}

export interface Town {
  slug: TownSlug
  name: string
  state: 'West Bengal' | 'Sikkim'
  region: 'North Bengal' | 'Sikkim'
  /** The `COVERAGE_AREAS` entry the distance is measured to. Sikkim is plotted at Gangtok. */
  coverageArea: string
  /** The enquiry form's own value for this town. Must already exist in `lib/lead-schema.ts`. */
  leadCity: LeadInput['city']
  seoTitle: string
  metaDescription: string
  headline: string
  lead: string
  /** Photographs whose recorded place is this town, newest work first as the gallery orders it. */
  photos: GalleryPhoto[]
  /** The photo the page leads with and shares as its link preview. */
  coverPhotoId: string
  work: string
  /** Every brand, place and year the `work` paragraph names, so the tests can hold it to the photos. */
  workCites: { clients: string[]; places: string[]; years: number[] }
  trip: string[]
  trades: TownTrade[]
  nearby: string[]
  nearbyNote: string
  faqs: { q: string; a: string }[]
  /** False until the page passes the gate described above. */
  indexable: boolean
}

const COOCH_BEHAR_KM = distanceKm('Cooch Behar')
const JALPAIGURI_KM = distanceKm('Jalpaiguri')
const GANGTOK_KM = distanceKm('Sikkim')

export const TOWNS: Town[] = [
  {
    slug: 'cooch-behar',
    name: 'Cooch Behar',
    state: 'West Bengal',
    region: 'North Bengal',
    coverageArea: 'Cooch Behar',
    leadCity: 'Cooch Behar',
    seoTitle: 'Sign Boards & Glow Signs in Cooch Behar',
    metaDescription: 'Glow sign boards, shop boards, ACP signage, wall painting and vehicle branding for Cooch Behar, made at AD JEET\'s Siliguri workshop. See work photographed in and around the town.',
    headline: 'Sign boards for Cooch Behar.',
    lead: 'Shop boards, glow signs, ACP fronts, wall paintings and vehicle graphics, made at our Siliguri workshop and installed on site in and around Cooch Behar.',
    photos: photos.filter(photo => photo.city === 'cooch-behar'),
    coverPhotoId: 'sd-lion-tmt-139',
    work: 'Most of what we have photographed in and around Cooch Behar is dealer branding for building-material brands. Captain TMT Bar boards sit over hardware stores in Jiranpur, Ghughumari, Chandamari and the town itself. SD Lion TMT has a board over Shibshakti Hardware and a painted wall for Bengal Hardware Stores in Dinhata. Supreme Pipes and Astral Pipes have glow signs over stores in Baneswar and Khagrabari. The photographs date from 2023 to 2026, and each one is listed below with the place and year where they are recorded.',
    workCites: {
      clients: ['Captain TMT Bar', 'SD Lion TMT', 'Supreme Pipe', 'Astral Pipe'],
      places: ['Jiranpur', 'Ghughumari', 'Chandamari', 'Cooch Behar', 'Dinhata', 'Baneswar', 'Khagrabari'],
      years: [2023, 2026],
    },
    trip: [
      `Cooch Behar is about ${COOCH_BEHAR_KM} km from our Siliguri workshop in a straight line, and further by road. Boards, glow signs and ACP panels are cut, printed, wired and finished at the workshop and travel out ready to fit. Wall paintings and pole foundations are the exceptions, because that work happens on site.`,
      'That makes every Cooch Behar job an installation trip, so the details that decide it are settled before anything leaves Siliguri: the exact site, the sizes, the mounting surface, the power point for a lit sign and a fitting day that suits the shop.',
      'When several shops in the district need boards, such as a brand\'s dealer outlets, send the full list of addresses and sizes together. The team can then look at grouping sites into one trip instead of quoting each board as a separate journey. Whether that works depends on the sites and the dates, and it is confirmed with the quote.',
    ],
    trades: [
      { service: 'glow-sign-boards', brief: 'Planning a glow sign for a Cooch Behar shop or office? Show how the frontage looks from both directions, and note any shared entrance or neighbouring sign that limits the available space. Send the exact site location with the brief so transport, measurement and installation can be discussed together before production is booked.' },
      { service: 'acp-led-signage', brief: 'For an ACP storefront in Cooch Behar, share the complete facade dimensions and identify which parts of the exterior you control. For a franchise or branch, send the approved brand artwork and any landlord requirements. Agree the panel joints, lettering and transport scope before fabrication so the proposed finish fits the actual site.' },
      { service: 'flex-printing', brief: 'For a Cooch Behar flex campaign with several placements, prepare a simple list of locations, banner sizes and artwork versions. Mark which items need eyelets, hemming or mounting. A labelled artwork list helps prevent mixing up shop names, phone numbers or offers during a print run, especially when delivery is split between sites.' },
      { service: 'vehicle-branding', brief: 'For a Cooch Behar fleet, start with a vehicle list showing model, registration or internal ID, existing graphics and the proposed artwork version. If vehicles cannot leave service together, describe the available fitting windows. This makes it easier to discuss a staged plan and keep phone numbers, route names and brand elements consistent.' },
      { service: 'f-pole-installation', brief: 'For a Cooch Behar roadside or entrance sign, show the proposed position in relation to the property boundary, entrance and any existing structures. Provide an exact location and explain who controls the land. The brief should cover permissions, site assessment, foundation work, transport and installation so the complete scope can be reviewed together.' },
    ],
    nearby: ['Dinhata', 'Mathabhanga', 'Tufanganj'],
    nearbyNote: 'Enquiries from Dinhata, Mathabhanga and Tufanganj are planned the same way, from the same workshop. Alipurduar and the Dooars are covered too.',
    faqs: [
      { q: 'Does AD JEET have an office in Cooch Behar?', a: 'No. Our workshop and office are both in Siliguri. Cooch Behar jobs are designed and made there, then delivered and installed on a date agreed for each site.' },
      { q: 'Can you put up boards at several shops around Cooch Behar?', a: 'Yes. Send the list of shops with an address, a frontage photo and the board size for each. The team checks the artwork and the sites for every outlet, and the quote says how the installation trips are arranged.' },
      { q: 'Do you paint wall advertisements around Cooch Behar?', a: 'Yes. The portfolio includes an SD Lion TMT wall painting in Dinhata from 2025. Send the wall locations, a photo of each wall and the artwork, and the team will plan the painting with the rest of the campaign.' },
      { q: 'How far is Cooch Behar from your workshop?', a: `About ${COOCH_BEHAR_KM} km in a straight line from our Siliguri workshop; the road is longer. The fitting day is agreed once the site details and sizes are confirmed.` },
      { q: 'What should I send for a Cooch Behar quote?', a: `A location pin, photos of the frontage or site, the rough size and your target date. WhatsApp them to ${business.phoneDisplay}, or use the form on this page, which already has Cooch Behar selected.` },
    ],
    indexable: true,
  },
  {
    slug: 'jalpaiguri',
    name: 'Jalpaiguri',
    state: 'West Bengal',
    region: 'North Bengal',
    coverageArea: 'Jalpaiguri',
    leadCity: 'Jalpaiguri',
    seoTitle: 'Sign Boards & Glow Signs in Jalpaiguri',
    metaDescription: `Glow sign boards, shop boards, ACP signage and vehicle branding for Jalpaiguri, made at AD JEET's Siliguri workshop about ${JALPAIGURI_KM} km away. See work photographed in Jalpaiguri.`,
    headline: 'Sign boards for Jalpaiguri.',
    lead: 'Glow signs, ACP fronts, flex boards, vehicle graphics and pole signs, made at our Siliguri workshop and installed on site in and around Jalpaiguri.',
    photos: photos.filter(photo => photo.city === 'jalpaiguri'),
    coverPhotoId: 'havells-015',
    work: 'In and around Jalpaiguri we have photographed a lit Standard by Havells sign board on Agrasen Road, from 2021, and two dealer boards from 2025: Star Cement over a dealer yard on Siliguri Road, and SD Lion TMT over Jhilon Enterprise in Ghughudanga. Each one is listed below with its place and year.',
    workCites: {
      clients: ['Havells', 'Star Cement', 'SD Lion TMT'],
      places: ['Jalpaiguri', 'Ghughudanga'],
      years: [2021, 2025],
    },
    trip: [
      `Jalpaiguri is about ${JALPAIGURI_KM} km from our Siliguri workshop in a straight line. Signs are made and finished at the workshop and travel out ready to fit, so a short trip does not change the order of work: the site, the sizes and the fitting day are agreed first, then the sign is made, then it is installed.`,
      'For a lit sign, the power point and the hours it should stay on belong in the brief. For a branch or dealer network, one approved layout can be carried across every site, with the mounting surface and electrical access checked for each before production.',
    ],
    trades: [
      { service: 'glow-sign-boards', brief: 'For a Jalpaiguri glow sign, include the shopfront dimensions and photographs showing rain cover, nearby signs and the proposed power connection. If several branches need matching signs, list each address and size separately. This lets the team discuss a consistent layout while checking the mounting surface and electrical access at each site.' },
      { service: 'acp-led-signage', brief: 'A Jalpaiguri ACP and LED brief should show the panel area, existing mounting surface and any water staining or damaged cladding. Include a close-up as well as a wider frontage photograph. This helps identify what needs measuring or inspecting before discussing panel finishes, illuminated lettering and the installation scope.' },
      { service: 'flex-printing', brief: 'Ordering flex banners for Jalpaiguri? Separate your indoor and outdoor placements in the brief, and list the dimensions and quantity for each. Send a photo of the mounting area if you also need fitting. Artwork approval, printing, finishing and delivery should all be included when confirming the date the banners are required.' },
      { service: 'vehicle-branding', brief: 'A Jalpaiguri vehicle-branding brief should include the actual body dimensions and a photograph of each vehicle type. Two delivery vehicles with the same model name can have different body panels. List the intended branding areas and vehicle availability so the team can discuss fitting arrangements and avoid printing to an assumed template.' },
      { service: 'f-pole-installation', brief: 'For an F-pole sign in Jalpaiguri, identify the proposed plot position and the directions from which people should read it. Include available site drawings and photographs showing access for installation. Landowner consent, any required permissions and a structural assessment need to be discussed before a pole size, foundation or fitting schedule is confirmed.' },
    ],
    nearby: ['Mal Bazar', 'Dhupguri', 'Maynaguri'],
    nearbyNote: 'Enquiries from Mal Bazar, Dhupguri and Maynaguri come to the same Siliguri workshop and are planned the same way. The Dooars, Alipurduar and Cooch Behar are covered too.',
    faqs: [
      { q: 'Is there an AD JEET office in Jalpaiguri?', a: `No. The workshop and office are both in Siliguri, about ${JALPAIGURI_KM} km away in a straight line. Jalpaiguri jobs are made there and installed on a day agreed for each site.` },
      { q: 'Can you make matching signs for several branches in Jalpaiguri?', a: 'Yes. List each branch with its address, a frontage photo and the size. The team works from one approved layout and checks the mounting surface and power point for each site before production.' },
      { q: 'Can a Jalpaiguri sign be lit at night?', a: 'Yes. Glow sign boards and ACP boards with LED letters are both made to be lit; the Standard by Havells board on Agrasen Road is one example. Tell us where the nearest power point is and the hours the sign should stay on.' },
      { q: 'Do you cover Mal Bazar, Dhupguri and Maynaguri?', a: 'Yes. They are planned from the Siliguri workshop in the same way as Jalpaiguri itself. Send the exact location with your brief so delivery and fitting are part of the quote.' },
      { q: 'What should I send for a Jalpaiguri quote?', a: `Photos of the frontage or site, a location pin, the rough size and the date you need it. Send them on WhatsApp to ${business.phoneDisplay}, or use the form on this page; Jalpaiguri is already selected.` },
    ],
    indexable: true,
  },
  {
    slug: 'gangtok',
    name: 'Gangtok',
    state: 'Sikkim',
    region: 'Sikkim',
    coverageArea: 'Sikkim',
    leadCity: 'Gangtok',
    seoTitle: 'Sign Boards & ACP Signage in Gangtok, Sikkim',
    metaDescription: 'Glow sign boards, ACP signage and 3D LED letters for shops in Gangtok, made at AD JEET\'s Siliguri workshop and planned around hill access. What to send for a Sikkim quote.',
    headline: 'Sign boards for Gangtok and Sikkim.',
    lead: 'Glow signs, ACP fronts and LED letters for Gangtok shops, made at our Siliguri workshop and planned around the steps, lanes and hill roads between the van and your frontage.',
    // Gangtok is not one of the gallery's CitySlugs, which drive the portfolio
    // filter, so its photographs are found by the place recorded on them.
    photos: photos.filter(photo => photo.location === 'Gangtok'),
    coverPhotoId: 'havells-115',
    work: 'Sikkim is part of the area we cover from Siliguri. In Gangtok, the portfolio shows a Havells shop board over Jiten Electronics, photographed in 2025.',
    workCites: { clients: ['Havells'], places: ['Gangtok'], years: [2025, 2025] },
    trip: [
      `Gangtok is about ${GANGTOK_KM} km from our Siliguri workshop in a straight line, and the hill road is longer. Signs are made at the workshop and travel up finished, so the route from the road to your frontage matters as much as the frontage itself.`,
      'The brief needs to answer the questions the route will ask: how far the sign must be carried from the nearest point where a vehicle can stop, whether it fits up the steps or through the lane, what it will be fixed to and where the power comes from. Panel sizes are planned around those answers before anything is made.',
    ],
    trades: [
      { service: 'glow-sign-boards', brief: 'For a Gangtok glow sign, photograph the frontage from the road and from any steps or lane leading to the shop, since many hillside and market premises are reached on foot. Note the power point, the height above the walkway and any signage rules your building or market follows. The sign size, hill transport and fitting day are planned once the location is clear.' },
      { service: 'acp-led-signage', brief: 'For ACP signage or 3D LED letters in Gangtok, photograph the full facade, the fixing surface and the route from the nearest point where a vehicle can stop. Panel sizes may need to suit narrow roads and stairways. Share brand guidelines, the site pin and any building rules on exterior fixtures so the panel layout, fixing and transport can be quoted together.' },
    ],
    nearby: ['Rangpo', 'Singtam', 'Ranipool'],
    nearbyNote: 'Rangpo, Singtam and Ranipool, on the road up to Gangtok, are planned the same way. Darjeeling and Kalimpong are covered too.',
    faqs: [
      { q: 'Does AD JEET work in Gangtok?', a: 'Yes. Sikkim is part of the area we cover, and a Havells shop board in Gangtok, photographed in 2025, is in our portfolio. Gangtok work is made at the Siliguri workshop and taken up for installation on a day agreed for the site.' },
      { q: 'Is there an AD JEET office in Sikkim?', a: 'No. The workshop and office are both in Siliguri. Send your brief on WhatsApp or with the form on this page; there is no need to come to Siliguri to start.' },
      { q: 'Can a large sign reach a shop that is up a flight of steps?', a: 'Tell us the route from the nearest point where a vehicle can stop, with photos of any steps or narrow lanes. Panel sizes are planned to suit that route before anything is made, rather than discovered on the fitting day.' },
      { q: 'Do Gangtok buildings have rules about outside signs?', a: 'Some buildings and markets set their own rules for exterior signs and fixtures. Check with your landlord or market and share what they require, so the design follows it from the start.' },
      { q: 'What should I send for a Gangtok quote?', a: `Photos of the frontage from the road and from the steps or lane that lead to it, a site pin, the rough size and your target date. WhatsApp them to ${business.phoneDisplay}, or use the form on this page; Gangtok is already selected.` },
    ],
    // One documented job so far. The SEO plan indexes a town page from two, so
    // this one is `noindex, follow` and out of the sitemap until a second
    // Gangtok photograph is recorded in the gallery.
    indexable: false,
  },
]

export function getTown(slug: string): Town | undefined {
  return TOWNS.find(town => town.slug === slug)
}

export function townPath(town: Pick<Town, 'slug'>): string {
  return `/areas/${town.slug}`
}

/**
 * Every coverage place, grouped by the kind of trip it takes. Each place is in
 * exactly one group and every group carries the same kind of guidance, so the
 * list stays equal: no place is singled out above another.
 *
 * The hill and southern guidance carries what used to be the Darjeeling and
 * Malda pages' briefs.
 */
export interface AreaGroup {
  id: string
  title: string
  places: string[]
  guidance: string[]
}

export const AREA_GROUPS: AreaGroup[] = [
  {
    id: 'siliguri',
    title: 'Siliguri and around',
    places: ['Siliguri'],
    guidance: [
      'The workshop is here, so jobs in Siliguri and nearby Matigara, Bagdogra and Naxalbari are made and fitted from the same place. Each trade\'s page carries a Siliguri brief: what to photograph and what to send.',
    ],
  },
  {
    id: 'hills',
    title: 'The hills',
    places: ['Darjeeling', 'Kalimpong', 'Sikkim'],
    guidance: [
      'Hill sites are planned around access as much as the sign. Photograph the approach and the building as well as the frontage: stairs, narrow entrances, overhanging roofs, slopes and retaining walls, and the nearest point where a vehicle can stop. Panel sizes are chosen to suit that route.',
      'Tell us about weather exposure, any limits on fitting hours and where the power comes from. For flex, say whether the display is indoors, sheltered or exposed, and allow for printing, finishing and transport in the deadline. A pole sign on a slope needs a qualified site and structural assessment before any foundation or pole height is discussed; no standard foundation depth applies to every hill site.',
    ],
  },
  {
    id: 'plains',
    title: 'The plains and the Dooars',
    places: ['Jalpaiguri', 'The Dooars', 'Alipurduar', 'Cooch Behar'],
    guidance: [
      'Many jobs here cover more than one site: a brand\'s dealer outlets, a chain of branches or a fleet of vehicles. Send one list with the address, a frontage photo and the size for each site, and name each artwork file to match its site so shop names and phone numbers are never mixed up in a print run.',
      'Note rain cover, shared entrances and neighbouring signs that limit the space. When vehicles cannot leave service together, describe the fitting windows so the work can be staged.',
    ],
  },
  {
    id: 'south',
    title: 'The southern districts',
    places: ['North Dinajpur', 'South Dinajpur', 'Malda'],
    guidance: [
      'These are the farthest places we cover, so delivery and installation are confirmed as part of the quote rather than assumed from a standard dispatch schedule. Tell us whether the premises are already trading, when the entrance can be reached for fitting and the date you need the sign.',
      'For an outlet refresh, send the new artwork with a photo of the existing sign, list each size separately and say what is being removed or reused. For flex, say whether you need printed material only or installation as well, so packing, delivery and the handover point can be quoted clearly. For a pole sign, send photos from both approach directions and note overhead services and access for installation equipment.',
    ],
  },
]

/** The outermost reach ring, which every named place sits inside. */
export const OUTER_REACH_KM = REACH_RINGS_KM[REACH_RINGS_KM.length - 1]

export const AREAS_SEND_US = ['A location pin for each site', 'Photos of the frontage or site', 'Rough dimensions', 'Your target date']

export const AREAS_STEPS = [
  { title: 'Send the site', body: 'A location pin, a photo and a rough size are enough to start, wherever the site is.' },
  { title: 'Agree the job', body: 'Size, materials, artwork and the fitting day are settled with the quote, before anything is made.' },
  { title: 'Made in Siliguri', body: 'Cutting, printing, wiring and finishing happen at the workshop.' },
  { title: 'Fitted on site', body: 'The finished work travels out and is installed where people will see it.' },
]

export const AREAS_FAQS = [
  { q: 'Do you have branches outside Siliguri?', a: 'No. The workshop and office are both in Siliguri. Work for anywhere else in North Bengal and Sikkim is made there, then delivered and installed on a date agreed for each site.' },
  { q: 'How far do you travel to install?', a: `Every place on this page is within about ${OUTER_REACH_KM} km of the workshop in a straight line. If your site is not listed, send the location on WhatsApp and ask.` },
  { q: 'Can one trip cover several sites?', a: 'Send all the sites together, with an address, a photo and the size for each. Whether they can share a trip depends on the places and the dates, and the quote says how the work is arranged.' },
  { q: 'How are delivery and installation quoted outside Siliguri?', a: 'With the job, for your site and its access. Send the location in your first message so the quote covers the sign, delivery and fitting together.' },
]
