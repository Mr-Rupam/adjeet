import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { photos, getFeaturedPhotos, getPhotosByService, getPhotosByCity } from '@/content/gallery'
import { SERVICE_SLUGS } from '@/content/services'

// Thresholds below track the real photo set (5 shipped jobs as of the v3
// content cut, commit 8e5dc1e — gallery.ts was trimmed from 12 placeholder
// entries down to only the photographs that actually exist in public/).
// Raise these numbers as real photos are added; don't lower them to match
// a shrinking set.
describe('gallery data', () => {
  it('has at least 5 photos', () => {
    expect(photos.length).toBeGreaterThanOrEqual(5)
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

  it('at least 5 photos are featured', () => {
    expect(getFeaturedPhotos().length).toBeGreaterThanOrEqual(5)
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
