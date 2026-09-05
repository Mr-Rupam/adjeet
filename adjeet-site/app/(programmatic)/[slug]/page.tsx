import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { programmaticPages, getProgrammaticPage } from '@/content/programmatic'
import { getServiceBySlug, type ServiceSlug } from '@/content/services'
import { getPhotosByService } from '@/content/gallery'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, buildServiceJsonLd, buildFaqJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
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
  const city = CITY_LABELS[page.city] ?? page.city
  return {
    // Deliberately NOT page.headline: those run 65-94 characters and are
    // written to work as the on-page <h1>. As a <title> they truncate in the
    // SERP, and the manual "| AD JEET" collided with the root layout's
    // '%s | AD JEET' template, so every one of these 25 pages rendered the
    // brand twice. Service + city keeps it keyword-first and inside ~60.
    title: service ? `${service.name} in ${city}` : page.headline,
    description: [service?.tagline?.replace(/[.\s]+$/, ''), `Serving ${city}, North Bengal`, 'Contact AD JEET for a same-day quote']
      .filter(Boolean)
      .join('. ') + '.',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(serviceSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />

      {/* Masthead */}
      <section className="relative overflow-hidden border-b-2 border-ink bg-paper">
        <div aria-hidden="true" className="grid-mat pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

        <div className="relative mx-auto w-full max-w-content px-5 pt-6 md:px-8">
          <nav aria-label="Breadcrumb" className="spec border-b-2 border-ink pb-3 text-ink-muted">
            <ol className="m-0 flex list-none gap-2 p-0">
              <li><Link href="/" className="transition-colors hover:text-ink">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/services/${service.slug}`} className="transition-colors hover:text-ink">
                  {service.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink">{cityLabel}</li>
            </ol>
          </nav>
        </div>

        <div className="relative mx-auto w-full max-w-content px-5 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14">
          <p className="spec text-signal">
            <span className="mr-2 inline-block h-2 w-2 bg-signal align-baseline" aria-hidden="true" />
            {service.name} — {cityLabel}
          </p>
          <h1 className="display m-0 mt-4 text-ink" style={{ fontSize: 'clamp(2.5rem, 6.5vw, 5.5rem)' }}>
            {page.headline}
          </h1>

          <dl className="m-0 mt-8 flex flex-wrap gap-6 md:gap-10">
            {page.stats.map(s => (
              <div key={s.label} className="flex flex-col border-l-2 border-ink pl-4">
                <dt className="spec order-2 text-ink-subtle">{s.label}</dt>
                <dd className="display order-1 m-0 text-4xl text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Body */}
      <section className="border-b-2 border-ink bg-paper">
        <div className="mx-auto max-w-content px-5 py-14 md:px-8 md:py-20">
          <div className="max-w-2xl space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-ink-muted">{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {photos.length > 0 && <GalleryStrip photos={photos} />}

      {/* Related cities */}
      {page.relatedCities.length > 0 && (
        <section className="border-b-2 border-ink bg-paper-elevated">
          <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
            <p className="spec mb-5 text-signal">Also available in</p>
            <div className="flex flex-wrap gap-3">
              {page.relatedCities.map(city => (
                <Link
                  key={city}
                  href={`/${page.service}-in-${city}`}
                  className="spec border-2 border-ink px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  {service.name} in {CITY_LABELS[city] ?? city}
                </Link>
              ))}
              <Link
                href={`/services/${service.slug}`}
                className="spec border-2 border-ink/25 px-4 py-2.5 text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                ← All {service.name}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-signal">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-20">
          <p className="spec text-ink/70">Commission a sign</p>
          <h2 className="display mt-4 text-ink" style={{ fontSize: 'clamp(2.25rem, 6vw, 5rem)' }}>
            {service.name}
            <br />
            in {cityLabel}.
          </h2>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 border-2 border-ink bg-ink px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-paper shadow-[5px_5px_0_0_rgba(0,0,0,0.35)] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[7px_7px_0_0_rgba(0,0,0,0.35)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_rgba(0,0,0,0.35)]"
          >
            WhatsApp us now →
          </a>
          <p className="spec mt-8 text-ink/60">
            Reply within 2 hours · Free quote, valid 15 days
          </p>
        </div>
      </section>
    </>
  )
}
