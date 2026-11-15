// @vitest-environment node
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { siteConfig, buildLocalBusinessJsonLd } from '@/lib/seo'
import { homeFaqs } from '@/content/home-faqs'
import { services } from '@/content/services'
import { ADJEET_SYSTEM_PROMPT, ADJEET_GREETING } from '@/lib/chatbot-prompt'
import { GET as llms } from '@/app/llms.txt/route'
import manifest from '@/app/manifest'
import { metadata as homeMetadata } from '@/app/(marketing)/page'
import { Footer } from '@/components/Footer'
import { CommissionCTA } from '@/components/street/CommissionCTA'

/**
 * The site speaks as an advertising agency (brand platform, 16 November 2026).
 * These guards fail if the old category words, a banned word or a banned
 * figure comes back.
 */

const ROOT = path.resolve('.')

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap(entry => {
    const rel = path.join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(rel)
    return /\.(ts|tsx)$/.test(entry.name) ? [rel] : []
  })
}

const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

// Page and copy sources. Code-only words such as CSS `transform` are excluded
// by checking quoted strings and JSX text rather than whole files.
const PAGE_SOURCES = [...sourceFiles('app'), ...sourceFiles('components'), ...sourceFiles('content'), 'lib/seo.ts', 'lib/chatbot-prompt.ts', 'lib/business.ts']

/** The business described as a sign-board maker, signage company or workshop. */
const OLD_CATEGORY = /sign[- ]?boards? makers? in siliguri|sign[- ]?board makers?|sign[- ]board and outdoor advertising (company|workshop)|signage (company|workshop|business)\b(?!'s)|sign-board maker/i

/**
 * Service-level search terms may keep the trade phrase; they name a product,
 * not the business.
 */
const TRADE_TERM_FILES = new Set([path.join('content', 'service-search.ts')])
const isComment = (line: string) => /^\s*(\/\/|\*|\/\*\*|\{\/\*)/.test(line)

const BANNED_WORDS = /\b(solutions?|end-to-end|seamless(ly)?|unforgettable|elevate[sd]?|cutting-edge|one-stop|we believe|passionate)\b|24\/7|brand experience/i

const OLD_TAGLINES = [
  'Illuminate your brand 24/7', 'Clean, durable faces for modern brands', 'Large-format print for every surface',
  'Turn every kilometre into an impression', 'Durable outdoor advertising on any wall', 'High-visibility roadside display structures',
  'Turn your interior into a brand experience', 'Make every celebration unforgettable', 'Brand your glass without blocking the view',
  'Showcase products that sell themselves',
]

describe('the business is an advertising agency', () => {
  it('no page source calls the business sign board makers, outside service-level search terms', () => {
    const hits = PAGE_SOURCES
      .filter(file => !TRADE_TERM_FILES.has(file))
      .flatMap(file => read(file).split('\n').map((line, index) => ({ file, index, line })))
      .filter(({ line }) => !isComment(line) && OLD_CATEGORY.test(line))
      .map(({ file, index, line }) => `${file}:${index + 1}: ${line.trim()}`)
    expect(hits).toEqual([])
  })

  it('leads the site description, schema, titles, manifest and summaries with the agency', async () => {
    expect(siteConfig.description).toMatch(/^Advertising agency in Siliguri/)
    expect(siteConfig.description).toMatch(/sign boards/)
    const business = buildLocalBusinessJsonLd()
    expect(business.disambiguatingDescription).toMatch(/advertising agency/)
    expect((homeMetadata.title as { absolute: string }).absolute).toMatch(/^Advertising Agency in Siliguri/)
    // The root layout pulls in fonts and client islands, so its titles are read from source.
    const layoutTitles = read(path.join('app', 'layout.tsx')).match(/(default|title): '[^']+'/g) ?? []
    expect(layoutTitles).toHaveLength(3)
    for (const title of layoutTitles) expect(title).toMatch(/: 'Advertising Agency in Siliguri/)
    expect(manifest().name).toMatch(/advertising agency/)
    expect(await llms().text()).toMatch(/is an advertising agency in Siliguri/)
    expect(ADJEET_SYSTEM_PROMPT).toMatch(/an advertising agency/)
    expect(homeFaqs[0].q).toBe('Who makes sign boards in Siliguri?')
    expect(homeFaqs[0].a).toMatch(/^AD JEET, an advertising agency in Siliguri/)
  })

  it('names the three added services in the schema without a URL', () => {
    const catalogue = buildLocalBusinessJsonLd().hasOfferCatalog.itemListElement
    for (const name of ['Hoardings and billboards', 'Exhibitions and dealer meets', 'Activations and road shows']) {
      const offer = catalogue.find(item => item.itemOffered.name === name)
      expect(offer, name).toBeDefined()
      expect(offer!.itemOffered).not.toHaveProperty('url')
      expect(buildLocalBusinessJsonLd().knowsAbout).toContain(name)
    }
  })
})

describe('voice', () => {
  it('uses none of the banned words or old taglines in copy', async () => {
    const copy = [
      siteConfig.description, ADJEET_SYSTEM_PROMPT, ADJEET_GREETING, await llms().text(),
      ...homeFaqs.flatMap(faq => [faq.q, faq.a]),
      ...services.flatMap(service => [service.tagline, service.description, service.answer, ...service.faqs.flatMap(faq => [faq.q, faq.a])]),
      renderToStaticMarkup(<Footer />), renderToStaticMarkup(<CommissionCTA />),
    ]
    for (const text of copy) {
      expect(text.match(BANNED_WORDS)?.[0], text.slice(0, 80)).toBeUndefined()
      expect(text, text.slice(0, 80)).not.toMatch(/[–—]/)
      for (const tagline of OLD_TAGLINES) expect(text).not.toContain(tagline)
    }
  })

  it('keeps banned words out of string literals in the content files', () => {
    const hits = sourceFiles('content')
      .flatMap(file => read(file).split('\n').map((line, index) => ({ file, index, line })))
      .filter(({ line }) => !/^\s*(\/\/|\*|\/\*\*)/.test(line) && BANNED_WORDS.test(line))
      .map(({ file, index, line }) => `${file}:${index + 1}: ${line.trim()}`)
    expect(hits).toEqual([])
  })
})

describe('figures', () => {
  it('never states a count of clients today, or a price, in the content files', () => {
    const hits = sourceFiles('content')
      .flatMap(file => read(file).split('\n').map((line, index) => ({ file, index, line })))
      .filter(({ line }) => !/^\s*(\/\/|\*|\/\*\*)/.test(line))
      // A bare 26 (the old client count); distances such as "26 km" are not counts.
      .filter(({ line }) => /(?<![\d.\-/#_])26(?![\d.]|\s?km\b)|\b17 clients\b|₹|\bRs\.? ?\d|\bINR\b/i.test(line))
      .map(({ file, index, line }) => `${file}:${index + 1}: ${line.trim()}`)
    expect(hits).toEqual([])
  })
})
