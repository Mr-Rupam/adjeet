import { describe, expect, it } from 'vitest'
import { readLeadSource, normalizeLeadSource } from '@/lib/lead-source'
describe('non-personal enquiry source labels', () => {
  it('keeps an allowed landing page and recognised Google Business Profile tags', () => {
    expect(readLeadSource('/glow-sign-board-in-siliguri', '?utm_source=google&utm_medium=organic&utm_campaign=gbp')).toEqual({
      landingPage: '/glow-sign-board-in-siliguri', source: 'google', medium: 'organic', campaign: 'gbp',
    })
  })
  it('drops arbitrary source values and all query strings from the landing page', () => {
    expect(normalizeLeadSource({ landingPage: '/contact?phone=9876543210', source: 'Buyer Name', medium: 'email@example.com', campaign: 'my private message' })).toEqual({
      landingPage: '/contact', source: 'unknown', medium: 'unknown', campaign: 'unknown',
    })
  })
  it('does not store arbitrary pathname segments', () => {
    expect(readLeadSource('/customer/9876543210', '')).toMatchObject({ landingPage: 'unknown', source: 'unknown' })
  })
  it('treats missing attribution as unknown instead of inventing direct traffic', () => {
    expect(normalizeLeadSource(undefined)).toEqual({ landingPage: 'unknown', source: 'unknown', medium: 'unknown', campaign: 'unknown' })
  })
})

describe('allowlist upkeep', () => {
  // lead-source.ts runs on every page, so it keeps its own copy of the slugs
  // rather than importing the service copy. This keeps the two in step.
  it('accepts the page of every service the site offers', async () => {
    const { SERVICE_SLUGS } = await import('@/content/services')
    for (const slug of SERVICE_SLUGS) expect(readLeadSource(`/services/${slug}`, '').landingPage).toBe(`/services/${slug}`)
  })
})
