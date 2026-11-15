import { SERVICE_SEARCH, type ServiceSearch } from '@/content/service-search'
import { jobDaysLabel } from '@/content/company-figures'

/** The approved job time for a trade listed in content/company-figures.ts. */
function jobDays(slug: ServiceSlug): string {
  const label = jobDaysLabel(slug)
  if (!label) throw new Error(`services: no job time for ${slug}`)
  return label
}

export const SERVICE_SLUGS = [
  'glow-sign-boards',
  'acp-led-signage',
  'flex-printing',
  'vehicle-branding',
  'wall-painting',
  'f-pole-installation',
  'in-shop-branding',
  'events-and-puja',
  'one-way-vision',
  'product-display',
] as const

export type ServiceSlug = (typeof SERVICE_SLUGS)[number]

export interface Service extends Omit<ServiceSearch, 'faqs'> {
  slug: string
  name: string
  tagline: string
  description: string
  materials: string[]
  sizes: string[]
  turnaround: string
  faqs: { q: string; a: string }[]
  relatedServices: ServiceSlug[]
  heroImage: string
  icon: string
}

type ServiceBase = Omit<Service, Exclude<keyof ServiceSearch, 'faqs'>>

const baseServices: ServiceBase[] = [
  {
    slug: 'glow-sign-boards',
    name: 'Glow Sign Boards',
    tagline: 'Lit name boards for shops, clinics and dealer outlets',
    description:
      'LED-lit shop name boards, made at our Siliguri workshop. A printed flex, acrylic or ACP face sits on a metal frame with LEDs inside, so the name can be read after dark. Sizes run from a single shopfront board to a large hoarding.',
    materials: ['Acrylic', 'ACP sheet', 'Aluminium channel letters', 'LED strip (SMD)', 'MS frame'],
    sizes: ['1×2 ft', '2×4 ft', '3×6 ft', '4×8 ft', 'Custom hoarding size'],
    turnaround: jobDays('glow-sign-boards'),
    faqs: [
      {
        q: 'How long do the LED strips last?',
        a: 'LED life depends on the LED modules, the driver, the ventilation and the hours the sign is lit each day. Before you order, ask AD JEET to write down the parts used and what the warranty covers.',
      },
      {
        q: 'Can you install on a second-floor facade?',
        a: 'Send a photo of the frontage and say which floor the sign goes on. Installation at height is planned for each site.',
      },
      {
        q: 'Do glow signs work during power cuts?',
        a: 'Standard glow signs require mains power. We can integrate an inverter or UPS connection on request, ideal for hospital or pharmacy signage.',
      },
      {
        q: 'What warranty do you offer?',
        a: 'Warranty depends on the parts and the job. Before you order, ask AD JEET to write down what is covered and for how long.',
      },
    ],
    relatedServices: ['acp-led-signage', 'f-pole-installation', 'in-shop-branding'],
    heroImage: '/images/work/havells-glow-sign-015.webp',
    icon: 'lightbulb',
  },
  {
    slug: 'acp-led-signage',
    name: 'ACP & LED Signage',
    tagline: 'ACP fronts and 3D LED letters for showrooms and branches',
    description:
      'Aluminium Composite Panel (ACP) cladding combined with LED module lighting creates the clean, premium look demanded by banks, telecom showrooms, and retail chains. We cut, route, and bond ACP to precise dimensions, then back-light or face-light with uniform LED modules. The result is a clean, flat face that reads well from a distance.',
    materials: ['ACP sheet (grade agreed per project)', 'LED modules', 'Aluminium extrusion', 'PVC flex backing', 'Stainless steel fixings'],
    sizes: ['Custom sizing from 2 sq ft to full building facade'],
    turnaround: jobDays('acp-led-signage'),
    faqs: [
      {
        q: 'Which ACP brands do you work with?',
        a: 'The ACP brand, grade, finish and intended use should be agreed for your project. Send any brand specifications with your brief so the team can confirm availability and quote the appropriate panel.',
      },
      {
        q: 'Can you match a brand\'s exact Pantone colour?',
        a: 'Yes. We use UV-stable vinyl wrap or powder-coated finishes to match brand colour standards provided by your agency.',
      },
      {
        q: 'Is ACP signage suitable for the Darjeeling hill area?',
        a: 'Yes, with appropriate weather-sealed fixings and stainless hardware to handle humidity and temperature swings at altitude.',
      },
    ],
    relatedServices: ['glow-sign-boards', 'in-shop-branding', 'f-pole-installation'],
    heroImage: '/images/work/acc-acp-125.webp',
    icon: 'panels',
  },
  {
    slug: 'flex-printing',
    name: 'Flex Printing',
    tagline: 'Printed flex for hoardings, shopfronts and event walls',
    description:
      'High-resolution flex banner and vinyl printing for hoardings, retail backdrops, event walls, and temporary signage. We print on 280 gsm and 440 gsm flex media using UV-resistant solvent inks, then eyelet, hem, or mount to your specification. Confirm the media, finishing and required date with the team before production.',
    materials: ['280 gsm frontlit flex', '440 gsm blockout flex', 'One-way vision vinyl', 'Matte/gloss vinyl sticker'],
    sizes: ['A3 to 40×10 ft continuous roll, custom cut to order'],
    turnaround: '1 to 3 working days',
    faqs: [
      {
        q: 'What file format should I send?',
        a: 'PDF at 1:1 scale (72 to 100 dpi for large format) or AI/CDR with fonts outlined. We can also work from high-res JPG/PNG.',
      },
      {
        q: 'Can you design the artwork as well?',
        a: 'Yes. Our in-house design team can create or adapt artwork for an additional design fee. Send references and content and we will quote.',
      },
      {
        q: 'How do I calculate the cost?',
        a: 'Flex printing is priced per square foot plus media grade. Contact us on WhatsApp with dimensions, quantity, finishing and delivery requirements for a project quote.',
      },
    ],
    relatedServices: ['vehicle-branding', 'events-and-puja', 'one-way-vision'],
    heroImage: '/images/work/captain-tmt-bar-shop-board-072.webp',
    icon: 'print',
  },
  {
    slug: 'vehicle-branding',
    name: 'Vehicle Branding',
    tagline: 'Wraps and lettering for vans, autos, buses and fleets',
    description:
      'Full and partial vehicle wraps that turn cars, auto-rickshaws, buses and delivery vans into moving advertising. We use calendered and cast vinyl films, cut-vinyl lettering, and printed wraps, applied by hand across the vehicle\'s curves and edges. Ideal for fleet owners, FMCG brands, and election campaigns across North Bengal.',
    materials: ['Cast vinyl wrap film', 'Calendered vinyl', 'Cut vinyl lettering', 'Laminate (matte/gloss)'],
    sizes: ['Auto-rickshaw panels', 'Car partial/full', 'Bus full-wrap', 'Truck side panels'],
    turnaround: '2 to 5 working days per vehicle',
    faqs: [
      {
        q: 'Will the wrap damage my vehicle\'s original paint?',
        a: 'Removal depends on the film, paint condition, age and previous repairs. Share surface photographs and arrange an inspection; paint safety and residue-free removal cannot be guaranteed for every vehicle.',
      },
      {
        q: 'Can you brand a fleet of 20 vehicles?',
        a: 'Send the vehicle count, models, artwork versions and available fitting windows. The team will confirm capacity, application arrangements and a quote for the complete fleet.',
      },
      {
        q: 'How long does the wrap last outdoors in North Bengal\'s climate?',
        a: 'Outdoor life varies with the chosen film, lamination, sunlight, cleaning and surface condition. Confirm the material specification and care guidance for your vehicle rather than relying on a single lifespan for every wrap.',
      },
    ],
    relatedServices: ['flex-printing', 'in-shop-branding', 'one-way-vision'],
    heroImage: '/images/work/srmb-vehicle-143.webp',
    icon: 'truck',
  },
  {
    slug: 'wall-painting',
    // "Advertising" is part of the name: searches for house painting were
    // landing on this page, and it is brand advertising, not decorating.
    name: 'Wall Painting Advertising',
    tagline: 'Hand-painted brand walls for towns, highways and villages',
    description:
      'Hand-painted and stencil-painted wall advertising for rural markets, highways, and peri-urban areas where flex and backlit signs are impractical. Our painters use exterior-grade enamel and weather-shield paints that withstand monsoon rain and humidity. The wall location, surface condition, owner permission and any applicable local requirements should be checked before a campaign is scheduled.',
    materials: ['Exterior enamel paint', 'Weather-shield emulsion', 'Primer', 'Stencil film'],
    sizes: ['10 sq ft to 500+ sq ft wall area'],
    turnaround: jobDays('wall-painting'),
    faqs: [
      {
        q: 'Do you obtain wall permission from owners?',
        a: 'We can assist in negotiating wall permission. The client is responsible for any permission fees; we handle the logistics and documentation support.',
      },
      {
        q: 'How many years does wall painting last?',
        a: 'It depends on the paint, the wall surface and the weather. Ask AD JEET which paint will be used on your wall.',
      },
      {
        q: 'Can you repaint an existing old wall ad?',
        a: 'Yes. We assess the substrate condition and apply appropriate primer before repainting. An additional cost applies for heavy surface preparation.',
      },
    ],
    relatedServices: ['flex-printing', 'f-pole-installation', 'vehicle-branding'],
    heroImage: '/images/work/sel-tmt-wall-painting-058.webp',
    icon: 'paint-roller',
  },
  {
    slug: 'f-pole-installation',
    name: 'F-Pole Installation',
    tagline: 'Roadside pole signs for outlets, fuel stations and hospitals',
    description:
      'Fabrication and installation of F-pole (flag pole) sign structures that hold a brand name high above the road along highways, commercial corridors, and roundabouts. We design and weld custom MS/GI pole structures, anchor them with concrete foundations sized for local wind loads, and mount illuminated or non-illuminated sign faces. Suitable applications include entrance and roadside identification for fuel stations, hospitals, hotels and shops, subject to a site assessment.',
    materials: ['MS hollow section (pole)', 'GI pipe', 'RCC foundation', 'ACP/flex sign face', 'LED floodlight (optional)'],
    sizes: ['10 ft to 40 ft pole height, single or double arm'],
    turnaround: jobDays('f-pole-installation'),
    faqs: [
      {
        q: 'Do you handle permissions for roadside structures?',
        a: 'We guide you through the municipal or NHAI permission process. Approval timelines depend on the authority; fabrication begins once permission is in hand.',
      },
      {
        q: 'Can the pole withstand Nor\'wester storms?',
        a: 'Wind performance depends on the site, sign area, pole and foundation design. A qualified structural assessment is needed for the proposed installation; ask for the applicable design specification and inspection plan before approving the work.',
      },
      {
        q: 'Can I change the sign face later without replacing the pole?',
        a: 'Yes, if it is planned at the start. Say so in your brief, so the mounting lets a new face be fitted to the same pole later.',
      },
    ],
    relatedServices: ['glow-sign-boards', 'acp-led-signage', 'flex-printing'],
    heroImage: '/images/work/captain-tmt-bar-f-pole-148.webp',
    icon: 'flag-pole',
  },
  {
    slug: 'in-shop-branding',
    name: 'In-Shop Branding',
    tagline: 'Counter, wall and display branding inside outlets',
    description:
      'Interior branding for retail outlets, showrooms, restaurants, and offices, from wall graphics and product display headers to hanging banners, directional signage, and branded counter fascias. We handle concept-to-installation so the finished space is consistent with your brand guidelines. Discuss a single outlet or a multi-site rollout with the team, including access, artwork and installation scope.',
    materials: ['ACP panels', 'Backlit acrylic', 'Vinyl wall graphics', 'Foam board', 'Hanging display systems'],
    sizes: ['Single counter to full-store rollout'],
    turnaround: jobDays('in-shop-branding'),
    faqs: [
      {
        q: 'Can you work outside business hours to avoid disruption?',
        a: 'Say when the outlet is closed or quiet, and the fitting can be planned around those hours. The timing is agreed for each site.',
      },
      {
        q: 'Do you handle multiple outlet rollouts simultaneously?',
        a: 'Share the outlet list, sizes and target dates. The team will confirm capacity and whether a phased or parallel installation schedule is practical for your project.',
      },
      {
        q: 'Can you match my HO-supplied brand kit?',
        a: 'Yes. Send the brand guidelines and the size of each site. The work is planned to your kit and shared with you for approval before anything is made.',
      },
    ],
    relatedServices: ['acp-led-signage', 'glow-sign-boards', 'product-display'],
    heroImage: '/images/work/supreme-pipe-in-shop-110.webp',
    icon: 'store',
  },
  {
    slug: 'events-and-puja',
    name: 'Events & Puja Decoration',
    tagline: 'Puja gates, stage backdrops and event branding',
    description:
      'Signage and decoration for Durga Puja pandals, corporate events, product launches, and public celebrations across North Bengal. We supply stage backdrops, entrance arches, flex banners, directional signage, LED flex borders, and themed props, all fabricated in our Siliguri workshop and installed on-site. Share the venue, event date and setup requirements to discuss a coordinated production and installation plan.',
    materials: ['Flex print backdrop', 'MS arch frame', 'LED pixel strip', 'Thermocol prop', 'Fabric draping'],
    sizes: ['10×10 ft stall to full pandal/stage setup'],
    turnaround: '3 to 10 working days (varies by event scale)',
    faqs: [
      {
        q: 'Do you handle Durga Puja pandal decoration?',
        a: 'Yes. Send the venue, theme, dimensions, setup date and dismantling requirements. Seasonal availability and the final scope must be confirmed with the team before booking.',
      },
      {
        q: 'Can you handle an urgent event?',
        a: 'Call with the artwork, dimensions, quantity and event deadline. The team must confirm material availability, production capacity, transport and installation before accepting an urgent date.',
      },
      {
        q: 'Do you dismantle and remove after the event?',
        a: 'Yes. Dismantling and removal can be included in the project quote. We are familiar with post-Puja cleanup timelines in the region.',
      },
    ],
    relatedServices: ['flex-printing', 'in-shop-branding', 'wall-painting'],
    heroImage: '/images/work/supreme-pipe-event-085.webp',
    icon: 'sparkles',
  },
  {
    slug: 'one-way-vision',
    name: 'One-Way Vision',
    tagline: 'Printed window film that can be seen through from inside',
    description:
      'Perforated vinyl film that lets your brand show prominently from outside while retaining a view through the perforations from inside, ideal for shopfront glazing, vehicle rear windows, and glass partition branding. We print on 50/50 perforation vinyl (50% ink, 50% clear holes) using high-resolution solvent printing, then cut and apply to glass surfaces. Visibility depends on the film, lighting and placement. Discuss the intended view and any restrictions before application.',
    materials: ['50/50 perforated vinyl', 'Window application film', 'Solvent print ink'],
    sizes: ['Custom cut to glass dimensions'],
    turnaround: '3 to 5 working days',
    faqs: [
      {
        q: 'How visible is the image from outside?',
        a: 'On 50/50 perf vinyl, the image is bold and legible at 1 to 2 metres distance in normal daylight. At night, interior lighting can reduce exterior visibility. We can advise on placement.',
      },
      {
        q: 'Can one-way vision be applied to curved glass?',
        a: 'It works best on flat glass. For mildly curved surfaces we use short-grain vinyl. Highly curved auto glass requires a curved-surface specialist application.',
      },
      {
        q: 'Is it removable?',
        a: 'Removal depends on the film, adhesive, age and glass condition. Ask for the selected film specification and removal guidance; an inspection may be needed for older installations.',
      },
    ],
    relatedServices: ['vehicle-branding', 'in-shop-branding', 'flex-printing'],
    heroImage: '/images/home/materials.webp',
    icon: 'eye',
  },
  {
    slug: 'product-display',
    name: 'Product Display',
    tagline: 'Standees, shelf talkers and display units for retail',
    description:
      'Custom point-of-sale (POS) and point-of-purchase (POP) display units, such as standees, wobbler holders, shelf talkers, product glorifiers, and freestanding display units (FSDUs). We fabricate in acrylic, foam board, ACP, and MS/GI metal, then print and finish in-house, so one vendor makes the whole unit. Widely used by FMCG brands, electronics retailers, and pharma companies for product launches and seasonal promotions across North Bengal distribution channels.',
    materials: ['Acrylic sheet', 'Foam board (5/10 mm)', 'ACP', 'MS/GI metal frame', 'UV-print laminate'],
    sizes: ['A5 shelf talker to 6 ft freestanding unit'],
    turnaround: '5 to 10 working days',
    faqs: [
      {
        q: 'Can you manufacture 500 identical standees for a pan-Bengal campaign?',
        a: 'Send the quantity, artwork, dimensions, materials and delivery locations. The team will confirm a sample or prototype process, production capacity and schedule before accepting a bulk order.',
      },
      {
        q: 'Do you ship to distributors outside Siliguri?',
        a: 'Share the destination, quantity and whether the units should arrive assembled or packed flat. Delivery availability, packing, freight costs and timing are confirmed as part of the quote.',
      },
      {
        q: 'Can you add QR codes or scratch-card elements?',
        a: 'Yes. UV-printed QR codes, tear-off pads, and scratch elements can all be integrated into the display design.',
      },
    ],
    relatedServices: ['in-shop-branding', 'acp-led-signage', 'flex-printing'],
    heroImage: '/images/work/havells-display-116.webp',
    icon: 'display',
  },
]

// Search phrasing lives in content/service-search.ts. Its buyer questions come
// first because they match what people ask before they know the trade terms.
export const services: Service[] = baseServices.map(service => {
  const { faqs, ...search } = SERVICE_SEARCH[service.slug as ServiceSlug]
  return { ...service, ...search, faqs: [...faqs, ...service.faqs] }
})

export function getServiceBySlug(slug: ServiceSlug): Service | undefined {
  return services.find(s => s.slug === slug)
}
