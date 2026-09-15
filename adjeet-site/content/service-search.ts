import type { ServiceSlug } from '@/content/services'

/**
 * How buyers in Siliguri and North Bengal actually search for each service.
 *
 * Titles use the phrase people type ("glow sign board", "ACP sign board",
 * "flex printing") rather than the internal trade name. `answer` is a short
 * definition shown on the page and reused in structured data and llms.txt, so
 * answer engines can quote one consistent sentence. `alternateNames` are the
 * other local names for the same work. Keep every claim here checkable: no
 * prices, counts or guarantees.
 */
export interface ServiceSearch {
  keyword: string
  seoTitle: string
  metaDescription: string
  question: string
  answer: string
  alternateNames: string[]
  faqs: { q: string; a: string }[]
}

export const SERVICE_SEARCH: Record<ServiceSlug, ServiceSearch> = {
  'glow-sign-boards': {
    keyword: 'Glow Sign Board',
    seoTitle: 'Glow Sign Board & LED Sign Board Makers in Siliguri',
    metaDescription: 'Glow sign boards, LED sign boards and lit shop name boards made in Siliguri. Share a shopfront photo and size for a quote across North Bengal and Sikkim.',
    question: 'What is a glow sign board?',
    answer: 'A glow sign board is a lit shop name board: a printed flex, acrylic or ACP face on a metal frame with LED lighting inside, so the name stays readable after dark. AD JEET makes glow sign boards and LED sign boards at its Siliguri workshop for shops, clinics, showrooms and offices, and installs them across North Bengal.',
    alternateNames: ['LED sign board', 'Lit shop name board', 'Backlit sign board', 'Acrylic glow sign board'],
    faqs: [
      {
        q: 'How is the price of a glow sign board worked out in Siliguri?',
        a: 'Glow sign boards are usually quoted by area in square feet, then adjusted for the face material (flex, acrylic or ACP), the LED lighting, the frame, the artwork and the installation height. Send the width, height, a shopfront photo and your location on WhatsApp for a written quote for your board.',
      },
      {
        q: 'What is the difference between a glow sign board and an ACP board with 3D LED letters?',
        a: 'A glow sign board lights the whole face from inside a box. An ACP board uses a flat aluminium composite panel with separate cut or 3D letters, lit from inside the letters or from behind them. Glow signs are a common choice for a single shopfront; ACP with 3D letters is often chosen by showrooms and brand outlets that want a cleaner frontage.',
      },
    ],
  },
  'acp-led-signage': {
    keyword: 'ACP Sign Board',
    seoTitle: 'ACP Sign Board & 3D LED Letter Signage in Siliguri',
    metaDescription: 'ACP sign boards, ACP facade cladding and 3D LED letters for showrooms, banks and retail outlets. Designed and fabricated in Siliguri for North Bengal and Sikkim.',
    question: 'What is ACP signage?',
    answer: 'ACP signage uses aluminium composite panels as a clean, weather-resistant sign face or shopfront cladding, finished with acrylic or metal 3D letters lit by LED modules. AD JEET cuts, routes and fits ACP sign boards and 3D LED letter signs from its Siliguri workshop for showrooms, dealerships, banks and branded outlets.',
    alternateNames: ['ACP sign board', '3D LED letter sign', 'ACP facade cladding', 'ACP elevation signage', 'Acrylic 3D letters'],
    faqs: [
      {
        q: 'Can you make 3D LED letters for a shop or showroom?',
        a: 'Yes. 3D letters can be made in acrylic or metal and lit from inside or from behind for a halo effect, then fixed to an ACP panel or directly to the wall. Share your logo file, the frontage width and a photo so the letter height and lighting can be planned.',
      },
      {
        q: 'How is an ACP sign board priced?',
        a: 'An ACP board is quoted on the panel area, the frame or sub-structure, the letters and logo, the lighting and the installation access. Brand outlets with a design manual should share it with the site photographs so the quote reflects the approved materials.',
      },
    ],
  },
  'flex-printing': {
    keyword: 'Flex Printing',
    seoTitle: 'Flex Printing, Banners & Hoarding Prints in Siliguri',
    metaDescription: 'Flex banner printing, hoarding flex and vinyl printing in Siliguri. Frontlit and blockout flex with eyelets, framing or installation across North Bengal.',
    question: 'What is flex printing used for?',
    answer: 'Flex printing is large-format digital printing on PVC flex media, used for shop banners, hoardings, event backdrops and temporary signs. AD JEET prints frontlit and blockout flex and vinyl in Siliguri, finishes it with eyelets, hemming or framing, and can install banner and hoarding prints across North Bengal.',
    alternateNames: ['Flex banner printing', 'Hoarding printing', 'Vinyl printing', 'Banner printing', 'Star flex printing'],
    faqs: [
      {
        q: 'Do you print and install hoarding flex in Siliguri?',
        a: 'Yes. Send the hoarding size, the site location and the artwork. We print the flex, finish it for the frame and can fit it on an existing hoarding structure. Permission for the hoarding site itself rests with the site or media owner.',
      },
      {
        q: 'What is the difference between frontlit and blockout flex?',
        a: 'Frontlit flex is lit from the front and is the usual choice for banners and hoardings. Blockout flex has a dark inner layer that stops light passing through, so it suits double-sided displays and prints that must look solid against sunlight or a lit background.',
      },
    ],
  },
  'vehicle-branding': {
    keyword: 'Vehicle Branding',
    seoTitle: 'Vehicle Branding & Van Wraps in Siliguri',
    metaDescription: 'Vehicle branding in Siliguri for vans, trucks, e-rickshaws, autos and fleets. Printed vinyl wraps and cut-vinyl graphics for North Bengal businesses.',
    question: 'What is vehicle branding?',
    answer: 'Vehicle branding puts your company name, logo and phone number on cars, vans, trucks, buses, autos and e-rickshaws using printed vinyl wraps or cut-vinyl lettering. AD JEET designs, prints and applies vehicle graphics in Siliguri for delivery fleets, distributors, schools and brands working across North Bengal.',
    alternateNames: ['Vehicle wrap', 'Van branding', 'Fleet branding', 'E-rickshaw branding', 'Auto rickshaw branding', 'Truck branding'],
    faqs: [
      {
        q: 'Can you brand e-rickshaws and auto rickshaws for a campaign?',
        a: 'Yes. Send the number of vehicles, the back and side panels you want branded, the artwork and the place where the vehicles can be gathered for fitting. The team will confirm the panel sizes and a fitting plan before printing.',
      },
    ],
  },
  'wall-painting': {
    keyword: 'Wall Painting Advertising',
    seoTitle: 'Wall Painting Advertising in Siliguri & North Bengal',
    metaDescription: 'Hand-painted wall advertising and wall writing for brands across Siliguri, the Dooars and rural North Bengal. Exterior paints, site checks and campaign planning.',
    question: 'What is wall painting advertising?',
    answer: 'Wall painting advertising is a brand message painted by hand directly onto a building or boundary wall, most often along highways and in rural and semi-urban markets. AD JEET plans and paints wall advertisements from Siliguri for brands and distributors reaching towns and villages across North Bengal.',
    alternateNames: ['Wall writing', 'Wall ad painting', 'Rural wall advertising', 'Wall branding'],
    faqs: [
      {
        q: 'Should I choose wall painting or flex for rural advertising?',
        a: 'Wall painting has no media to replace and suits walls where a frame or light cannot be fitted, so it is often used for long-running rural campaigns. Flex is quicker to change. The better choice depends on how long the message should stay up, the number of walls and the wall owner\'s permission.',
      },
    ],
  },
  'f-pole-installation': {
    keyword: 'F-Pole Sign',
    seoTitle: 'F-Pole Sign Boards & Installation in Siliguri',
    metaDescription: 'F-pole signs for fuel stations, hospitals, hotels and highway businesses. Pole fabrication, foundation and sign face installed from Siliguri across North Bengal.',
    question: 'What is an F-pole sign?',
    answer: 'An F-pole sign is a raised steel pole with an arm that holds a sign face above road level, so a business can be seen from a distance along highways and busy roads. AD JEET fabricates F-pole structures and sign faces in Siliguri and installs them after a site and foundation assessment.',
    alternateNames: ['F pole sign board', 'Pole sign', 'Roadside sign structure', 'Highway pole signage'],
    faqs: [
      {
        q: 'Where are F-pole signs usually used?',
        a: 'They suit fuel stations, hospitals, hotels, schools, showrooms and factories set back from the road, where a wall sign would not be seen by passing traffic. A site check confirms the position, height and permissions before fabrication.',
      },
    ],
  },
  'in-shop-branding': {
    keyword: 'In-Shop Branding',
    seoTitle: 'In-Shop & Retail Branding in Siliguri',
    metaDescription: 'Retail and in-shop branding in Siliguri: wall graphics, counter fascias, hanging signs and dealer outlet branding to your brand guidelines across North Bengal.',
    question: 'What does in-shop branding include?',
    answer: 'In-shop branding covers everything inside an outlet that carries the brand: wall graphics, counter fascias, backlit panels, hanging signs, directional signs and display headers. AD JEET produces and installs in-shop branding in Siliguri for dealer outlets, showrooms, restaurants and offices, following the guidelines supplied by head office or the agency.',
    alternateNames: ['Retail branding', 'Shop interior branding', 'Dealer outlet branding', 'Showroom branding'],
    faqs: [
      {
        q: 'Do you handle dealer and distributor outlet branding for brands?',
        a: 'Yes. Send the outlet list, the approved design kit and photographs of each counter or wall. The team plans measurement and the rollout outlet by outlet so the finished branding follows the brand manual.',
      },
    ],
  },
  'events-and-puja': {
    keyword: 'Durga Puja Branding',
    seoTitle: 'Durga Puja Gate Branding & Event Signage in Siliguri',
    metaDescription: 'Durga Puja pandal gate branding, entrance arches, stage backdrops and event signage made in Siliguri for brands, puja committees and corporate events.',
    question: 'What is Puja and event branding?',
    answer: 'Puja and event branding puts sponsor and event graphics on entrance gates, arches, pillars, stage backdrops and directional signs. AD JEET fabricates these in its Siliguri workshop and installs them on site for Durga Puja, product launches, dealer meets and public events across North Bengal.',
    alternateNames: ['Puja gate branding', 'Pandal branding', 'Entrance arch branding', 'Event backdrop printing', 'Stage backdrop'],
    faqs: [
      {
        q: 'Can a brand put its name on a Durga Puja gate through AD JEET?',
        a: 'We make and install the branded gates, arches and pillars. The sponsorship itself is agreed between the brand and the puja committee; share the committee\'s approved size, location and setup date and we will quote the fabrication and fitting.',
      },
    ],
  },
  'one-way-vision': {
    keyword: 'One Way Vision Film',
    seoTitle: 'One Way Vision Film & Glass Branding in Siliguri',
    metaDescription: 'One way vision stickers for shop glass, office cabins and vehicle rear windows. Printed perforated vinyl applied in Siliguri and across North Bengal.',
    question: 'What is one way vision film?',
    answer: 'One way vision is perforated printed vinyl: people outside see your graphic, while people inside can still see out through the tiny holes. AD JEET prints and applies one way vision film in Siliguri for shop windows, glass facades, office cabins and vehicle rear windows.',
    alternateNames: ['One way vision sticker', 'Perforated window film', 'Glass branding', 'Window graphics'],
    faqs: [],
  },
  'product-display': {
    keyword: 'POP Display',
    seoTitle: 'POP Displays, Standees & Display Units in Siliguri',
    metaDescription: 'POP and POS displays made in Siliguri: standees, shelf talkers, product glorifiers and freestanding display units for FMCG, pharma and electronics brands.',
    question: 'What are POP product displays?',
    answer: 'Product displays are the point-of-purchase pieces that sit next to the product in a shop: standees, shelf talkers, counter units, glorifiers and freestanding display units. AD JEET fabricates them in acrylic, foam board, ACP and metal in Siliguri for brands and distributors supplying retailers across North Bengal.',
    alternateNames: ['POP display', 'POS display', 'Standee', 'Shelf talker', 'Product glorifier', 'FSDU'],
    faqs: [],
  },
}
