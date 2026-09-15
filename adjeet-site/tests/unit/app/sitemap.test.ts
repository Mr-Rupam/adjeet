import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'
import { SERVICE_SLUGS } from '@/content/services'
import { getProgrammaticSlugs } from '@/content/programmatic'
import { siteConfig } from '@/lib/seo'

const entries = sitemap()
const urls = entries.map(entry => entry.url)

describe('sitemap', () => {
  it('includes every service, including useful pages without photographs', () => {
    for (const slug of SERVICE_SLUGS) {
      expect(urls).toContain(`${siteConfig.url}/services/${slug}`)
    }
  })
  it('includes the reviewed regional guides', () => {
    for (const slug of getProgrammaticSlugs()) expect(urls).toContain(`${siteConfig.url}/${slug}`)
  })
  it('includes the core marketing pages', () => {
    for (const path of ['', '/services', '/portfolio', '/about', '/contact']) expect(urls).toContain(siteConfig.url + path)
  })
  it('excludes the noindex privacy page and optional machine-readable aid', () => {
    expect(urls).not.toContain(siteConfig.url + '/privacy')
    expect(urls).not.toContain(siteConfig.url + '/llms.txt')
  })
  it('has no duplicate URLs and uses the canonical host', () => {
    expect(new Set(urls).size).toBe(urls.length)
    for (const url of urls) expect(new URL(url).origin).toBe(siteConfig.url)
  })
  it('scales with the content inventory', () => {
    expect(entries).toHaveLength(5 + SERVICE_SLUGS.length + getProgrammaticSlugs().length)
  })
  it('uses the content review date rather than the deployment date', () => {
    for (const entry of entries) expect(entry.lastModified).toEqual(new Date('2026-09-15'))
  })
})
