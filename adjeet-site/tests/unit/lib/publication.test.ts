import { describe, it, expect } from 'vitest'
import { hasPhotos, isAwaitingPhotos } from '@/lib/publication'
import { photos } from '@/content/gallery'
import { SERVICE_SLUGS } from '@/content/services'

describe('project media availability', () => {
  it('photo availability follows the gallery without deciding indexing', () => {
    const withPhotos = new Set(photos.map(p => p.service))
    for (const slug of SERVICE_SLUGS) {
      expect(hasPhotos(slug), slug).toBe(withPhotos.has(slug))
      expect(isAwaitingPhotos(slug), slug).toBe(!withPhotos.has(slug))
    }
  })

  // A media inventory; all service pages remain eligible for indexing.
  it('records which trades are still waiting on photography', () => {
    const waiting = SERVICE_SLUGS.filter(isAwaitingPhotos).sort()
    expect(waiting).toEqual(['one-way-vision'])
  })

  it('records the trades with project photographs', () => {
    const live = SERVICE_SLUGS.filter(hasPhotos).sort()
    expect(live).toEqual([
      'acp-led-signage',
      'events-and-puja',
      'f-pole-installation',
      'flex-printing',
      'glow-sign-boards',
      'in-shop-branding',
      'product-display',
      'vehicle-branding',
      'wall-painting',
    ])
  })

  it('every photographed service resolves to a known service slug', () => {
    for (const p of photos) {
      expect(SERVICE_SLUGS as readonly string[]).toContain(p.service)
    }
  })
})
