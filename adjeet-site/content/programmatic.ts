export interface ProgrammaticPage {
  service: string
  city: string
  slug: string
  headline: string
  body: string
  stats: { label: string; value: string }[]
  relatedCities: string[]
}

const CITIES = ['siliguri', 'jalpaiguri', 'cooch-behar', 'darjeeling', 'malda'] as const
const PROG_SERVICES = ['glow-sign-board', 'acp-led-signage', 'flex-printing', 'vehicle-branding', 'f-pole-installation'] as const

export type ProgrammaticCity = (typeof CITIES)[number]
export type ProgrammaticService = (typeof PROG_SERVICES)[number]

export const programmaticPages: ProgrammaticPage[] = [
  // ── Glow Sign Board ──────────────────────────────────────────────────
  {
    service: 'glow-sign-board',
    city: 'siliguri',
    slug: 'glow-sign-board-in-siliguri',
    headline: 'Glow Sign Boards in Siliguri — Illuminate Your Business on Hill Cart Road',
    body: `Siliguri is the commercial gateway to North Bengal, Sikkim, Bhutan, and Northeast India. Hill Cart Road, Sevoke Road, and the Bidhan Market corridor see some of the highest footfall in the region, making high-visibility signage essential for any business that wants to stand out. Whether you run a pharmacy near Bengal Club More or a showroom on Sevoke Road, a well-lit glow sign board is often the first thing a potential customer sees.

AD-JEET has been designing, fabricating, and installing glow sign boards in Siliguri since 1990 — before the city's commercial expansion truly began. We have installed signage for pharmacies, clothing retailers, telecom showrooms, restaurants, hospitals, and logistics companies across every commercial zone in the city. Our familiarity with Siliguri's building stock, municipal regulations, and power-supply characteristics means we can advise on the right sign type, orientation, and electrical setup for your specific location.

Our Siliguri glow sign board service covers ACP-framed backlit panels, acrylic channel letters, neon-effect LED tubes, and combination sign systems. Every sign is fabricated at our Patiram Jote workshop using SMD LED strips rated for 30,000+ hours, weatherproofed junction boxes, and ISI-certified electrical drivers that handle the voltage fluctuations common in North Bengal's grid.

Installation is handled by our own team — not outsourced subcontractors — with proper scaffolding and safety equipment for elevated facades. We typically complete Siliguri installations within 5–7 working days of artwork approval. Post-installation, we offer a one-year warranty on LED components and fabrication workmanship.

If you are a new business setting up in Siliguri or an established brand refreshing your exterior signage, contact AD-JEET on WhatsApp for a same-day site visit and quote. We cover the entire Siliguri Municipal Corporation area including Matigara, Naxalbari, and Bagdogra approaches.`,
    stats: [
      { label: 'Years in Siliguri', value: '35+' },
      { label: 'Signs installed', value: '200+' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'glow-sign-board',
    city: 'jalpaiguri',
    slug: 'glow-sign-board-in-jalpaiguri',
    headline: 'Glow Sign Boards in Jalpaiguri — Expert Signage for the Tea Garden Gateway',
    body: `Jalpaiguri town sits at the intersection of NH-27 and the rail corridor linking Siliguri with Assam, making it a natural commercial hub for the Dooars region. The Dinbazar market area, Station Road, and the newer commercial strips along the bypass see daily footfall from traders, tea garden workers, and travelers — a mixed audience that makes clear, eye-catching signage essential.

AD-JEET has been serving businesses in Jalpaiguri since the early 1990s, installing glow sign boards for pharmacies, cloth merchants, hardware stores, microfinance branches, and telecom outlets throughout the town. We understand Jalpaiguri's building typology — the older pucca-fronted shops in Dinbazar, the newer concrete commercial buildings on the bypass — and design signage structures appropriate for each substrate.

Our glow sign boards for Jalpaiguri use SMD LED strips and weather-sealed drivers designed to handle the higher humidity of the Dooars foothills. Monsoon rainfall here is significantly heavier than in Siliguri, so we pay particular attention to IP-rated junction boxes and proper cable routing to prevent water ingress. All poles and MS frames are hot-dip galvanised or painted with rust-inhibiting primer before installation.

We typically schedule Jalpaiguri installations on a weekly visit basis — our team is in town regularly and can combine site visits with installation runs to reduce wait times. A standard glow sign board in Jalpaiguri is ready within 7–10 working days of order confirmation.

Contact AD-JEET on WhatsApp to arrange a free site measurement and quote for your Jalpaiguri premises.`,
    stats: [
      { label: 'Districts covered', value: '15+' },
      { label: 'Turnaround', value: '7–10 days' },
      { label: 'Est.', value: '1990' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'glow-sign-board',
    city: 'cooch-behar',
    slug: 'glow-sign-board-in-cooch-behar',
    headline: 'Glow Sign Boards in Cooch Behar — Bright Signage for a Royal Town',
    body: `Cooch Behar is a distinct market with its own commercial character — the areas around the Sagar Dighi market, RN Road, and Rasikbeel Road host a dense mix of retail, banking, and services catering to both the town and surrounding rural blocks. The royal heritage of Cooch Behar and the tourism footfall around the Rajbari add a premium dimension to the retail environment that demands professional-quality signage.

AD-JEET has executed glow sign board projects in Cooch Behar for pharmacies, cooperative bank branches, mobile retailers, and hospitality businesses. We are familiar with the municipal regulations governing illuminated signage in the heritage zone near the Rajbari and can guide you on compliant sign types and placement that avoid regulatory complications.

Our Cooch Behar glow sign installations use the same workshop-quality LED and ACP components as our Siliguri projects — we do not compromise on materials for out-of-city work. Transportation of fabricated signs to Cooch Behar is included in our project quotes, and our installation team makes dedicated trips to the town to ensure proper supervision of the work.

Turnaround for Cooch Behar projects is typically 10–12 working days to account for transport and scheduling. Contact us on WhatsApp to discuss your signage requirement — we will arrange a site visit on our next scheduled trip to the area.`,
    stats: [
      { label: 'Service radius', value: '150 km' },
      { label: 'Est.', value: '1990' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'glow-sign-board',
    city: 'darjeeling',
    slug: 'glow-sign-board-in-darjeeling',
    headline: 'Glow Sign Boards in Darjeeling — High-Altitude Signage Built to Last',
    body: `Darjeeling's commercial zones — Chowk Bazaar, the Mall Road tourist strip, Laden La Road, and the Lebong Cart Road market — demand signage that performs under punishing conditions: cold winters, heavy monsoon rainfall, mist, and the corrosive effect of altitude humidity. Standard lowland sign fabrication practices are inadequate here; materials and construction methods must be chosen for the specific climate.

AD-JEET has supplied and installed glow sign boards in Darjeeling town and the surrounding hill areas for over two decades. We select stainless steel hardware, sealed LED drivers rated for low-temperature operation, and ACP grades that resist condensation-related delamination. Our frames use epoxy-primed and powder-coated MS section rather than standard paint, significantly extending corrosion resistance at altitude.

The visual character of Darjeeling's commercial streets also calls for a degree of design sensitivity — oversized or poorly proportioned signage looks out of place against the town's colonial and vernacular architecture. Our design team can propose sign formats that make your brand stand out while respecting the scale and character of the built environment.

Transport and installation in Darjeeling is scheduled on our hill-route trip calendar. Contact AD-JEET on WhatsApp to discuss your requirement and we will advise on the appropriate sign type and timeline for your location.`,
    stats: [
      { label: 'Hill area experience', value: '20+ yrs' },
      { label: 'Est.', value: '1990' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'glow-sign-board',
    city: 'malda',
    slug: 'glow-sign-board-in-malda',
    headline: 'Glow Sign Boards in Malda — Signage for the Mango Capital of Bengal',
    body: `Malda is a fast-growing commercial centre with English Bazar as its main market hub. The growth of banking, retail, and service sectors in Malda has driven significant demand for professional exterior signage. AD-JEET now regularly serves clients in Malda town, fabricating glow sign boards in our Siliguri workshop and dispatching them on our NH-12 transport run.

We have installed glow signs for pharmacies, clothing retailers, electronics showrooms, and private clinics in English Bazar and Old Malda. Our Malda clients benefit from the same material quality and design standards as our Siliguri work — the distance does not affect the product, only the logistics timeline.

For Malda projects, we coordinate a site visit with our transport run and aim to complete fabrication within 10 working days of artwork approval, with installation on the following trip. A dedicated WhatsApp channel keeps clients updated on progress and delivery timing.

Contact AD-JEET to discuss your Malda signage project. We cover English Bazar, Old Malda, and surrounding areas on our regular North Bengal service routes.`,
    stats: [
      { label: 'Service routes', value: 'NH-12 corridor' },
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '10–14 days' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
  // ── ACP & LED Signage ─────────────────────────────────────────────────
  {
    service: 'acp-led-signage',
    city: 'siliguri',
    slug: 'acp-led-signage-in-siliguri',
    headline: 'ACP & LED Signage in Siliguri — Premium Cladding for Modern Brands',
    body: `Aluminium Composite Panel (ACP) signage has become the standard for corporate brand environments across Siliguri's commercial corridors. Banks, telecom showrooms, automobile dealerships, and pharmacy chains use ACP-clad fascias for their clean, uniform appearance and durability. AD-JEET has been the preferred ACP signage fabricator for numerous national brands operating outlets in Siliguri. We handle the complete scope — survey, design, fabrication, and installation — from our Siliguri base. Contact us on WhatsApp for a same-day quote.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Brands served', value: '50+' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'acp-led-signage',
    city: 'jalpaiguri',
    slug: 'acp-led-signage-in-jalpaiguri',
    headline: 'ACP & LED Signage in Jalpaiguri — Corporate-Quality Fascias for Dooars Businesses',
    body: `ACP signage brings a corporate, uniform finish to Jalpaiguri's retail and service businesses that flex and paint cannot match. AD-JEET fabricates ACP sign systems for Jalpaiguri clients including cooperative banks, telecom outlets, and multi-brand retail stores. Our Dooars-specification ACP work uses sealed fixings to handle the monsoon-heavy rainfall of the foothills. We schedule Jalpaiguri installation visits weekly. Contact us on WhatsApp to arrange a site survey and quote for your premises.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Districts', value: '15+' },
      { label: 'Turnaround', value: '7–10 days' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'acp-led-signage',
    city: 'cooch-behar',
    slug: 'acp-led-signage-in-cooch-behar',
    headline: 'ACP & LED Signage in Cooch Behar — Premium Fascias for a Growing Market',
    body: `Cooch Behar's banking and retail sector expansion has created strong demand for corporate-grade ACP signage. AD-JEET supplies and installs ACP LED fascias for Cooch Behar clients, shipping fabricated panels on our dedicated transport run. Our work covers bank branches, insurance offices, and retail chains operating in the town. We are familiar with the heritage zone regulations near Cooch Behar Rajbari and can guide you on compliant signage design. Contact us on WhatsApp to discuss your project.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Service area', value: '150 km radius' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'acp-led-signage',
    city: 'darjeeling',
    slug: 'acp-led-signage-in-darjeeling',
    headline: 'ACP & LED Signage in Darjeeling — Hill-Spec Corporate Fascias',
    body: `ACP signage in Darjeeling requires hill-specification materials — stainless fixings, sealed LED drivers, and ACP grades resistant to condensation and freeze-thaw cycles. AD-JEET's hill-area ACP installations are built to outlast standard lowland products. We serve hotels, pharmacies, and telecom outlets in Darjeeling town and surrounding hill stations. Our design team understands the visual sensitivity required near heritage streetscapes. Contact us on WhatsApp to discuss your Darjeeling ACP signage project.`,
    stats: [
      { label: 'Hill area exp.', value: '20+ yrs' },
      { label: 'Est.', value: '1990' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'acp-led-signage',
    city: 'malda',
    slug: 'acp-led-signage-in-malda',
    headline: 'ACP & LED Signage in Malda — Corporate Signage on the NH-12 Corridor',
    body: `Malda's growing banking and retail sector is driving demand for professional ACP signage in English Bazar and Old Malda. AD-JEET serves Malda clients through our regular NH-12 transport run — fabricating in Siliguri and delivering fully finished panels ready for installation. We cover banks, pharmacies, and showrooms across the Malda district. Contact us on WhatsApp to arrange a site measurement on our next scheduled visit.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '10–14 days' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
  // ── Flex Printing ────────────────────────────────────────────────────
  {
    service: 'flex-printing',
    city: 'siliguri',
    slug: 'flex-printing-in-siliguri',
    headline: 'Flex Printing in Siliguri — Fast Large-Format Print for Every Campaign',
    body: `Siliguri's event, retail, and political campaign calendar runs year-round, driving constant demand for fast, high-quality flex printing. AD-JEET's Siliguri workshop turns around standard hoarding-size flex prints within 24–48 hours — from file to finished roll — making us the go-to partner for time-sensitive campaigns, product launches, and Puja advertising. We print on 280 gsm and 440 gsm flex using UV-stable solvent inks with eyelets and hemming included. Contact us on WhatsApp for an instant per-sq-ft quote.`,
    stats: [
      { label: 'Turnaround', value: '24–48 hrs' },
      { label: 'Min. order', value: 'No minimum' },
      { label: 'Est.', value: '1990' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'flex-printing',
    city: 'jalpaiguri',
    slug: 'flex-printing-in-jalpaiguri',
    headline: 'Flex Printing in Jalpaiguri — Hoarding and Banner Print for Dooars Campaigns',
    body: `Jalpaiguri's market events, melas, and political campaigns generate strong demand for flex printing on short notice. AD-JEET prints flex banners and hoarding panels for Jalpaiguri clients from our Siliguri workshop, with same-day or next-day courier dispatch for urgent orders. We serve political parties, community organisations, and retail businesses across the Jalpaiguri district. Contact us on WhatsApp with your dimensions and we will quote within the hour.`,
    stats: [
      { label: 'Dispatch', value: 'Same/next day' },
      { label: 'Est.', value: '1990' },
      { label: 'Min. order', value: 'No minimum' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'flex-printing',
    city: 'cooch-behar',
    slug: 'flex-printing-in-cooch-behar',
    headline: 'Flex Printing in Cooch Behar — Event and Campaign Banners Delivered Fast',
    body: `Cooch Behar's Rashmela, Rajbari events, and political campaign seasons create peaks of flex printing demand. AD-JEET supplies flex banners, backdrops, and hoarding panels to Cooch Behar clients via our regular transport run. Standard orders are dispatched within 48 hours; urgent jobs can be couriered overnight. We cover community events, retail promotions, and large-format hoarding panels across the Cooch Behar district. Contact us on WhatsApp with your requirement.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '48–72 hrs' },
      { label: 'Min. order', value: 'No minimum' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'flex-printing',
    city: 'darjeeling',
    slug: 'flex-printing-in-darjeeling',
    headline: 'Flex Printing in Darjeeling — Large-Format Banners for the Hills',
    body: `Darjeeling's tourism season and political campaign calendar generate demand for flex banners, hotel backdrops, and directional signage on short notice. AD-JEET prints flex in our Siliguri workshop and dispatches to Darjeeling via our hill-route transport or courier. We supply hotels, travel agencies, local businesses, and event organisers with printed and eyeletted banners ready to hang. Contact us on WhatsApp for a fast quote on your Darjeeling flex printing requirement.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '48–72 hrs' },
      { label: 'Min. order', value: 'No minimum' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'flex-printing',
    city: 'malda',
    slug: 'flex-printing-in-malda',
    headline: 'Flex Printing in Malda — Campaign and Retail Banners on the NH-12 Route',
    body: `Malda's mango festival season, political campaigns, and retail promotions drive regular flex printing orders from English Bazar and surrounding areas. AD-JEET dispatches printed flex rolls to Malda clients via our NH-12 transport or courier — standard orders within 48 hours. We serve retailers, political parties, and event organisers across the Malda district. Contact us on WhatsApp for a sq-ft rate and delivery timeline.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '48–72 hrs' },
      { label: 'Min. order', value: 'No minimum' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
  // ── Vehicle Branding ─────────────────────────────────────────────────
  {
    service: 'vehicle-branding',
    city: 'siliguri',
    slug: 'vehicle-branding-in-siliguri',
    headline: 'Vehicle Branding in Siliguri — Wrap Your Fleet for Maximum Reach',
    body: `Siliguri's position as a logistics and distribution hub means thousands of commercial vehicles pass through daily. Vehicle wrapping turns those vehicles into mobile billboards reaching markets from Darjeeling to Assam. AD-JEET has branded cars, auto-rickshaws, buses, and delivery vans for FMCG brands, logistics companies, and political campaigns operating out of Siliguri. We apply cast vinyl wraps at our Siliguri workshop. Contact us on WhatsApp for a vehicle-specific quote.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Vehicle types', value: 'Auto to bus' },
      { label: 'Turnaround', value: '2–5 days/vehicle' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'vehicle-branding',
    city: 'jalpaiguri',
    slug: 'vehicle-branding-in-jalpaiguri',
    headline: 'Vehicle Branding in Jalpaiguri — Mobile Advertising Across the Dooars',
    body: `Jalpaiguri's auto-rickshaw and commercial vehicle fleet serves the entire Dooars corridor. Branded vehicles from Jalpaiguri are seen in tea gardens, market towns, and rural blocks across the district. AD-JEET handles vehicle branding for Jalpaiguri clients at our Siliguri facility — vehicles are brought in, wrapped, and returned within 2–5 days. We serve political parties, cooperatives, and brand campaigns. Contact us on WhatsApp to schedule a vehicle wrapping slot.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '2–5 days' },
      { label: 'Vinyl life', value: '5–7 years' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'vehicle-branding',
    city: 'cooch-behar',
    slug: 'vehicle-branding-in-cooch-behar',
    headline: 'Vehicle Branding in Cooch Behar — Reach Every Block in the District',
    body: `Cooch Behar's commercial vehicles and auto-rickshaws cover a wide geography — the district's flat terrain makes vehicle advertising highly cost-effective. AD-JEET services vehicle branding orders for Cooch Behar clients, with vehicles brought to our Siliguri facility for wrapping. We handle FMCG fleet branding, political campaign vehicles, and individual business wraps. Contact us on WhatsApp to discuss your Cooch Behar vehicle branding requirement.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '2–5 days' },
      { label: 'Vinyl life', value: '5–7 years' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'vehicle-branding',
    city: 'darjeeling',
    slug: 'vehicle-branding-in-darjeeling',
    headline: 'Vehicle Branding in Darjeeling — Brand Your Vehicles for the Hill Routes',
    body: `Darjeeling's shared taxis and jeeps are the primary transport along hill routes — a branded jeep fleet is one of the most effective advertising formats in the hill area. AD-JEET applies vehicle wraps and cut-vinyl lettering for Darjeeling area operators. We use cast vinyl rated for the temperature range and UV exposure of hill altitudes. Vehicles are wrapped at our Siliguri facility. Contact us on WhatsApp to arrange a convenient wrapping appointment.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Vinyl spec', value: 'Hill-rated cast' },
      { label: 'Turnaround', value: '2–5 days' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'vehicle-branding',
    city: 'malda',
    slug: 'vehicle-branding-in-malda',
    headline: 'Vehicle Branding in Malda — Mobile Campaigns Across North Bengal\'s South',
    body: `Malda's flat agricultural hinterland makes vehicle branding a highly visible advertising format — branded vans and auto-rickshaws cover markets from English Bazar to Chanchal and beyond. AD-JEET handles vehicle branding for Malda clients at our Siliguri facility, with vehicles transported on our NH-12 logistics run or driven in by the client. We serve FMCG brands, NGOs, and political campaigns across the Malda district. Contact us on WhatsApp for a quote.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '2–5 days' },
      { label: 'Vinyl life', value: '5–7 years' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
  // ── F-Pole Installation ───────────────────────────────────────────────
  {
    service: 'f-pole-installation',
    city: 'siliguri',
    slug: 'f-pole-installation-in-siliguri',
    headline: 'F-Pole Installation in Siliguri — High-Visibility Roadside Structures on NH-10 and Sevoke Road',
    body: `F-pole (flag pole) signage structures are the dominant format for petrol stations, hospitals, hotels, and large retail stores along Siliguri's main arterial roads. NH-10, Sevoke Road, and the Bagdogra airport approach all host F-pole installations that we have designed and built. AD-JEET fabricates F-pole structures at our Siliguri workshop with RCC foundations, MS pole sections, and sign faces in ACP or flex — with optional LED floodlighting. We handle the full scope from structural design to final installation. Contact us for a site survey and quote.`,
    stats: [
      { label: 'Pole height', value: 'Up to 40 ft' },
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '10–15 days' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'f-pole-installation',
    city: 'jalpaiguri',
    slug: 'f-pole-installation-in-jalpaiguri',
    headline: 'F-Pole Installation in Jalpaiguri — Roadside Signage Structures for NH-27',
    body: `NH-27 through Jalpaiguri is a high-traffic corridor where F-pole signage gives businesses maximum visibility to passing traffic from both directions. AD-JEET has installed F-pole structures for petrol stations, hospitals, and commercial properties in Jalpaiguri. We fabricate in Siliguri and transport fully assembled or kit-form to site. Our Jalpaiguri F-pole projects include foundation work, pole erection, and sign-face installation. Contact us on WhatsApp to discuss your requirement.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '12–18 days' },
      { label: 'Pole height', value: 'Up to 40 ft' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'f-pole-installation',
    city: 'cooch-behar',
    slug: 'f-pole-installation-in-cooch-behar',
    headline: 'F-Pole Installation in Cooch Behar — Elevated Signage for the District\'s Main Roads',
    body: `Cooch Behar's main roads and district highway approaches are ideal locations for F-pole signage — flat terrain ensures visibility from hundreds of metres. AD-JEET has executed F-pole installation projects in Cooch Behar for fuel stations and commercial properties. We handle transport of fabricated components and on-site civil and electrical work through our network of local contractors. Contact us on WhatsApp to arrange a site visit on our next scheduled Cooch Behar trip.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '14–20 days' },
      { label: 'Pole height', value: 'Up to 40 ft' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'f-pole-installation',
    city: 'darjeeling',
    slug: 'f-pole-installation-in-darjeeling',
    headline: 'F-Pole Installation in Darjeeling — Hill-Rated Structures for High-Altitude Sites',
    body: `F-pole installations in the Darjeeling hill area require engineering appropriate for steep terrain, high wind exposure, and the soil conditions of the Himalayan foothills. AD-JEET designs our Darjeeling-area F-pole foundations to account for these factors, using deeper concrete footings and stainless fixings throughout the structure. We have installed sign poles for hotels and commercial properties in the Darjeeling area. Contact us on WhatsApp for a site assessment and structural quote.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Hill-spec', value: 'Deep foundation' },
      { label: 'Turnaround', value: '15–25 days' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'f-pole-installation',
    city: 'malda',
    slug: 'f-pole-installation-in-malda',
    headline: 'F-Pole Installation in Malda — Highway Signage Structures on NH-12',
    body: `NH-12 through Malda district sees heavy commercial and passenger traffic year-round. F-pole signage along this corridor gives businesses roadside visibility across hundreds of metres. AD-JEET has installed F-pole structures for fuel stations and commercial properties in the Malda area, transporting fabricated components on our regular NH-12 run. We handle foundation, pole erection, and sign-face installation through our field team. Contact us on WhatsApp to discuss your Malda F-pole project.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '14–20 days' },
      { label: 'Pole height', value: 'Up to 40 ft' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
]

export function getProgrammaticPage(slug: string): ProgrammaticPage | undefined {
  return programmaticPages.find(p => p.slug === slug)
}

export function getProgrammaticSlugs(): string[] {
  return programmaticPages.map(p => p.slug)
}
