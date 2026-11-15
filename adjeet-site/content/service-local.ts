import type { ServiceSlug } from '@/content/services'

/**
 * The Siliguri brief for the five trades that used to have a Siliguri landing
 * page of their own (`/glow-sign-board-in-siliguri` and the like). Those pages
 * now redirect to the service page, so the brief, its "send us" list and the
 * prefilled form moved here with them.
 *
 * `work` is the trade in running-prose case. Lowercasing `service.name` would
 * turn "ACP & LED Signage" into "acp & led signage" in a display heading.
 *
 * Keep every line checkable: no prices, response times or visit promises.
 */
export interface SiliguriBrief {
  work: string
  brief: string
  sendUs: string[]
}

/**
 * The "what to send" list in Bengali, for the two trades most local shop
 * owners ask about (SEO plan A6, approved 20 October 2026). Each line mirrors
 * the English `sendUs` item at the same position. A fluent Bengali reader must
 * proof any change before it ships.
 */
export interface BengaliSendUs {
  heading: string
  note: string
  sendUs: string[]
}

export const SILIGURI_SEND_US_BN: Partial<Record<ServiceSlug, BengaliSendUs>> = {
  'glow-sign-boards': {
    heading: 'বাংলায়: কী পাঠাবেন',
    note: 'হোয়াটসঅ্যাপে বাংলায় লিখতে পারেন।',
    sendUs: [
      'আপনার দোকানের নাম এবং লোকেশন পিন',
      'দোকানের সামনের দিকের সোজাসুজি একটি ছবি',
      'ক্রেতারা যেদিক থেকে আসেন, সেদিক থেকে একটি ছবি',
      'বোর্ডের জন্য কতটা চওড়া জায়গা আছে, জানা থাকলে',
      'সন্ধ্যার পরেও দোকান খোলা থাকে কি না',
    ],
  },
  'acp-led-signage': {
    heading: 'বাংলায়: কী পাঠাবেন',
    note: 'হোয়াটসঅ্যাপে বাংলায় লিখতে পারেন।',
    sendUs: [
      'দোকানের পুরো সামনের দিকের একটি ছবি, দরকারি জায়গাগুলো চিহ্নিত করে',
      'আনুমানিক মাপ, জানা থাকলে',
      'আপনার লোগো বা ব্র্যান্ডের নির্দেশিকা',
      'কী সরাতে হবে আর কী আবার ব্যবহার করা হবে',
      'লোকেশন পিন',
    ],
  },
}

/** Nearby places people name in Siliguri enquiries. Geography only, not branch claims. */
export const SILIGURI_NEARBY = ['Matigara', 'Bagdogra', 'Naxalbari']

export const SILIGURI_BRIEFS: Partial<Record<ServiceSlug, SiliguriBrief>> = {
  'glow-sign-boards': {
    work: 'glow sign boards',
    brief: 'Opening a shop in Siliguri or replacing a sign that is hard to read? Start with your shop name, location and a straight-on frontage photo. A second photo from the direction customers approach helps us discuss letter size and placement. Include the available width if you know it, any shutter or awning below the sign, and whether you open after dark. Not sure about the size or the lighting? Say so, and these details can be settled before the quote for your board.',
    sendUs: [
      'Your shop name and a location pin',
      'A straight-on photo of the frontage',
      'A photo from the way customers approach',
      'The available width, if you know it',
      'Whether you open after dark',
    ],
  },
  'acp-led-signage': {
    work: 'ACP and LED signage',
    brief: 'Planning a complete shopfront finish in Siliguri? An ACP fascia and LED lettering need to be considered together with the entrance and existing building. Share a photo of the whole frontage and mark shutters, pillars, doors and lighting you want to keep. Include approximate dimensions if known, plus your logo or brand requirements. Tell us what needs removing or reusing so the panel layout, lettering, electrical work and fitting scope can be clarified before the quote.',
    sendUs: [
      'A photo of the whole frontage, marked up',
      'Approximate dimensions, if known',
      'Your logo or brand requirements',
      'What should be removed or reused',
      'A location pin',
    ],
  },
  'flex-printing': {
    work: 'flex prints and banners',
    brief: 'For flex printing in Siliguri, send the finished width and height, quantity and installation method with your artwork. A banner tied to a frame needs different finishing from one mounted onto a backing. Tell us whether you need collection, delivery or fitting, and give the actual event or opening date before requesting a production slot.',
    sendUs: [
      'Finished width and height',
      'Quantity and the artwork',
      'How each piece will be mounted',
      'Collection, delivery or fitting',
      'The event or opening date',
    ],
  },
  'vehicle-branding': {
    work: 'vehicle branding',
    brief: 'For vehicle branding in Siliguri, send photographs of both sides, the front and the rear, together with the vehicle model and quantity. Show dents, repaired paint and existing graphics before requesting a wrap quote. Tell us when the vehicle can be taken off its route so inspection, artwork approval and application can be planned.',
    sendUs: [
      'Photos of both sides, the front and the rear',
      'The vehicle model and how many',
      'Dents, repaired paint or old graphics',
      'When the vehicle can come off its route',
    ],
  },
  'f-pole-installation': {
    work: 'F-pole signs',
    brief: 'For an F-pole enquiry in Siliguri, send a location pin and wide photographs showing the proposed position, approach road and nearby buildings. Note overhead wires, existing structures and available access. The pole, foundation and sign face need a site-specific assessment; a photograph alone is not enough to confirm a structure or installation price.',
    sendUs: [
      'A location pin',
      'Wide photos of the position and the approach road',
      'Overhead wires and nearby structures',
      'Who controls the land',
    ],
  },
  // The five briefs below were added on 15 November 2026 (content audit C6).
  // Every step restates a FAQ already on the same service page.
  'wall-painting': {
    work: 'wall advertising',
    brief: 'For wall painting advertising, send a photo of each wall and a location pin. Add the wording or artwork you want painted. Say who owns the wall and whether permission is already given. Painting is done on site, so note the surface: plastered, brick, tin or fence. For many walls, send one list with a photo for each.',
    sendUs: [
      'A photo of each wall',
      'A location pin for each wall',
      'The wording or artwork',
      'Who owns the wall, and whether permission is given',
      'The type of surface',
    ],
  },
  'in-shop-branding': {
    work: 'in-shop branding',
    brief: 'For in-shop branding, send the outlet list, the approved design kit and a photo of each counter or wall. Say what is being replaced and what stays. The measurements and the rollout are planned outlet by outlet, so the finished branding follows your brand manual.',
    sendUs: [
      'The outlet list with addresses',
      'The approved design kit',
      'A photo of each counter or wall',
      'What is replaced and what stays',
      'Your target date',
    ],
  },
  'events-and-puja': {
    work: 'Puja and event branding',
    brief: 'For Puja and event branding, send the venue, the theme and the sizes. Add the setup date and say whether the work must be taken down afterwards. If a brand is sponsoring a gate, send the size, place and setup date that the committee has approved.',
    sendUs: [
      'The venue and a location pin',
      'The theme and artwork',
      'Sizes of each gate, arch or backdrop',
      'The setup date',
      'Whether dismantling is needed',
    ],
  },
  'one-way-vision': {
    work: 'one way vision film',
    brief: 'For one way vision film, send a photo of the glass and its width and height. Say whether the glass is flat or curved, and which side people look from. Visibility depends on the film, the light and the placement, so say what you need to see through it.',
    sendUs: [
      'A photo of the glass',
      'Width and height',
      'Flat or curved glass',
      'Which side people look from',
      'Your logo or artwork',
    ],
  },
  'product-display': {
    work: 'product displays',
    brief: 'For product displays, send the product, the quantity and the artwork. Add the sizes and the places the units must reach. Say whether they should arrive assembled or packed flat.',
    sendUs: [
      'The product and the quantity',
      'The artwork',
      'The sizes',
      'Where the units must be delivered',
      'Assembled or packed flat',
    ],
  },
}
