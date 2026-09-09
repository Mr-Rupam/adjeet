import { describe, it, expect } from 'vitest'
import { hasPhotos, isAwaitingPhotos } from '@/lib/publication'
import { photos } from '@/content/gallery'
import { SERVICE_SLUGS } from '@/content/services'

describe('publication gate', () => {
  it('a service is publishable exactly when it has a photograph', () => {
    const withPhotos = new Set(photos.map(p => p.service))
    for (const slug of SERVICE_SLUGS) {
      expect(hasPhotos(slug), slug).toBe(withPhotos.has(slug))
      expect(isAwaitingPhotos(slug), slug).toBe(!withPhotos.has(slug))
    }
  })

  // A living record of what is currently held out of search. When a photograph
  // lands for one of these, this test fails and the name is removed here: that
  // failure IS the signal that a page just went live.
  it('records which trades are still waiting on photography', () => {
    const waiting = SERVICE_SLUGS.filter(isAwaitingPhotos).sort()
    expect(waiting).toEqual([
      'events-and-puja',
      'f-pole-installation',
      'flex-printing',
      'in-shop-branding',
      'one-way-vision',
      'product-display',
      'wall-painting',
    ])
  })

  it('the trades with photographs are published', () => {
    const live = SERVICE_SLUGS.filter(hasPhotos).sort()
    expect(live).toEqual(['acp-led-signage', 'glow-sign-boards', 'vehicle-branding'])
  })

  it('every photographed service resolves to a known service slug', () => {
    for (const p of photos) {
      expect(SERVICE_SLUGS as readonly string[]).toContain(p.service)
    }
  })
})
