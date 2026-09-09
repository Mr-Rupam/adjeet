import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
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
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { isAwaitingPhotos, AWAITING_PHOTOS_ROBOTS } from '@/lib/publication'
import { photos } from '@/content/gallery'

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
  // Held out of search until this trade has a photograph. See lib/publication.
  return {
    ...generateServiceMetadata(service),
    ...(isAwaitingPhotos(service.slug) ? AWAITING_PHOTOS_ROBOTS : {}),
  }
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
  const workPhoto = photos.find(photo => photo.service === service.slug)

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
      <section className="relative overflow-hidden border-b border-rule bg-paper">
        <div aria-hidden="true" className="grid-mat pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

        <div className="relative mx-auto w-full max-w-content px-5 pt-6 md:px-8" data-site-reveal="meta">
          <div className="spec flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule pb-3 text-ink-muted">
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
          <h1 className="display m-0 text-ink" data-reveal-text style={{ fontSize: 'clamp(2.75rem, 7.5vw, 6.5rem)' }}>
            {service.name}
          </h1>
          <p className="spec mt-4 text-signal" data-site-reveal="label">{service.tagline}</p>
          <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-ink-muted" data-site-reveal="body">
            {service.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4" data-site-reveal="actions">
            <WhatsAppLink
              href={waUrl}
              source={`service:${service.slug}`}
              className="cta cta--yellow cta--md"
            >
              Quote this job →
            </WhatsAppLink>
            <Link
              href="/services"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline underline-offset-4"
            >
              ← All trades
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-paper">
        <div className="mx-auto grid max-w-content gap-8 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14 md:px-8 md:py-16">
          <figure className="m-0" data-site-reveal="media">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-night">
              <Image
                src={workPhoto ? workPhoto.src : '/images/home/materials.webp'}
                alt={workPhoto ? workPhoto.alt : `Material visualization for ${service.name}`}
                fill
                sizes="(max-width: 767px) calc(100vw - 40px), 52vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs text-ink-subtle">
              {workPhoto ? 'Documented project photograph' : 'Material visualization, not a project photograph'}
            </figcaption>
          </figure>
          <div>
            <p className="spec text-signal">What you are planning</p>
            <h2 className="display mt-3 text-ink" data-reveal-text style={{ fontSize: 'var(--text-display-2)' }}>
              The material and the place need to agree.
            </h2>
            <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-ink-muted" data-site-reveal="body">
              Use the specifications below to prepare a useful brief. A site photo and rough dimensions are usually enough to begin.
            </p>
          </div>
        </div>
      </section>

      {/* Spec sheet */}
      <section className="border-b border-rule bg-paper-elevated" aria-label="Service specifications">
        <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
          <p className="spec mb-8 text-signal">Spec sheet: {service.name}</p>
          <div className="grid border-t border-rule md:grid-cols-3 md:divide-x md:divide-rule">
            <div className="border-b border-rule py-6 md:border-b-0 md:px-6 md:first:pl-0">
              <h2 className="spec m-0 text-ink-subtle">Materials</h2>
              <ul className="m-0 mt-4 list-none space-y-2 p-0">
                {service.materials.map(m => (
                  <li key={m} className="border-b border-rule pb-2 text-sm text-ink last:border-0">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-b border-rule py-6 md:border-b-0 md:px-6">
              <h2 className="spec m-0 text-ink-subtle">Sizes / Formats</h2>
              <ul className="m-0 mt-4 list-none space-y-2 p-0">
                {service.sizes.map(s => (
                  <li key={s} className="border-b border-rule pb-2 text-sm text-ink last:border-0">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="py-6 md:pl-6">
              <h2 className="spec m-0 text-ink-subtle">Turnaround</h2>
              <p className="display m-0 mt-4 text-4xl text-ink">{service.turnaround}</p>
              <p className="spec m-0 mt-2 text-ink-subtle">Typical lead time, site-dependent</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      {service.faqs.length > 0 && (
      <section className="border-b border-rule bg-paper">
          <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
              <div>
                <h2 className="display mt-3 text-ink" data-reveal-text style={{ fontSize: 'var(--text-display-2)' }}>
                  Questions worth settling before work starts.
                </h2>
              </div>
              <Accordion items={service.faqs} />
            </div>
          </div>
        </section>
      )}

      {/* Related trades */}
      {related.length > 0 && (
        <section className="border-b border-rule bg-paper">
          <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
            <p className="spec mb-6 text-signal">Often ordered together</p>
            <ol className="m-0 list-none border-t border-rule p-0">
              {related.map(r => (
                <li key={r.slug} className="border-b border-rule">
                  <Link
                    href={`/services/${r.slug}`}
                    className="group flex min-h-20 items-center justify-between gap-4 py-4 transition-colors hover:text-signal md:px-3"
                  >
                    <span className="min-w-0">
                      <span className="display block text-xl text-ink transition-colors group-hover:text-signal md:text-2xl">
                        {r.name}
                      </span>
                      <span className="mt-0.5 block text-sm text-ink-muted">
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
