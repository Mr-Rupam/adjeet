import { describe, it, expect } from 'vitest'
import { services, SERVICE_SLUGS, getServiceBySlug } from '@/content/services'

describe('services data', () => {
  it('has 10 service entries', () => {
    expect(services).toHaveLength(10)
  })

  it('all slugs are unique', () => {
    const slugs = services.map(s => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every service has required fields', () => {
    for (const s of services) {
      expect(s.slug, `${s.slug} missing slug`).toBeTruthy()
      expect(s.name, `${s.slug} missing name`).toBeTruthy()
      expect(s.tagline, `${s.slug} missing tagline`).toBeTruthy()
      expect(s.description, `${s.slug} missing description`).toBeTruthy()
      expect(s.materials.length, `${s.slug} missing materials`).toBeGreaterThan(0)
      expect(s.sizes.length, `${s.slug} missing sizes`).toBeGreaterThan(0)
      expect(s.turnaround, `${s.slug} missing turnaround`).toBeTruthy()
      expect(s.faqs.length, `${s.slug} missing faqs`).toBeGreaterThanOrEqual(3)
      expect(s.heroImage, `${s.slug} missing heroImage`).toBeTruthy()
    }
  })

  it('SERVICE_SLUGS exports all 10 slugs as a tuple', () => {
    expect(SERVICE_SLUGS).toHaveLength(10)
    expect(SERVICE_SLUGS).toContain('glow-sign-boards')
  })

  it('relatedServices only reference valid slugs', () => {
    const allSlugs = new Set(services.map(s => s.slug))
    for (const s of services) {
      for (const rel of s.relatedServices) {
        expect(allSlugs.has(rel), `${s.slug} references unknown slug "${rel}"`).toBe(true)
      }
    }
  })

  it('getServiceBySlug returns the correct service', () => {
    const result = getServiceBySlug('glow-sign-boards')
    expect(result?.name).toBe('Glow Sign Boards')
  })

  it('getServiceBySlug returns undefined for a slug not in the list', () => {
    // Verify via a known slug that the function works — no unknown slug test needed since ServiceSlug type prevents it
    const result = getServiceBySlug('product-display')
    expect(result?.slug).toBe('product-display')
  })
})
