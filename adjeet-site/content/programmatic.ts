import { type CitySlug } from '@/content/cities'
import { getServiceBySlug } from '@/content/services'
import { business } from '@/lib/business'

// Gangtok has regional guides but no portfolio photographs yet, so it stays out
// of the gallery's CitySlug list and therefore out of the portfolio city filter.
export type ProgrammaticCity = CitySlug | 'gangtok'
export const PROG_SERVICES = ['glow-sign-boards', 'acp-led-signage', 'flex-printing', 'vehicle-branding', 'f-pole-installation'] as const
export type ProgrammaticService = (typeof PROG_SERVICES)[number]
export const CITY_LABELS: Record<ProgrammaticCity, string> = { siliguri: 'Siliguri', jalpaiguri: 'Jalpaiguri', 'cooch-behar': 'Cooch Behar', darjeeling: 'Darjeeling', malda: 'Malda', gangtok: 'Gangtok' }

/** The singular phrase buyers type, matching the page URL, and a plain name for the work. */
const SEARCH_TERMS: Record<ProgrammaticService, { phrase: string; work: string }> = {
  'glow-sign-boards': { phrase: 'Glow Sign Board', work: 'glow sign boards' },
  'acp-led-signage': { phrase: 'ACP & LED Sign Board', work: 'ACP and LED signage' },
  'flex-printing': { phrase: 'Flex Printing', work: 'flex prints and banners' },
  'vehicle-branding': { phrase: 'Vehicle Branding', work: 'vehicle branding' },
  'f-pole-installation': { phrase: 'F-Pole Sign', work: 'F-pole signs' },
}

/** Nearby towns people name in enquiries. Geography only, not branch or install claims. */
const NEARBY_AREAS: Record<ProgrammaticCity, string[]> = {
  siliguri: ['Matigara', 'Bagdogra', 'Naxalbari'],
  jalpaiguri: ['Mal Bazar', 'Dhupguri', 'Maynaguri'],
  'cooch-behar': ['Dinhata', 'Mathabhanga', 'Tufanganj'],
  darjeeling: ['Kurseong', 'Mirik', 'Sonada'],
  malda: ['English Bazar', 'Old Malda', 'Chanchal'],
  gangtok: ['Rangpo', 'Singtam', 'Ranipool'],
}

export interface ProgrammaticPage {
  service: ProgrammaticService
  city: ProgrammaticCity
  slug: string
  headline: string
  searchPhrase: string
  localBrief: string
  nearbyAreas: string[]
  faq: { q: string; a: string }
  relatedCities: ProgrammaticCity[]
}

// Existing routes retained. These are service-area planning guides, not claims
// of local branches, completed installations or guaranteed travel schedules.
const briefs: { service: ProgrammaticService; city: ProgrammaticCity; slug: string; localBrief: string }[] = [
  {"service": "glow-sign-boards", "city": "siliguri", "slug": "glow-sign-board-in-siliguri", "localBrief": "Share one straight-on photograph of your Siliguri shopfront and another from the approach customers use. Include the available sign width, shutters or awnings below it, and a photograph after dark if the business opens in the evening. These details help us discuss letter size, illumination and installation access before a site measurement."},
  {"service": "glow-sign-boards", "city": "jalpaiguri", "slug": "glow-sign-board-in-jalpaiguri", "localBrief": "For a Jalpaiguri glow sign, include the shopfront dimensions and photographs showing rain cover, nearby signs and the proposed power connection. If several branches need matching signs, list each address and size separately. This lets the team discuss a consistent layout while checking the mounting surface and electrical access at each site."},
  {"service": "glow-sign-boards", "city": "cooch-behar", "slug": "glow-sign-board-in-cooch-behar", "localBrief": "Planning a glow sign for a Cooch Behar shop or office? Show how the frontage looks from both directions, and note any shared entrance or neighbouring sign that limits the available space. Send the exact site location with the brief so transport, measurement and installation can be discussed together before production is booked."},
  {"service": "glow-sign-boards", "city": "darjeeling", "slug": "glow-sign-board-in-darjeeling", "localBrief": "For a Darjeeling glow sign project, photographs of the approach and access to the building matter as much as the frontage. Tell us about stairs, narrow entrances, overhanging roofs and where installers could work. Include the intended lighting hours and power location. We can then discuss the sign format and a site assessment before confirming the fitting plan."},
  {"service": "glow-sign-boards", "city": "malda", "slug": "glow-sign-board-in-malda", "localBrief": "If you need a glow sign in Malda, send a marked-up frontage photo with the wording, logo and approximate size. Tell us whether the premises are already trading and when the entrance can be accessed for fitting. Confirm delivery, installation and the target opening date as part of the quote rather than assuming a standard dispatch schedule."},
  {"service": "acp-led-signage", "city": "siliguri", "slug": "acp-led-signage-in-siliguri", "localBrief": "For a Siliguri ACP fascia, photograph the full frontage rather than only the existing name board. Mark shutters, pillars, doors and any lighting you want to retain. If you have a brand manual, include its colour and lettering requirements. We can discuss the panel layout, sign face and lighting as one storefront project."},
  {"service": "acp-led-signage", "city": "jalpaiguri", "slug": "acp-led-signage-in-jalpaiguri", "localBrief": "A Jalpaiguri ACP and LED brief should show the panel area, existing mounting surface and any water staining or damaged cladding. Include a close-up as well as a wider frontage photograph. This helps identify what needs measuring or inspecting before discussing panel finishes, illuminated lettering and the installation scope."},
  {"service": "acp-led-signage", "city": "cooch-behar", "slug": "acp-led-signage-in-cooch-behar", "localBrief": "For an ACP storefront in Cooch Behar, share the complete facade dimensions and identify which parts of the exterior you control. For a franchise or branch, send the approved brand artwork and any landlord requirements. Agree the panel joints, lettering and transport scope before fabrication so the proposed finish fits the actual site."},
  {"service": "acp-led-signage", "city": "darjeeling", "slug": "acp-led-signage-in-darjeeling", "localBrief": "For ACP and LED signage in Darjeeling, include photographs of the facade, roof edge and route from the unloading point to the installation area. Tell us about any restrictions on access or fitting hours. A site review is needed to discuss the support arrangement, weather exposure and practical panel sizes for transport and fitting."},
  {"service": "acp-led-signage", "city": "malda", "slug": "acp-led-signage-in-malda", "localBrief": "Planning a Malda outlet refresh with ACP and LED lettering? Send the new artwork alongside a photograph of the existing sign, and explain what is being removed or reused. For several outlets, list each size separately. Confirm the measurement process, packing, transport and installation sequence when the project scope is agreed."},
  {"service": "flex-printing", "city": "siliguri", "slug": "flex-printing-in-siliguri", "localBrief": "For flex printing in Siliguri, send the finished width and height, quantity and installation method with your artwork. A banner tied to a frame needs different finishing from one mounted onto a backing. Tell us whether you need collection, delivery or fitting, and give the actual event or opening date before requesting a production slot."},
  {"service": "flex-printing", "city": "jalpaiguri", "slug": "flex-printing-in-jalpaiguri", "localBrief": "Ordering flex banners for Jalpaiguri? Separate your indoor and outdoor placements in the brief, and list the dimensions and quantity for each. Send a photo of the mounting area if you also need fitting. Artwork approval, printing, finishing and delivery should all be included when confirming the date the banners are required."},
  {"service": "flex-printing", "city": "cooch-behar", "slug": "flex-printing-in-cooch-behar", "localBrief": "For a Cooch Behar flex campaign with several placements, prepare a simple list of locations, banner sizes and artwork versions. Mark which items need eyelets, hemming or mounting. A labelled artwork list helps prevent mixing up shop names, phone numbers or offers during a print run, especially when delivery is split between sites."},
  {"service": "flex-printing", "city": "darjeeling", "slug": "flex-printing-in-darjeeling", "localBrief": "For Darjeeling flex printing, tell us whether the display is indoors, sheltered or exposed, and show how it will be mounted. Include access details if installation is required. Confirm suitable media and fixing with the team, then allow for printing, finishing and transport in the deadline instead of treating print completion as the fitting date."},
  {"service": "flex-printing", "city": "malda", "slug": "flex-printing-in-malda", "localBrief": "For Malda flex orders, send the final artwork, finished sizes and a quantity list. If a campaign has several language or offer versions, name each file to match the order. Tell us whether you need printed material only or installation as well, so packing, delivery and the final handover location can be quoted clearly."},
  {"service": "vehicle-branding", "city": "siliguri", "slug": "vehicle-branding-in-siliguri", "localBrief": "For vehicle branding in Siliguri, send photographs of both sides, the front and the rear, together with the vehicle model and quantity. Show dents, repaired paint and existing graphics before requesting a wrap quote. Tell us when the vehicle can be taken off its route so inspection, artwork approval and application can be planned."},
  {"service": "vehicle-branding", "city": "jalpaiguri", "slug": "vehicle-branding-in-jalpaiguri", "localBrief": "A Jalpaiguri vehicle-branding brief should include the actual body dimensions and a photograph of each vehicle type. Two delivery vehicles with the same model name can have different body panels. List the intended branding areas and vehicle availability so the team can discuss fitting arrangements and avoid printing to an assumed template."},
  {"service": "vehicle-branding", "city": "cooch-behar", "slug": "vehicle-branding-in-cooch-behar", "localBrief": "For a Cooch Behar fleet, start with a vehicle list showing model, registration or internal ID, existing graphics and the proposed artwork version. If vehicles cannot leave service together, describe the available fitting windows. This makes it easier to discuss a staged plan and keep phone numbers, route names and brand elements consistent."},
  {"service": "vehicle-branding", "city": "darjeeling", "slug": "vehicle-branding-in-darjeeling", "localBrief": "For a Darjeeling vehicle-branding enquiry, send clear photographs of panel edges, curved surfaces and any existing film. Tell us where the vehicle will be available for inspection and application. The fitting plan depends on the surface condition and access to a suitable working area; confirm this before booking artwork production or downtime."},
  {"service": "vehicle-branding", "city": "malda", "slug": "vehicle-branding-in-malda", "localBrief": "For Malda vehicle branding, share the vehicle model, body dimensions and a separate photo for each side that needs graphics. For a fleet, flag vehicles with different bodies or older paint. Include the route schedule and preferred fitting location so travel arrangements, inspection and application can be agreed alongside the artwork."},
  {"service": "f-pole-installation", "city": "siliguri", "slug": "f-pole-installation-in-siliguri", "localBrief": "For an F-pole enquiry in Siliguri, send a location pin and wide photographs showing the proposed position, approach road and nearby buildings. Note overhead wires, existing structures and available access. The pole, foundation and sign face need a site-specific assessment; a photograph alone is not enough to confirm a structure or installation price."},
  {"service": "f-pole-installation", "city": "jalpaiguri", "slug": "f-pole-installation-in-jalpaiguri", "localBrief": "For an F-pole sign in Jalpaiguri, identify the proposed plot position and the directions from which people should read it. Include available site drawings and photographs showing access for installation. Landowner consent, any required permissions and a structural assessment need to be discussed before a pole size, foundation or fitting schedule is confirmed."},
  {"service": "f-pole-installation", "city": "cooch-behar", "slug": "f-pole-installation-in-cooch-behar", "localBrief": "For a Cooch Behar roadside or entrance sign, show the proposed position in relation to the property boundary, entrance and any existing structures. Provide an exact location and explain who controls the land. The brief should cover permissions, site assessment, foundation work, transport and installation so the complete scope can be reviewed together."},
  {"service": "f-pole-installation", "city": "darjeeling", "slug": "f-pole-installation-in-darjeeling", "localBrief": "For an F-pole project in Darjeeling, provide an exact location and photographs showing the slope, retaining structures and installation access. A qualified site and structural assessment is needed before discussing a foundation or pole height. Send any available drawings with the enquiry; no standard foundation depth or wind-performance claim applies to every hill site."},
  {"service": "f-pole-installation", "city": "malda", "slug": "f-pole-installation-in-malda", "localBrief": "For a Malda F-pole enquiry, send a site pin, photographs from both approach directions and any available plot or entrance drawings. Note overhead services and access for installation equipment. Ask for the quote to identify design, permissions, civil work, fabrication, transport and fitting responsibilities before committing to a production or installation date."},
  // Sikkim guides: the company profile lists Gangtok and Rangpo installs.
  {"service": "glow-sign-boards", "city": "gangtok", "slug": "glow-sign-board-in-gangtok", "localBrief": "For a Gangtok glow sign, photograph the frontage from the road and from any steps or lane leading to the shop, since many hillside and market premises are reached on foot. Note the power point, the height above the walkway and any signage rules your building or market follows. The sign size, hill transport and fitting day are planned once the location is clear."},
  {"service": "acp-led-signage", "city": "gangtok", "slug": "acp-led-signage-in-gangtok", "localBrief": "For ACP signage or 3D LED letters in Gangtok, photograph the full facade, the fixing surface and the route from the nearest point where a vehicle can stop. Panel sizes may need to suit narrow roads and stairways. Share brand guidelines, the site pin and any building rules on exterior fixtures so the panel layout, fixing and transport can be quoted together."},
]

/** The other entries, read in declared order starting after `from` and wrapping. */
function rotateFrom(all: ProgrammaticCity[], from: ProgrammaticCity): ProgrammaticCity[] {
  const start = all.indexOf(from)
  if (start === -1) return all.filter(city => city !== from)
  return all.slice(start + 1).concat(all.slice(0, start))
}

export const programmaticPages: ProgrammaticPage[] = briefs.map(brief => {
  const service = getServiceBySlug(brief.service)!
  const city = CITY_LABELS[brief.city]
  const { phrase, work } = SEARCH_TERMS[brief.service]
  const nearbyAreas = NEARBY_AREAS[brief.city]
  const nearbyList = `${nearbyAreas.slice(0, -1).join(', ')} and ${nearbyAreas.at(-1)}`
  // There used to be a templated `body` paragraph here, identical on all 27
  // pages with the service and city swapped in. It opened every page, which
  // meant every page opened with the one paragraph that proved nothing. The
  // hand-written `localBrief` leads instead, and the JSON-LD description reads
  // from it too, so the schema describes content a visitor can actually see.
  return {
    ...brief,
    headline: `${service.name} in ${city}`,
    searchPhrase: phrase,
    nearbyAreas,
    faq: {
      q: `Can AD JEET handle ${work} for a site in ${city}?`,
      a: `Yes. Design and fabrication happen at our Siliguri workshop, and delivery and installation in ${city} are agreed for each site, including nearby areas such as ${nearbyList}. Send the exact location, site photos, approximate size and target date on WhatsApp at ${business.phoneDisplay} for a project quote.`,
    },
    // Siblings in rotated declared order, starting from the city after this
    // one. The page caps the list at three.
    //
    // There is no city-to-city distance data to sort by; `coverage-places.ts`
    // knows distance from Siliguri only, which cannot order Gangtok against
    // Malda for a visitor in Darjeeling. Plain declared order would be stable
    // but would also orphan Gangtok: it sorts last, so it would never survive
    // a top-three cut and the two Sikkim pages would receive no lateral links
    // at all. Rotating spreads the links evenly across the set and keeps the
    // result deterministic per page.
    relatedCities: rotateFrom(Object.keys(CITY_LABELS) as ProgrammaticCity[], brief.city),
  }
})

export function getProgrammaticPage(slug: string): ProgrammaticPage | undefined {
  return programmaticPages.find(page => page.slug === slug)
}

export function getProgrammaticSlugs(): string[] {
  return programmaticPages.map(page => page.slug)
}
