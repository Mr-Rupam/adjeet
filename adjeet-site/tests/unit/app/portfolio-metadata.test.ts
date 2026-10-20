import { describe, expect, it, vi } from 'vitest'
import { metadata } from '@/app/(marketing)/portfolio/page'
import { getClients, photos } from '@/content/gallery'

vi.mock('@/app/(marketing)/portfolio/PortfolioContent', () => ({ PortfolioContent: () => null }))

describe('portfolio description', () => {
  const description = String(metadata.description)

  it('states the number of photographs the gallery actually publishes', () => {
    expect(description.startsWith(`${photos.length} AD JEET project photographs`)).toBe(true)
    expect(description).not.toMatch(/over \d+/i)
  })

  it('names only brands that have photographs in the gallery', () => {
    const named = description.match(/ for (.+) and more\.$/)?.[1].split(', ') ?? []
    expect(named.length).toBeGreaterThan(0)
    const withPhotos = new Set(getClients().map(client => client.name))
    for (const brand of named) expect(withPhotos.has(brand), brand).toBe(true)
  })
})
