import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import { homeFaqs } from '@/content/home-faqs'
import { ALSO_SERVICES } from '@/content/company-figures'
import { services, SERVICE_SLUGS, getServiceBySlug, type ServiceSlug } from '@/content/services'
import { BENGALI_HELP_PROOFED, SILIGURI_BRIEFS, SILIGURI_SEND_US_BN } from '@/content/service-local'
import { TOWNS } from '@/content/areas'
import { CONTACT_SEND_US, LANGUAGES_LINE } from '@/content/enquiry'
import { generateServiceMetadata } from '@/lib/seo'
import ServiceDetailPage from '@/app/(marketing)/services/[slug]/page'
import ContactPage, { metadata as contactMetadata } from '@/app/(marketing)/contact/page'
import AboutPage, { metadata as aboutMetadata } from '@/app/(marketing)/about/page'
import { metadata as homeMetadata } from '@/app/(marketing)/page'
import { metadata as servicesMetadata } from '@/app/(marketing)/services/page'
import { metadata as portfolioMetadata } from '@/app/(marketing)/portfolio/page'
import { metadata as areasMetadata } from '@/app/(marketing)/areas/page'
import { metadata as forBrandsMetadata } from '@/app/(marketing)/for-brands/page'
import { generateMetadata as townMetadata } from '@/app/(marketing)/areas/[town]/page'
import { metadata as notFoundMetadata } from '@/app/not-found'
import { Footer } from '@/components/Footer'

vi.mock('@/components/sections/LeadForm', () => ({ LeadForm: () => null }))
vi.mock('@/components/PageViewTracker', () => ({ ServicePageTracker: () => null }))
vi.mock('@/components/coverage/CoverageStage', () => ({ CoverageStage: () => null }))
vi.mock('@/components/coverage/CoveragePlaceList', () => ({ CoveragePlaceList: () => null }))
vi.mock('@/components/home/HeroScene', () => ({ HeroScene: () => null }))
vi.mock('@/components/home/HomePageView', () => ({ HomePageView: () => null }))
vi.mock('@/app/(marketing)/portfolio/PortfolioContent', () => ({ PortfolioContent: () => null }))

const words = (text: string) => text.split(/\s+/).filter(Boolean).length
const parse = (element: ReactElement) => new DOMParser().parseFromString(renderToStaticMarkup(element), 'text/html')
const serviceDoc = async (slug: string) => parse(await ServiceDetailPage({ params: Promise.resolve({ slug }) }))

describe('home FAQs (content audit C8, C11)', () => {
  it('opens with the question buyers ask', () => {
    expect(homeFaqs[0].q).toBe('Who makes sign boards in Siliguri?')
  })

  it('gives answers that can be quoted on their own: 40 to 170 words, naming AD JEET and Siliguri', () => {
    for (const faq of homeFaqs) {
      expect(words(faq.a), faq.q).toBeGreaterThanOrEqual(40)
      expect(words(faq.a), faq.q).toBeLessThanOrEqual(170)
      expect(faq.a, faq.q).toContain('AD JEET')
      expect(faq.a, faq.q).toContain('Siliguri')
    }
  })

  it('promises no site visit and counts job times from the order', () => {
    const text = homeFaqs.map(faq => faq.a).join(' ')
    expect(text).not.toMatch(/site visit/i)
    expect(homeFaqs.find(faq => /how long/i.test(faq.q))!.a).toMatch(/days from the order/)
  })

  it('opens the sign board answer with the agency and names the full offer', () => {
    expect(homeFaqs[0].a).toMatch(/^AD JEET, an advertising agency in Siliguri/)
    const about = homeFaqs.find(faq => faq.q.startsWith('What is AD JEET'))!.a
    for (const name of ALSO_SERVICES) expect(about).toContain(name.toLowerCase())
  })
})

describe('claims (content audit C3, C7, C11, C21)', () => {
  it('keeps only what the repository records in the service copy', () => {
    const text = services.flatMap(service => [service.description, ...service.faqs.flatMap(faq => [faq.q, faq.a])]).join(' ')
    for (const removed of [/weatherproofed/, /low energy consumption/, /3.5 years/, /scaffolding/, /trained fitters/, /bubble-free/, /update costs/, /overnight/, /48 hours/, /Absolutely/, /Ask the team to confirm/]) {
      expect(text).not.toMatch(removed)
    }
    const glow = getServiceBySlug('glow-sign-boards')!
    expect(glow.faqs.find(faq => faq.q === 'What warranty do you offer?')!.a).toBe('Warranty depends on the parts and the job. Before you order, ask AD JEET to write down what is covered and for how long.')
  })

  it('names photographed brands instead of an unprovable Fortune 500 line on About', () => {
    const text = parse(<AboutPage />).body.textContent ?? ''
    expect(text).not.toMatch(/Fortune 500/)
    expect(text).toContain('national brands such as Airtel, Havells, Supreme Pipe and Star Cement')
    expect(text).toContain('Who you will deal with')
    expect(text).toContain(LANGUAGES_LINE)
  })
})

describe('service pages', () => {
  it('put the buyer\'s term in the H1 while the trade name still feeds the form', async () => {
    const expected: Partial<Record<ServiceSlug, string>> = {
      'acp-led-signage': 'ACP Sign Boards and 3D LED Letters',
      'events-and-puja': 'Durga Puja and Event Branding',
      'product-display': 'POP Displays and Standees',
      'f-pole-installation': 'F-Pole Sign Boards',
    }
    for (const [slug, h1] of Object.entries(expected)) {
      const doc = await serviceDoc(slug)
      expect(doc.querySelector('h1')?.textContent, slug).toBe(`${h1} in Siliguri & North Bengal`)
      expect(getServiceBySlug(slug as ServiceSlug)!.name, slug).not.toBe(h1)
    }
  })

  it('end with the three Why AD JEET facts above the closing action', async () => {
    for (const slug of SERVICE_SLUGS) {
      const doc = await serviceDoc(slug)
      const why = doc.querySelector('#service-why-heading')?.closest('section')
      expect(why?.textContent, slug).toContain('since 1990')
      expect(why?.querySelectorAll('li'), slug).toHaveLength(3)
      expect(why?.querySelector('a[href="/portfolio"]'), slug).not.toBeNull()
      expect(why?.nextElementSibling?.className, slug).toContain('commission')
    }
  }, 30000)

  // Content audit C9: many readers have English as a second language.
  it('keep every sentence on the glow, ACP and flex pages to 30 words or fewer', async () => {
    for (const slug of ['glow-sign-boards', 'acp-led-signage', 'flex-printing']) {
      const doc = await serviceDoc(slug)
      doc.querySelectorAll('script, #send-brief').forEach(node => node.remove())
      const blocks = [...doc.querySelectorAll('p, li, td, th, h1, h2, h3, summary')].filter(node => !node.querySelector('p, li, td'))
      const long = blocks
        .flatMap(node => (node.textContent ?? '').split(/(?<=[.?!])\s+/))
        .filter(sentence => words(sentence) > 30)
      expect(long, slug).toEqual([])
    }
  })

  it('hold the Bengali send-us list back while it is unproofed, and keep the data', async () => {
    expect(BENGALI_HELP_PROOFED).toBe(false)
    expect(Object.keys(SILIGURI_SEND_US_BN).sort()).toEqual(['acp-led-signage', 'glow-sign-boards'])
    for (const slug of SERVICE_SLUGS) {
      const doc = await serviceDoc(slug)
      expect(doc.querySelector('[lang="bn"]'), slug).toBeNull()
      expect(doc.body.textContent ?? '', slug).not.toMatch(/[ঀ-৿]/)
      const bengali = SILIGURI_SEND_US_BN[slug]
      if (!bengali) continue
      expect(bengali.sendUs, slug).toHaveLength(SILIGURI_BRIEFS[slug]!.sendUs.length)
      for (const item of bengali.sendUs) expect(item, slug).toMatch(/[ঀ-৿]/)
    }
  }, 30000)
})

describe('contact page and footer (content audit C10, C13)', () => {
  it('lists what to send and the languages enquiries are handled in', () => {
    const text = parse(<ContactPage />).body.textContent ?? ''
    for (const item of CONTACT_SEND_US) expect(text).toContain(item)
    expect(text).toContain(LANGUAGES_LINE)
  })

  it('links every service, the areas page and the brand page from the footer, with the languages line', () => {
    const doc = parse(<Footer />)
    const hrefs = [...doc.querySelectorAll('a')].map(link => link.getAttribute('href'))
    for (const slug of SERVICE_SLUGS) expect(hrefs).toContain(`/services/${slug}`)
    expect(hrefs).toContain('/areas')
    expect(hrefs).toContain('/for-brands')
    expect(doc.body.textContent).toContain(LANGUAGES_LINE)
  })
})

describe('titles and descriptions (content audit C17, technical audit T5)', () => {
  const suffix = ' | AD JEET'
  async function allMetadata(): Promise<[string, Metadata][]> {
    const list: [string, Metadata][] = [
      ['/', homeMetadata], ['/services', servicesMetadata], ['/portfolio', portfolioMetadata], ['/about', aboutMetadata],
      ['/contact', contactMetadata], ['/areas', areasMetadata], ['/for-brands', forBrandsMetadata],
    ]
    for (const service of services) list.push([`/services/${service.slug}`, generateServiceMetadata(service)])
    for (const town of TOWNS) list.push([`/areas/${town.slug}`, await townMetadata({ params: Promise.resolve({ town: town.slug }) })])
    return list
  }

  it('keeps every title to 60 characters and every description to 150', async () => {
    for (const [path, metadata] of await allMetadata()) {
      const title = (metadata.title as { absolute: string }).absolute
      expect(title.endsWith(suffix), path).toBe(true)
      expect(title.length - suffix.length, `${path}: ${title}`).toBeLessThanOrEqual(60)
      expect(String(metadata.description).length, `${path}: ${metadata.description}`).toBeLessThanOrEqual(150)
    }
  })

  it('names Siliguri in the portfolio and areas titles', () => {
    expect((portfolioMetadata.title as { absolute: string }).absolute).toMatch(/Siliguri/)
    expect((areasMetadata.title as { absolute: string }).absolute).toMatch(/Siliguri/)
  })

  it('gives the 404 page its own title and description, with no canonical', () => {
    expect((notFoundMetadata.title as { absolute: string }).absolute).toBe('Page not found | AD JEET')
    expect(notFoundMetadata.description).not.toBe(homeMetadata.description)
    expect(notFoundMetadata.alternates).toBeUndefined()
    expect((notFoundMetadata.openGraph as { url?: string }).url).toBeUndefined()
  })
})
