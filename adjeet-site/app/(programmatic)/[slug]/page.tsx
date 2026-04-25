import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { programmaticPages, getProgrammaticPage } from '@/content/programmatic'
import { getServiceBySlug, type ServiceSlug } from '@/content/services'
import { getPhotosByService } from '@/content/gallery'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, buildServiceJsonLd, buildFaqJsonLd, siteConfig } from '@/lib/seo'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { ProgrammaticPageTracker } from '@/components/PageViewTracker'

const CITY_LABELS: Record<string, string> = {
  siliguri: 'Siliguri',
  jalpaiguri: 'Jalpaiguri',
  'cooch-behar': 'Cooch Behar',
  darjeeling: 'Darjeeling',
  malda: 'Malda',
}

type Params = { slug: string }

export function generateStaticParams() {
  return programmaticPages.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const page = getProgrammaticPage(slug)
  if (!page) return {}
  const service = getServiceBySlug(page.service as ServiceSlug)
  return {
    title: `${page.headline} | AD-JEET`,
    description: `${service?.tagline ?? ''} Serving ${CITY_LABELS[page.city] ?? page.city}, North Bengal. Contact AD-JEET for a same-day quote.`,
    alternates: { canonical: `${siteConfig.url}/${slug}` },
  }
}

export default async function ProgrammaticPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const page = getProgrammaticPage(slug)
  if (!page) notFound()

  const service = getServiceBySlug(page.service as ServiceSlug)
  if (!service) notFound()

  const photos = getPhotosByService(page.service as ServiceSlug).filter(p => p.city === page.city)
  const waUrl = defaultWhatsAppUrl({ service: service.name, city: CITY_LABELS[page.city] })
  const cityLabel = CITY_LABELS[page.city] ?? page.city

  const serviceSchema = buildServiceJsonLd(service)
  const faqSchema = service.faqs.length > 0 ? buildFaqJsonLd(service.faqs) : null
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: service.name, url: `/services/${service.slug}` },
    { name: cityLabel, url: `/${slug}` },
  ])

  const paragraphs = page.body.split('\n\n').filter(Boolean)

  return (
    <>
      <ProgrammaticPageTracker service={page.service} city={page.city} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Hero */}
      <section className="flex items-end min-h-[40vh] bg-surface-inverse py-16">
        <div className="mx-auto max-w-content px-6">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex gap-2 text-xs text-white/50 list-none p-0 m-0">
              <li><Link href="/" className="hover:text-white/80 transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href={`/services/${service.slug}`} className="hover:text-white/80 transition-colors">{service.name}</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/80">{cityLabel}</li>
            </ol>
          </nav>
          <h1 className="text-[var(--text-display-2)] font-[var(--font-fraunces)] font-bold text-white mb-4 leading-tight">
            {page.headline}
          </h1>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-paper-elevated border-y border-rule py-10">
        <div className="mx-auto max-w-content px-6">
          <dl className="flex flex-wrap gap-12">
            {page.stats.map(s => (
              <div key={s.label}>
                <dd className="text-3xl font-bold font-[var(--font-fraunces)] text-ink">{s.value}</dd>
                <dt className="text-xs text-ink-subtle mt-1">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Body */}
      <section className="py-[var(--section-py)] border-b border-rule">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-2xl space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-ink-muted leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {photos.length > 0 && <GalleryStrip photos={photos} />}

      {/* WhatsApp CTA */}
      <section className="bg-blue py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-white text-2xl font-bold mb-3">
            Get a quote for {service.name} in {cityLabel}
          </h2>
          <p className="text-white/80 mb-8">WhatsApp us — we respond within 2 hours on business days.</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded bg-white text-blue font-semibold px-8 py-3.5 hover:bg-white/90 transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* Related cities */}
      {page.relatedCities.length > 0 && (
        <section className="py-12 border-t border-rule">
          <div className="mx-auto max-w-content px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-4">
              Also available in
            </p>
            <div className="flex flex-wrap gap-3">
              {page.relatedCities.map(city => {
                const relSlug = `${page.service}-in-${city}`
                return (
                  <Link
                    key={city}
                    href={`/${relSlug}`}
                    className="px-4 py-2 rounded-full border border-rule text-sm text-ink-muted hover:border-blue hover:text-blue transition-colors"
                  >
                    {service.name} in {CITY_LABELS[city] ?? city}
                  </Link>
                )
              })}
              <Link
                href={`/services/${service.slug}`}
                className="px-4 py-2 rounded-full border border-rule text-sm text-ink-muted hover:border-blue hover:text-blue transition-colors"
              >
                ← All {service.name}
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
