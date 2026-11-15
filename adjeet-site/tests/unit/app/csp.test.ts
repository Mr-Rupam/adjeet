// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { unstable_getResponseFromNextConfig } from 'next/experimental/testing/server'
import nextConfig from '@/next.config'

async function directives(): Promise<Map<string, string[]>> {
  const routes = await nextConfig.headers!()
  const csp = routes.flatMap((r) => r.headers).find((h) => h.key === 'Content-Security-Policy')
  expect(csp).toBeDefined()
  return new Map(
    csp!.value.split(';').map((part) => {
      const [name, ...sources] = part.trim().split(/\s+/)
      return [name, sources]
    }),
  )
}

describe('Content-Security-Policy', () => {
  it('lets GA4 send consent-denied and consent-granted hits', async () => {
    const connect = (await directives()).get('connect-src')!
    // Consent Mode v2 cookieless pings (gcs=G100).
    expect(connect).toContain('https://www.google.com')
    // Consent-granted hits on www and regional collection hosts.
    expect(connect).toContain('https://*.google-analytics.com')
    expect(connect).toContain('https://*.analytics.google.com')
    expect(connect).toContain('https://analytics.google.com')
    expect(connect).toContain('https://www.googletagmanager.com')
  })

  it('does not open connect-src to broad wildcards', async () => {
    const connect = (await directives()).get('connect-src')!
    for (const source of ['*', 'https:', 'https://*.google.com']) {
      expect(connect).not.toContain(source)
    }
  })

  it('loads gtag.js from Google Tag Manager', async () => {
    expect((await directives()).get('script-src')).toContain('https://www.googletagmanager.com')
  })
})

describe('script-src and img-src', () => {
  it('does not allow scripts from google-analytics.com, which serves no script the site loads', async () => {
    expect((await directives()).get('script-src')).not.toContain('https://www.google-analytics.com')
  })

  it('leaves img-src as it was, since Google Analytics cannot be exercised locally', async () => {
    expect((await directives()).get('img-src')).toEqual(["'self'", 'data:', 'https:'])
  })
})

describe('other response headers', () => {
  async function headersFor(path: string) {
    const response = await unstable_getResponseFromNextConfig({ url: `https://adjeet.in${path}`, nextConfig })
    return response.headers
  }

  it('isolates the browsing context with Cross-Origin-Opener-Policy', async () => {
    expect((await headersFor('/')).get('cross-origin-opener-policy')).toBe('same-origin')
  })

  it.each(['/hero/shopfront.webp', '/brand/adjeet-original.png', '/client-logos/vivo.png', '/images/work/board.jpg'])(
    'caches raw public media for 30 days: %s',
    async (path) => {
      const headers = await headersFor(path)
      expect(headers.get('cache-control')).toBe('public, max-age=2592000, stale-while-revalidate=86400')
      // The security headers still apply to these files.
      expect(headers.get('x-content-type-options')).toBe('nosniff')
    },
  )

  it.each(['/', '/contact', '/data/coverage.json', '/og-image.jpg', '/heroes'])('sets no long cache on %s', async (path) => {
    expect((await headersFor(path)).get('cache-control')).toBeNull()
  })
})
