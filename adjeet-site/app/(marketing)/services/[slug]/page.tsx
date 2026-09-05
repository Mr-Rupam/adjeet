import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  SERVICE_SLUGS,
  services,
  getServiceBySlug,
  type ServiceSlug,
} from '@/content/services'
import {
  buildServiceJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  generateServiceMetadata,
  jsonLdString,
} from '@/lib/seo'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { ServicePageTracker } from '@/components/PageViewTracker'
import { Accordion } from '@/components/ui/Accordion'
import { CommissionCTA } from '@/components/street/CommissionCTA'

type Params = { slug: string }

export function generateStaticParams() {
  return SERVICE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug as ServiceSlug)
  if (!service) return {}
  return generateServiceMetadata(service)
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const service = getServiceBySlug(slug as ServiceSlug)
  if (!service) notFound()

  const waUrl = defaultWhatsAppUrl({ service: service.name })
  const serviceIndex = SERVICE_SLUGS.indexOf(slug as ServiceSlug) + 1
  const indexStr = String(serviceIndex).padStart(2, '0')
  const totalStr = String(SERVICE_SLUGS.length).padStart(2, '0')
  const related = service.relatedServices
    .map(s => services.find(x => x.slug === s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const serviceSchema = buildServiceJsonLd(service)
  const faqSchema = buildFaqJsonLd(service.faqs)
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${service.slug}` },
  ])

  return (
    <>
      <ServicePageTracker service={service.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbSchema) }}
      />

      {/* Masthead */}
      <section className="relative overflow-hidden border-b-2 border-ink bg-paper">
        <div aria-hidden="true" className="grid-mat pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

        <div className="relative mx-auto w-full max-w-content px-5 pt-6 md:px-8">
          <div className="spec flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-3 text-ink-muted">
            <nav aria-label="Breadcrumb" className="flex items-baseline gap-2">
              <Link href="/" className="transition-colors hover:text-ink">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/services" className="transition-colors hover:text-ink">Services</Link>
              <span aria-hidden="true">/</span>
              <span className="text-ink">{service.name}</span>
            </nav>
            <span aria-label={`Service ${serviceIndex} of ${SERVICE_SLUGS.length}`}>
              Trade {indexStr} / {totalStr}
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-content px-5 pb-12 pt-10 md:px-8 md:pb-14 md:pt-14">
          <h1 className="display m-0 text-ink" style={{ fontSize: 'clamp(2.75rem, 7.5vw, 6.5rem)' }}>
            {service.name}
          </h1>
          <p className="spec mt-4 text-signal">{service.tagline}</p>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-ink-muted">
            {service.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-ink bg-signal px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-ink shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--ink)]"
            >
              Quote this job →
            </a>
            <Link
              href="/services"
              className="spec inline-flex items-center gap-2 border-2 border-ink px-5 py-3.5 text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              ← All trades
            </Link>
          </div>
        </div>
      </section>

      {/* Spec sheet */}
      <section className="border-b-2 border-ink bg-paper-elevated" aria-label="Service specifications">
        <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
          <p className="spec mb-8 text-signal">Spec sheet: {service.name}</p>
          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            <div className="plate p-6">
              <h2 className="spec m-0 text-ink-subtle">Materials</h2>
              <ul className="m-0 mt-4 list-none space-y-2 p-0">
                {service.materials.map(m => (
                  <li key={m} className="border-b border-rule pb-2 text-sm text-ink last:border-0">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="plate p-6">
              <h2 className="spec m-0 text-ink-subtle">Sizes / Formats</h2>
              <ul className="m-0 mt-4 list-none space-y-2 p-0">
                {service.sizes.map(s => (
                  <li key={s} className="border-b border-rule pb-2 text-sm text-ink last:border-0">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="plate-signal p-6">
              <h2 className="spec m-0 text-ink-subtle">Turnaround</h2>
              <p className="display m-0 mt-4 text-4xl text-ink">{service.turnaround}</p>
              <p className="spec m-0 mt-2 text-ink-subtle">Typical lead time, site-dependent</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      {service.faqs.length > 0 && (
        <section className="border-b-2 border-ink bg-paper">
          <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
              <div>
                <p className="spec text-signal">Straight answers</p>
                <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
                  Asked on every site visit.
                </h2>
              </div>
              <Accordion items={service.faqs} />
            </div>
          </div>
        </section>
      )}

      {/* Related trades */}
      {related.length > 0 && (
        <section className="border-b-2 border-ink bg-paper">
          <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
            <p className="spec mb-6 text-signal">Often ordered together</p>
            <ol className="m-0 list-none border-t-2 border-ink p-0">
              {related.map(r => (
                <li key={r.slug} className="border-b-2 border-ink">
                  <Link
                    href={`/services/${r.slug}`}
                    className="group flex items-baseline justify-between gap-4 px-2 py-4 transition-colors hover:bg-ink md:px-4"
                  >
                    <span className="min-w-0">
                      <span className="display block text-xl text-ink transition-colors group-hover:text-paper md:text-2xl">
                        {r.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-subtle transition-colors group-hover:text-paper/60">
                        {r.tagline}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-lg text-ink-subtle transition-all group-hover:translate-x-1 group-hover:text-signal">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <CommissionCTA />
    </>
  )
}
