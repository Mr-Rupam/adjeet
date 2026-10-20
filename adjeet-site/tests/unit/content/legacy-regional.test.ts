// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getRedirectUrl, unstable_getResponseFromNextConfig } from 'next/experimental/testing/server'
import nextConfig from '@/next.config'
import { LEGACY_REGIONAL_REDIRECTS } from '@/content/legacy-regional'
import { SERVICE_SLUGS } from '@/content/services'
import { TOWN_SLUGS } from '@/content/areas'

// The 27 URLs that existed until 20 October 2026: five trades in five North
// Bengal towns, plus glow and ACP in Gangtok. Written out from the URL scheme
// rather than read from the redirect list, so a missing entry is caught.
const TRADES = {
  'glow-sign-board': 'glow-sign-boards',
  'acp-led-signage': 'acp-led-signage',
  'flex-printing': 'flex-printing',
  'vehicle-branding': 'vehicle-branding',
  'f-pole-installation': 'f-pole-installation',
} as const
const TOWNS_WITH_ALL_TRADES = ['siliguri', 'jalpaiguri', 'cooch-behar', 'darjeeling', 'malda']

const RETIRED: { source: string; destination: string }[] = [
  ...Object.entries(TRADES).flatMap(([prefix, service]) =>
    TOWNS_WITH_ALL_TRADES.map(town => ({
      source: `/${prefix}-in-${town}`,
      destination: town === 'siliguri' ? `/services/${service}`
        : town === 'cooch-behar' || town === 'jalpaiguri' ? `/areas/${town}`
        : '/areas',
    })),
  ),
  { source: '/glow-sign-board-in-gangtok', destination: '/areas/gangtok' },
  { source: '/acp-led-signage-in-gangtok', destination: '/areas/gangtok' },
]

describe('retired regional URLs', () => {
  it('maps every one of the 27 old URLs, once, to the page that absorbed it', () => {
    expect(RETIRED).toHaveLength(27)
    expect(LEGACY_REGIONAL_REDIRECTS).toHaveLength(27)
    expect(new Set(LEGACY_REGIONAL_REDIRECTS.map(entry => entry.source)).size).toBe(27)
    expect([...LEGACY_REGIONAL_REDIRECTS].sort((a, b) => a.source.localeCompare(b.source)))
      .toEqual([...RETIRED].sort((a, b) => a.source.localeCompare(b.source)))
  })

  it('sends each one to a page that exists, never to another redirect', () => {
    const sources = new Set<string>(LEGACY_REGIONAL_REDIRECTS.map(entry => entry.source))
    for (const { source, destination } of LEGACY_REGIONAL_REDIRECTS) {
      expect(sources.has(destination), source).toBe(false)
      const live = destination === '/areas'
        || (SERVICE_SLUGS as readonly string[]).some(slug => destination === `/services/${slug}`)
        || (TOWN_SLUGS as readonly string[]).some(slug => destination === `/areas/${slug}`)
      expect(live, `${source} -> ${destination}`).toBe(true)
    }
  })

  it('is applied by next.config as permanent redirects', async () => {
    const rules = await nextConfig.redirects!()
    expect(rules).toHaveLength(27)
    for (const rule of rules) expect(rule).toMatchObject({ permanent: true })
  })

  // A sample from each kind of destination, through Next's own routing.
  for (const [source, destination] of [
    ['/glow-sign-board-in-siliguri', '/services/glow-sign-boards'],
    ['/f-pole-installation-in-cooch-behar', '/areas/cooch-behar'],
    ['/vehicle-branding-in-jalpaiguri', '/areas/jalpaiguri'],
    ['/acp-led-signage-in-gangtok', '/areas/gangtok'],
    ['/flex-printing-in-malda', '/areas'],
    ['/glow-sign-board-in-darjeeling', '/areas'],
  ]) {
    it(`answers ${source} with 308 to ${destination}, keeping the query`, async () => {
      const response = await unstable_getResponseFromNextConfig({ url: `https://adjeet.in${source}?city=Malda`, nextConfig })
      expect(response.status).toBe(308)
      expect(getRedirectUrl(response)).toBe(`https://adjeet.in${destination}?city=Malda`)
    })
  }

  it('leaves the pages that replaced them alone', async () => {
    for (const path of ['/areas', '/areas/cooch-behar', '/services/glow-sign-boards']) {
      const response = await unstable_getResponseFromNextConfig({ url: `https://adjeet.in${path}`, nextConfig })
      expect(getRedirectUrl(response), path).toBeNull()
    }
  })
})
