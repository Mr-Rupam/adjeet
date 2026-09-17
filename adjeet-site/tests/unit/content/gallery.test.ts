import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import {
  photos,
  clientSlug,
  getClients,
  getFeaturedPhotos,
  getPhotoById,
  getPhotosByClient,
  getPhotosByService,
  getPhotosByCity,
  getServiceCover,
} from '@/content/gallery'
import { SERVICE_SLUGS } from '@/content/services'
import { CITY_SLUGS } from '@/content/cities'

// Thresholds below track the real photo set: the 5 original shipped jobs plus
// the 104 photographs imported from the AD-JEET-PROFILE company deck.
// Raise these numbers as real photos are added; don't lower them to match
// a shrinking set.
describe('gallery data', () => {
  it('has at least 109 photos', () => {
    expect(photos.length).toBeGreaterThanOrEqual(109)
  })

  it('all photo ids are unique', () => {
    const ids = photos.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // The 12 → 5 trim happened because most entries pointed at files that were
  // never shot. This is the guard for that: an entry whose image is missing
  // renders a broken photo on the portfolio, so fail here instead.
  it('every photo src resolves to a real file in public/', () => {
    for (const p of photos) {
      const file = path.join(process.cwd(), 'public', p.src)
      expect(existsSync(file), `photo ${p.id} points at missing file public${p.src}`).toBe(true)
    }
  })

  it('at least 15 photos are featured', () => {
    expect(getFeaturedPhotos().length).toBeGreaterThanOrEqual(15)
  })

  it('every photo has required fields', () => {
    for (const p of photos) {
      expect(p.id).toBeTruthy()
      expect(p.src).toBeTruthy()
      expect(p.alt).toBeTruthy()
      expect(p.client).toBeTruthy()
      expect(p.service).toBeTruthy()
    }
  })

  // Place and year are optional so nothing is invented; when present they must be usable.
  it('optional city and year are valid when set', () => {
    const cities = new Set<string>(CITY_SLUGS)
    for (const p of photos) {
      if (p.city !== undefined) expect(cities.has(p.city), `photo ${p.id} has unknown city "${p.city}"`).toBe(true)
      if (p.year !== undefined) expect(p.year, p.id).toBeGreaterThan(2000)
    }
  })

  it('all photo service slugs are valid', () => {
    const validSlugs = new Set<string>(SERVICE_SLUGS)
    for (const p of photos) {
      expect(validSlugs.has(p.service), `photo ${p.id} has invalid service slug "${p.service}"`).toBe(true)
    }
  })

  it('getPhotosByService filters correctly', () => {
    const result = getPhotosByService('flex-printing')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(p => p.service === 'flex-printing')).toBe(true)
  })

  it('getPhotosByCity filters correctly', () => {
    const result = getPhotosByCity('siliguri')
    expect(result.every(p => p.city === 'siliguri')).toBe(true)
  })

  it('getPhotosByClient and getClients agree', () => {
    const clients = getClients()
    expect(clients.reduce((sum, c) => sum + c.count, 0)).toBe(photos.length)
    for (const client of clients) {
      const result = getPhotosByClient(client.slug)
      expect(result).toHaveLength(client.count)
      expect(result.every(p => clientSlug(p.client) === client.slug)).toBe(true)
    }
  })

  it('every service cover belongs to its service', () => {
    for (const slug of SERVICE_SLUGS) {
      const cover = getServiceCover(slug)
      if (cover) expect(cover.service, slug).toBe(slug)
    }
  })

  it('getPhotoById throws for an unknown id', () => {
    expect(() => getPhotoById('missing-photo')).toThrow(/missing-photo/)
  })
})
