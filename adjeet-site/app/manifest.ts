import type { MetadataRoute } from 'next'
import { business } from '@/lib/business'

/**
 * The web app manifest (technical audit T7). Colours are the light theme's
 * tokens in design/tokens.css: the cream page (`--paper`) and the deep
 * cerulean of the fascia plates (`--cerulean-deep`). The icons are the ones
 * already in app/.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${business.name}, advertising agency in ${business.city}`,
    short_name: business.name,
    description: `Advertising agency in ${business.city} since ${business.foundingYear}: outdoor advertising, signage and brand rollouts across North Bengal and Sikkim.`,
    start_url: '/',
    display: 'browser',
    background_color: '#F6F0E3',
    theme_color: '#00729E',
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
