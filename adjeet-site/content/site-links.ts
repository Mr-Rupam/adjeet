import type { ServiceSlug } from '@/content/services'

/**
 * Plain descriptive names for linking each service, as people search for
 * them. Used by the footer (all ten) and the phone menu (the main four).
 */
export const SERVICE_LINK_LABELS: Record<ServiceSlug, string> = {
  'glow-sign-boards': 'Glow sign boards',
  'acp-led-signage': 'ACP and 3D LED letters',
  'flex-printing': 'Flex printing',
  'vehicle-branding': 'Vehicle branding',
  'wall-painting': 'Wall painting advertising',
  'f-pole-installation': 'F-pole sign boards',
  'in-shop-branding': 'In-shop branding',
  'events-and-puja': 'Puja and event branding',
  'one-way-vision': 'One way vision film',
  'product-display': 'POP displays and standees',
}

/** The four trades most enquiries are about. */
export const MAIN_TRADE_SLUGS = ['glow-sign-boards', 'acp-led-signage', 'flex-printing', 'vehicle-branding'] as const satisfies readonly ServiceSlug[]
