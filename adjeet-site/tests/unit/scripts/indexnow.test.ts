import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseSitemap, readKey, selectUrls } from '@/scripts/indexnow.mjs'

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
<url>
<loc>https://adjeet.in</loc>
<lastmod>2026-09-24T00:00:00.000Z</lastmod>
</url>
<url>
<loc>https://adjeet.in/portfolio</loc>
<image:image>
<image:loc>https://adjeet.in/images/work/a.webp</image:loc>
</image:image>
<lastmod>2026-09-15T00:00:00.000Z</lastmod>
</url>
<url>
<loc>https://adjeet.in/contact</loc>
</url>
</urlset>`

describe('IndexNow key', () => {
  it('is one 32-character hex file in public/ that contains its own name', () => {
    const key = readKey()
    expect(key).toMatch(/^[0-9a-f]{32}$/)
    expect(fs.readFileSync(path.join(process.cwd(), 'public', `${key}.txt`), 'utf8')).toBe(key)
  })
})

describe('IndexNow URL selection', () => {
  const entries = parseSitemap(SITEMAP)

  it('reads each page URL and the date part of its lastmod, ignoring image URLs', () => {
    expect(entries).toEqual([
      { loc: 'https://adjeet.in', lastmod: '2026-09-24' },
      { loc: 'https://adjeet.in/portfolio', lastmod: '2026-09-15' },
      { loc: 'https://adjeet.in/contact', lastmod: undefined },
    ])
  })

  it('submits pages reviewed on or after the cut-off, and pages with no date', () => {
    expect(selectUrls(entries, { since: '2026-09-20' })).toEqual(['https://adjeet.in', 'https://adjeet.in/contact'])
    expect(selectUrls(entries, { since: '2026-09-15' })).toHaveLength(3)
    expect(selectUrls(entries, { since: '2026-09-25' })).toEqual(['https://adjeet.in/contact'])
  })

  it('submits everything when asked, and refuses a malformed cut-off', () => {
    expect(selectUrls(entries, { all: true })).toHaveLength(3)
    expect(() => selectUrls(entries, { since: '24/09/2026' })).toThrow()
    expect(() => selectUrls(entries, {})).toThrow()
  })
})

describe('IndexNow workflow', () => {
  it('runs the script after successful production deployments only', () => {
    const workflow = fs.readFileSync(path.join(process.cwd(), '..', '.github', 'workflows', 'indexnow.yml'), 'utf8')
    expect(workflow).toContain('deployment_status:')
    expect(workflow).toContain("github.event.deployment_status.state == 'success'")
    expect(workflow).toContain("github.event.deployment.environment == 'Production'")
    expect(workflow).toContain('node scripts/indexnow.mjs')
  })
})
