import { describe, it, expect } from 'vitest'
import { photos, getFeaturedPhotos, getPhotosByService, getPhotosByCity } from '@/content/gallery'
import { SERVICE_SLUGS } from '@/content/services'

describe('gallery data', () => {
  it('has at least 12 photos', () => {
    expect(photos.length).toBeGreaterThanOrEqual(12)
  })

  it('all photo ids are unique', () => {
    const ids = photos.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('at least 6 photos are featured', () => {
    expect(getFeaturedPhotos().length).toBeGreaterThanOrEqual(6)
  })

  it('every photo has required fields', () => {
    for (const p of photos) {
      expect(p.id).toBeTruthy()
      expect(p.src).toBeTruthy()
      expect(p.alt).toBeTruthy()
      expect(p.service).toBeTruthy()
      expect(p.city).toBeTruthy()
      expect(p.year).toBeGreaterThan(2000)
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
    expect(result.every(p => p.service === 'flex-printing')).toBe(true)
  })

  it('getPhotosByCity filters correctly', () => {
    const result = getPhotosByCity('siliguri')
    expect(result.every(p => p.city === 'siliguri')).toBe(true)
  })
})
