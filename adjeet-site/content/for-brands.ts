import type { ServiceSlug } from '@/content/services'

/**
 * /for-brands: for regional, zonal and trade marketing teams (approved by the
 * owner on 20 October 2026; SEO plan S5, S6).
 *
 * Recorded facts only. What AD JEET makes and where comes from
 * content/services.ts and lib/business.ts; how a rollout is sent in restates
 * the /areas guidance; brands are named only where content/gallery.ts holds
 * their photographs (tests/unit/app/for-brands-page.test.tsx checks it). The
 * process is written as what a brand team can ask for, never as past numbers.
 * No prices, reply times, site visits, capacities or client counts.
 */

export const FOR_BRANDS_PATH = '/for-brands'

export const FOR_BRANDS_PAGE = {
  title: 'Outdoor Advertising Agency in Siliguri for Dealer Boards',
  description: 'Dealer boards, in-shop branding, wall paintings, vehicle graphics and Puja gates for brands. Made in Siliguri, fitted across North Bengal and Sikkim.',
  path: FOR_BRANDS_PATH,
}

export const FOR_BRANDS_LEAD =
  'Dealer boards, in-shop branding, wall painting, vehicle graphics and Puja gates for regional, zonal and trade marketing teams. Made at our Siliguri workshop, fitted across North Bengal and Sikkim.'

/** The message a brand team sends. They edit it before it goes. */
export const FOR_BRANDS_WHATSAPP_MESSAGE =
  'Hi AD JEET, I am on a brand or trade marketing team and want to send an outlet list for a rollout. Can we discuss it?'

export const FOR_BRANDS_INTRO = [
  'This page is for the people who brief outlet branding: regional and zonal marketing managers, trade marketing teams and the agencies that work for them. You hold a dealer list, a design kit from head office and a date to meet. AD JEET turns that list into boards, wall paintings and branded interiors, one outlet at a time.',
  'AD JEET has worked from Siliguri since 1990. Boards, panels and graphics are made at our own workshop at Patiram Jote, then taken out and fitted where the dealer trades, and wall paintings are done on the wall itself. That reaches the plains and the Dooars, the hills, the southern districts down to Malda, and Sikkim. The workshop and the office are both in Siliguri, so the whole list is handled from one place.',
]

export interface BrandTrade {
  title: string
  body: string
  links: { slug: ServiceSlug; label: string }[]
}

export const BRAND_TRADES: BrandTrade[] = [
  {
    title: 'Dealer boards',
    body: 'The board over a dealer or retailer counter, as printed flex, a glow sign board or an ACP panel with 3D letters. Each one carries your brand with that dealer\'s own name and phone number.',
    links: [
      { slug: 'flex-printing', label: 'Flex boards' },
      { slug: 'glow-sign-boards', label: 'Glow sign boards' },
      { slug: 'acp-led-signage', label: 'ACP and 3D LED letters' },
    ],
  },
  {
    title: 'In-shop branding',
    body: 'Wall graphics, counter fascias, backlit panels and display headers inside the outlet, made to the brand manual your head office supplies.',
    links: [{ slug: 'in-shop-branding', label: 'In-shop branding' }],
  },
  {
    title: 'Wall painting advertising',
    body: 'Your message painted by hand on walls along highways and in village markets, where a frame or a light cannot be fixed.',
    links: [{ slug: 'wall-painting', label: 'Wall painting advertising' }],
  },
  {
    title: 'Vehicle graphics',
    body: 'Printed wraps and cut-vinyl lettering for delivery vans, trucks, transit mixers, autos and e-rickshaws that carry the brand on the road.',
    links: [{ slug: 'vehicle-branding', label: 'Vehicle branding' }],
  },
  {
    title: 'Puja gate branding',
    body: 'Sponsor gates, arches and pillars for Durga Puja and for dealer events. Your brand and the committee agree the sponsorship; AD JEET builds and fits the structure.',
    links: [{ slug: 'events-and-puja', label: 'Puja and event branding' }],
  },
]

export const ROLLOUT_STEPS = [
  {
    title: 'One outlet list',
    body: 'Put every outlet in a single list: the dealer\'s name, the address or a location pin, and a number to call on the fitting day.',
  },
  {
    title: 'A frontage photo and a size for each',
    body: 'Photograph each frontage straight on and add the width and height of the space. Where nobody has measured yet, the photo still lets the job be planned.',
  },
  {
    title: 'Artwork named per outlet',
    body: 'Name every artwork file after its outlet, so no dealer ends up with another shop\'s name or phone number on the board.',
  },
  {
    title: 'Made in Siliguri, fitted on site',
    body: 'Printing and fabrication happen at the workshop, and wall paintings on the wall itself. The finished work then goes out outlet by outlet, on dates agreed with your team.',
  },
]

/** What a brand team can ask for. Offers, not records of past jobs. */
export const ON_REQUEST = [
  'Photo reports for each outlet, on request',
  'Vendor documents for your empanelment, on request',
  'Staged fitting when outlets cannot all be reached on one trip',
  'Artwork set to each dealer\'s name from your master design',
]

/** Named on the page; each has photographs in content/gallery.ts. */
export const BRANDS_PHOTOGRAPHED = ['Captain TMT Bar', 'Supreme Pipe', 'Star Cement', 'Toptech TMT', 'Havells', 'ACC']

/** Brand work shown on the page, one or two per trade, by gallery id. */
export const BRAND_PHOTO_IDS = [
  'captain-tmt-bar-144',
  'supreme-pipe-107',
  'supreme-pipe-110',
  'toptech-tmt-040',
  'star-cement-135',
  'star-cement-137',
  'star-cement-132',
  'supreme-pipe-085',
]

export const FOR_BRANDS_FAQS = [
  {
    q: 'Can AD JEET brand all our dealer outlets in North Bengal?',
    a: 'Send the outlet list with a frontage photo and a size for each outlet. AD JEET makes the boards at its Siliguri workshop and plans the fitting outlet by outlet, across North Bengal and Sikkim. How the work is staged depends on the places and the dates, and the quote sets that out.',
  },
  {
    q: 'Can you work from our head office design kit?',
    a: 'Yes. Send the brand manual or the approved kit along with the outlet list. Each board or interior is planned to that kit with the dealer\'s own name and number, and shared with your team for approval before anything is made.',
  },
  {
    q: 'Can we get a photo of each outlet once it is fitted?',
    a: 'Yes. Ask for photo reports when you send the list, and a photograph of each finished outlet comes back with the job. Your team can then check the work without travelling to every site.',
  },
  {
    q: 'Can you share vendor documents for our empanelment?',
    a: 'Yes, vendor documents are available on request. When you first write, say which documents your company\'s vendor process asks for, and they can be shared along with the quote.',
  },
]
