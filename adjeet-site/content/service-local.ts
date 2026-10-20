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

/** Nearby places people name in Siliguri enquiries. Geography only, not branch claims. */
export const SILIGURI_NEARBY = ['Matigara', 'Bagdogra', 'Naxalbari']

export const SILIGURI_BRIEFS: Partial<Record<ServiceSlug, SiliguriBrief>> = {
  'glow-sign-boards': {
    work: 'glow sign boards',
    brief: 'Opening a shop in Siliguri or replacing a sign that is hard to read? Start with your shop name, location and a straight-on frontage photo. A second photo from the direction customers approach helps us discuss letter size and placement. Include the available width if you know it, any shutter or awning below the sign, and whether you open after dark. If you are unsure about size or lighting, say so: these details can be resolved before a project-specific quote.',
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
}
