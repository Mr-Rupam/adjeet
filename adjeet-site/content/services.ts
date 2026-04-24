export interface Service {
  slug: string
  name: string
  tagline: string
  description: string
  materials: string[]
  sizes: string[]
  turnaround: string
  faqs: { q: string; a: string }[]
  relatedServices: string[]
  heroImage: string
  icon: string
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

export const services: Service[] = [
  {
    slug: 'glow-sign-boards',
    name: 'Glow Sign Boards',
    tagline: 'Illuminate your brand 24/7',
    description:
      'LED-backlit and neon-effect acrylic sign boards that keep your business visible day and night. We fabricate custom glow signs in ACP, acrylic, and aluminium channel letters — sized from a single shopfront panel to large hoarding installations. Every sign is weatherproofed for North Bengal\'s monsoon and winter conditions, and wired for low energy consumption.',
    materials: ['Acrylic', 'ACP sheet', 'Aluminium channel letters', 'LED strip (SMD)', 'MS frame'],
    sizes: ['1×2 ft', '2×4 ft', '3×6 ft', '4×8 ft', 'Custom hoarding size'],
    turnaround: '5–7 working days',
    faqs: [
      {
        q: 'How long do the LED strips last?',
        a: 'Quality SMD LED strips typically last 30,000–50,000 hours under normal usage. We use branded drivers and ICs to extend lifespan.',
      },
      {
        q: 'Can you install on a second-floor facade?',
        a: 'Yes. Our installation team handles elevated work with proper scaffolding and safety equipment across Siliguri and surrounding districts.',
      },
      {
        q: 'Do glow signs work during power cuts?',
        a: 'Standard glow signs require mains power. We can integrate an inverter or UPS connection on request — ideal for hospital or pharmacy signage.',
      },
      {
        q: 'What warranty do you offer?',
        a: 'We provide a one-year warranty on LED components and fabrication workmanship. Driver replacements are covered within this period.',
      },
    ],
    relatedServices: ['acp-led-signage', 'f-pole-installation', 'in-shop-branding'],
    heroImage: '/images/services/glow-sign-boards-hero.jpg',
    icon: 'lightbulb',
  },
  {
    slug: 'acp-led-signage',
    name: 'ACP & LED Signage',
    tagline: 'Clean, durable faces for modern brands',
    description:
      'Aluminium Composite Panel (ACP) cladding combined with LED module lighting creates the clean, premium look demanded by banks, telecom showrooms, and retail chains. We cut, route, and bond ACP to precise dimensions, then back-light or face-light with uniform LED modules. The result is a sign that reads well at distance and retains its finish through years of sun and rain.',
    materials: ['ACP (Alucobond / local)', 'LED modules', 'Aluminium extrusion', 'PVC flex backing', 'Stainless steel fixings'],
    sizes: ['Custom — from 2 sq ft to full building facade'],
    turnaround: '7–10 working days',
    faqs: [
      {
        q: 'Which ACP brands do you work with?',
        a: 'We stock both Alucobond (imported) and quality domestic ACP. Domestic is cost-effective for interior signage; Alucobond is recommended for exterior long-term installations.',
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
    heroImage: '/images/services/acp-led-signage-hero.jpg',
    icon: 'panels',
  },
  {
    slug: 'flex-printing',
    name: 'Flex Printing',
    tagline: 'Large-format print for every surface',
    description:
      'High-resolution flex banner and vinyl printing for hoardings, retail backdrops, event walls, and temporary signage. We print on 280 gsm and 440 gsm flex media using UV-resistant solvent inks, then eyelet, hem, or mount to your specification. Turnaround is fast — most standard runs are ready within 24–48 hours.',
    materials: ['280 gsm frontlit flex', '440 gsm blockout flex', 'One-way vision vinyl', 'Matte/gloss vinyl sticker'],
    sizes: ['A3 to 40×10 ft continuous roll — custom cut to order'],
    turnaround: '1–3 working days',
    faqs: [
      {
        q: 'What file format should I send?',
        a: 'PDF at 1:1 scale (72–100 dpi for large format) or AI/CDR with fonts outlined. We can also work from high-res JPG/PNG.',
      },
      {
        q: 'Can you design the artwork as well?',
        a: 'Yes. Our in-house design team can create or adapt artwork for an additional design fee. Send references and content and we will quote.',
      },
      {
        q: 'How do I calculate the cost?',
        a: 'Flex printing is priced per square foot plus media grade. Contact us on WhatsApp with dimensions and quantity for an instant quote.',
      },
    ],
    relatedServices: ['vehicle-branding', 'events-and-puja', 'one-way-vision'],
    heroImage: '/images/services/flex-printing-hero.jpg',
    icon: 'print',
  },
  {
    slug: 'vehicle-branding',
    name: 'Vehicle Branding',
    tagline: 'Turn every kilometre into an impression',
    description:
      'Full and partial vehicle wraps that transform cars, auto-rickshaws, buses, and delivery vans into moving billboards. We use calendered and cast vinyl films, cut-vinyl lettering, and printed wraps — applied by trained fitters who ensure bubble-free, heat-contoured coverage across curves and edges. Ideal for fleet owners, FMCG brands, and election campaigns across North Bengal.',
    materials: ['Cast vinyl wrap film', 'Calendered vinyl', 'Cut vinyl lettering', 'Laminate (matte/gloss)'],
    sizes: ['Auto-rickshaw panels', 'Car partial/full', 'Bus full-wrap', 'Truck side panels'],
    turnaround: '2–5 working days per vehicle',
    faqs: [
      {
        q: 'Will the wrap damage my vehicle\'s original paint?',
        a: 'No. Quality cast vinyl is paint-safe and fully removable within its 5-year lifespan without leaving residue, provided the original paint is in good condition.',
      },
      {
        q: 'Can you brand a fleet of 20 vehicles?',
        a: 'Absolutely. Fleet projects receive priority scheduling and volume pricing. We can handle sequential numbering, driver name plates, and route displays.',
      },
      {
        q: 'How long does the wrap last outdoors in North Bengal\'s climate?',
        a: 'Cast vinyl lasts 5–7 years; calendered vinyl 2–4 years. UV laminate significantly extends outdoor life in high-sun exposure areas.',
      },
    ],
    relatedServices: ['flex-printing', 'in-shop-branding', 'one-way-vision'],
    heroImage: '/images/services/vehicle-branding-hero.jpg',
    icon: 'truck',
  },
  {
    slug: 'wall-painting',
    name: 'Wall Painting',
    tagline: 'Durable outdoor advertising on any wall',
    description:
      'Hand-painted and stencil-painted wall advertising for rural markets, highways, and peri-urban areas where flex and backlit signs are impractical. Our painters use exterior-grade enamel and weather-shield paints that withstand monsoon rain and humidity. Wall painting remains cost-effective and legally permissible in many areas where hoardings require permissions, making it ideal for FMCG brand campaigns across the Dooars and Terai.',
    materials: ['Exterior enamel paint', 'Weather-shield emulsion', 'Primer', 'Stencil film'],
    sizes: ['10 sq ft to 500+ sq ft wall area'],
    turnaround: '3–7 working days (site-dependent)',
    faqs: [
      {
        q: 'Do you obtain wall permission from owners?',
        a: 'We can assist in negotiating wall permission. The client is responsible for any permission fees; we handle the logistics and documentation support.',
      },
      {
        q: 'How many years does wall painting last?',
        a: 'With quality exterior enamel and a proper primer coat, wall painting typically lasts 3–5 years before a refresh is needed.',
      },
      {
        q: 'Can you repaint an existing old wall ad?',
        a: 'Yes. We assess the substrate condition and apply appropriate primer before repainting. An additional cost applies for heavy surface preparation.',
      },
    ],
    relatedServices: ['flex-printing', 'f-pole-installation', 'vehicle-branding'],
    heroImage: '/images/services/wall-painting-hero.jpg',
    icon: 'paint-roller',
  },
  {
    slug: 'f-pole-installation',
    name: 'F-Pole Installation',
    tagline: 'High-visibility roadside display structures',
    description:
      'Fabrication and installation of F-pole (flag pole) sign structures that elevate your branding to eye-catching height along highways, commercial corridors, and roundabouts. We design and weld custom MS/GI pole structures, anchor them with concrete foundations sized for local wind loads, and mount illuminated or non-illuminated sign faces. Trusted by fuel stations, hospitals, hotels, and retail chains across Siliguri and district towns.',
    materials: ['MS hollow section (pole)', 'GI pipe', 'RCC foundation', 'ACP/flex sign face', 'LED floodlight (optional)'],
    sizes: ['10 ft to 40 ft pole height — single or double arm'],
    turnaround: '10–15 working days (includes foundation curing)',
    faqs: [
      {
        q: 'Do you handle permissions for roadside structures?',
        a: 'We guide you through the municipal or NHAI permission process. Approval timelines depend on the authority; fabrication begins once permission is in hand.',
      },
      {
        q: 'Can the pole withstand Nor\'wester storms?',
        a: 'Our foundations are designed to IS 875 wind load standards for West Bengal. We recommend periodic inspection after severe storms.',
      },
      {
        q: 'Can I change the sign face later without replacing the pole?',
        a: 'Yes. We design mounting systems that allow sign-face replacement without structural work, keeping future update costs low.',
      },
    ],
    relatedServices: ['glow-sign-boards', 'acp-led-signage', 'flex-printing'],
    heroImage: '/images/services/f-pole-installation-hero.jpg',
    icon: 'flag-pole',
  },
  {
    slug: 'in-shop-branding',
    name: 'In-Shop Branding',
    tagline: 'Turn your interior into a brand experience',
    description:
      'Complete interior branding solutions for retail outlets, showrooms, restaurants, and offices — from wall graphics and product display headers to hanging banners, directional signage, and branded counter fascias. We handle concept-to-installation so the finished space is consistent with your brand guidelines. Preferred vendor for telecom, FMCG, and banking sector rollouts across North Bengal.',
    materials: ['ACP panels', 'Backlit acrylic', 'Vinyl wall graphics', 'Foam board', 'Hanging display systems'],
    sizes: ['Single counter to full-store rollout'],
    turnaround: '7–14 working days (scope-dependent)',
    faqs: [
      {
        q: 'Can you work outside business hours to avoid disruption?',
        a: 'Yes. For retail and bank installations we schedule overnight or early morning shifts so the space is ready before opening.',
      },
      {
        q: 'Do you handle multiple outlet rollouts simultaneously?',
        a: 'Yes. We have teams that can execute parallel installations across Siliguri, Jalpaiguri, and Cooch Behar zones simultaneously.',
      },
      {
        q: 'Can you match my HO-supplied brand kit?',
        a: 'Absolutely. Send us your brand guidelines and site dimensions and we will produce a compliant execution plan for approval before fabrication.',
      },
    ],
    relatedServices: ['acp-led-signage', 'glow-sign-boards', 'product-display'],
    heroImage: '/images/services/in-shop-branding-hero.jpg',
    icon: 'store',
  },
  {
    slug: 'events-and-puja',
    name: 'Events & Puja Decoration',
    tagline: 'Make every celebration unforgettable',
    description:
      'End-to-end signage and decoration for Durga Puja pandals, corporate events, product launches, and public celebrations across North Bengal. We supply stage backdrops, entrance arches, flex banners, directional signage, LED flex borders, and themed props — all fabricated in our Siliguri workshop and installed on-site. Trusted by community puja committees and corporate event teams for over two decades.',
    materials: ['Flex print backdrop', 'MS arch frame', 'LED pixel strip', 'Thermocol prop', 'Fabric draping'],
    sizes: ['10×10 ft stall to full pandal/stage setup'],
    turnaround: '3–10 working days (varies by event scale)',
    faqs: [
      {
        q: 'Do you handle Durga Puja pandal decoration?',
        a: 'Yes, this is one of our busiest seasons. We work with committees across Siliguri, Jalpaiguri, and Cooch Behar. Book early — slots fill by August.',
      },
      {
        q: 'Can you supply and install within 48 hours for an urgent event?',
        a: 'For standard flex and banner elements yes, subject to workshop capacity. Fabricated structures need at least 5 days. Call us to check availability.',
      },
      {
        q: 'Do you dismantle and remove after the event?',
        a: 'Yes. Dismantling and removal can be included in the project quote. We are familiar with post-Puja cleanup timelines in the region.',
      },
    ],
    relatedServices: ['flex-printing', 'in-shop-branding', 'wall-painting'],
    heroImage: '/images/services/events-puja-hero.jpg',
    icon: 'sparkles',
  },
  {
    slug: 'one-way-vision',
    name: 'One-Way Vision',
    tagline: 'Brand your glass without blocking the view',
    description:
      'Perforated vinyl film that lets your brand show prominently from outside while maintaining clear sightlines from inside — ideal for shopfront glazing, vehicle rear windows, and glass partition branding. We print on 50/50 perforation vinyl (50% ink, 50% clear holes) using high-resolution solvent printing, then cut and apply to glass surfaces. The result is professional exterior branding with zero interior obstruction.',
    materials: ['50/50 perforated vinyl', 'Window application film', 'Solvent print ink'],
    sizes: ['Custom cut to glass dimensions'],
    turnaround: '3–5 working days',
    faqs: [
      {
        q: 'How visible is the image from outside?',
        a: 'On 50/50 perf vinyl, the image is bold and legible at 1–2 metres distance in normal daylight. At night, interior lighting can reduce exterior visibility — we can advise on placement.',
      },
      {
        q: 'Can one-way vision be applied to curved glass?',
        a: 'It works best on flat glass. For mildly curved surfaces we use short-grain vinyl. Highly curved auto glass requires a curved-surface specialist application.',
      },
      {
        q: 'Is it removable?',
        a: 'Yes, fully removable without residue, provided the glass surface is clean and the film has not been on for more than 3–4 years.',
      },
    ],
    relatedServices: ['vehicle-branding', 'in-shop-branding', 'flex-printing'],
    heroImage: '/images/services/one-way-vision-hero.jpg',
    icon: 'eye',
  },
  {
    slug: 'product-display',
    name: 'Product Display',
    tagline: 'Showcase products that sell themselves',
    description:
      'Custom point-of-sale (POS) and point-of-purchase (POP) display units — standees, wobbler holders, shelf talkers, product glorifiers, and freestanding display units (FSDUs). We fabricate in acrylic, foam board, ACP, and MS/GI metal, then print and finish in-house for a single-vendor, fast-turnaround solution. Widely used by FMCG brands, electronics retailers, and pharma companies for product launches and seasonal promotions across North Bengal distribution channels.',
    materials: ['Acrylic sheet', 'Foam board (5/10 mm)', 'ACP', 'MS/GI metal frame', 'UV-print laminate'],
    sizes: ['A5 shelf talker to 6 ft freestanding unit'],
    turnaround: '5–10 working days',
    faqs: [
      {
        q: 'Can you manufacture 500 identical standees for a pan-Bengal campaign?',
        a: 'Yes. We have the capacity for medium-run production. For orders above 200 units, contact us for a volume quote and production schedule.',
      },
      {
        q: 'Do you ship to distributors outside Siliguri?',
        a: 'Yes. We pack flat-pack or assembled and ship via road freight to Kolkata, Guwahati, and points in between. Transport cost is additional.',
      },
      {
        q: 'Can you add QR codes or scratch-card elements?',
        a: 'Yes — UV-printed QR codes, tear-off pads, and scratch elements can all be integrated into the display design.',
      },
    ],
    relatedServices: ['in-shop-branding', 'acp-led-signage', 'flex-printing'],
    heroImage: '/images/services/product-display-hero.jpg',
    icon: 'display',
  },
]

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(s => s.slug === slug)
}
