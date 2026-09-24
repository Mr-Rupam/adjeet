import { getServiceBySlug, type ServiceSlug } from '@/content/services'

/**
 * Glow sign board, ACP board or flex: the shopfront comparison.
 *
 * Shown as a table on the services page and on each compared service's page,
 * and repeated in llms.txt. Every fact restates something the site already
 * publishes: the service definitions, the FAQ answers and the turnaround
 * planning estimates, which are read from the service records so the table
 * cannot drift from the spec sheets. Add nothing here those sources do not say.
 */
export const COMPARISON_COLUMNS = ['How it is lit', 'What it is made of', 'Often chosen for', 'Planning lead time'] as const

const BOARDS: { name: string; slug: ServiceSlug; facts: [lit: string, madeOf: string, chosenFor: string] }[] = [
  {
    name: 'Glow sign board',
    slug: 'glow-sign-boards',
    facts: [
      'LEDs inside a box light the whole face',
      'A printed flex, acrylic or ACP face on a metal frame',
      'Shops, clinics and offices, often a single shopfront',
    ],
  },
  {
    name: 'ACP board with 3D LED letters',
    slug: 'acp-led-signage',
    facts: [
      'LEDs inside the letters, or behind them for a halo',
      'An aluminium composite panel with acrylic or metal 3D letters',
      'Showrooms, dealerships, banks and brand outlets',
    ],
  },
  {
    name: 'Flex board or banner',
    slug: 'flex-printing',
    facts: [
      'Usually unlit, or lit from the front',
      'Printed PVC flex, finished with eyelets, hemming or a frame',
      'Short-term or low-budget signs, banners and hoardings',
    ],
  },
]

export const COMPARED_BOARDS = BOARDS.map(board => {
  const turnaround = getServiceBySlug(board.slug)?.turnaround
  if (!turnaround) throw new Error(`sign comparison: no turnaround for ${board.slug}`)
  return { name: board.name, slug: board.slug, cells: [...board.facts, turnaround] as const }
})

export const COMPARED_SLUGS: readonly ServiceSlug[] = BOARDS.map(board => board.slug)

export const COMPARISON_HEADING = 'Glow sign board, ACP board or flex?'

export const COMPARISON_LEAD =
  "Three common ways to put a name on a shopfront, all made at AD JEET's Siliguri workshop. A glow sign board lights its whole face from inside a box. An ACP board carries separate 3D letters lit from inside or behind. A flex board is a printed sheet, usually unlit, and the quickest of the three to make."

export const COMPARISON_NOTE =
  'Lead times are planning estimates, counted once the artwork and size are approved. Each board is quoted by area in square feet, then adjusted for the material, lighting, artwork, quantity and installation access.'
