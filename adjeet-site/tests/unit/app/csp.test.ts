import { describe, expect, it } from 'vitest'
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
