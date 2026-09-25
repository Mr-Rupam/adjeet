import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LoadingImage as Image } from '@/components/ui/LoadingImage'
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
  buildWebPageJsonLd,
  generateServiceMetadata,
  jsonLdString,
} from '@/lib/seo'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { ServicePageTracker } from '@/components/PageViewTracker'
import { Accordion } from '@/components/ui/Accordion'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { programmaticPages, CITY_LABELS } from '@/content/programmatic'
import { getPhotosByService, getServiceCover } from '@/content/gallery'
import { formatReviewDate, reviewedOn } from '@/content/page-reviews'
import { COMPARED_SLUGS } from '@/content/sign-comparison'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { SignComparison } from '@/components/sections/SignComparison'

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
  const workPhoto = getServiceCover(service.slug as ServiceSlug)
  const servicePhotos = getPhotosByService(service.slug as ServiceSlug)

  const path = `/services/${service.slug}`
  const reviewed = reviewedOn(path)
  const serviceSchema = buildServiceJsonLd(service)
  const webPageSchema = buildWebPageJsonLd({
    title: service.seoTitle,
    description: service.metaDescription,
    path,
    mainEntityId: serviceSchema['@id'],
    image: workPhoto?.src,
  })
  const faqSchema = buildFaqJsonLd(service.faqs)
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: path },
  ])

  return (
    <>
      <ServicePageTracker service={service.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(webPageSchema) }}
      />
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

      <section className="service-detail-hero field-container">
        <nav aria-label="Breadcrumb" className="service-detail-breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/services">Services</Link><span aria-hidden="true">/</span><span>{service.name}</span>
        </nav>
        <div className="service-detail-grid">
          <div>
            <p className="spec text-signal">Service {indexStr} / {totalStr}</p>
            <h1>{service.name} <span className="service-location">in Siliguri &amp; North Bengal</span></h1>
            <p className="spec text-signal mb-5">{service.tagline}</p>
            <p className="service-description">{service.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <WhatsAppLink href={waUrl} source={'service:' + service.slug} className="cta cta--md">Quote this job →</WhatsAppLink>
              <Link href="/services" className="field-link">All trades ↗</Link>
            </div>
          </div>
          <figure>
            <div className="service-detail-media">
              <Image src={workPhoto ? workPhoto.src : '/images/home/materials.webp'} alt={workPhoto ? workPhoto.alt : 'Material visualization for ' + service.name} fill preload sizes="(max-width: 767px) 100vw, 48vw" />
            </div>
            <figcaption className="service-detail-caption">{workPhoto ? 'Documented project photograph' : 'Material visualization, not a project photograph'}</figcaption>
          </figure>
        </div>
      </section>

      {/* A short, quotable definition for searchers and answer engines */}
      <section className="field-container service-locations" aria-labelledby="service-answer-heading">
        <h2 id="service-answer-heading">{service.question}</h2>
        <p>{service.answer}</p>
        <p>Also known as: {service.alternateNames.join(', ')}.</p>
        <p className="spec">Page reviewed <time dateTime={reviewed}>{formatReviewDate(reviewed)}</time></p>
      </section>

      {/* Each compared board's page carries the comparison with the other two. */}
      {COMPARED_SLUGS.includes(service.slug as ServiceSlug) && <SignComparison current={service.slug as ServiceSlug} />}

      {/* Spec sheet */}
      <section className="service-specs border-b border-rule" aria-label="Service specifications">
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
              <p className="spec m-0 mt-2 text-ink-subtle">Planning estimate. Confirm your schedule before ordering.</p>
            </div>
          </div>
        </div>
      </section>

      {servicePhotos.length > 0 && (
        <GalleryStrip
          photos={servicePhotos}
          title={`${service.name}: ${servicePhotos.length} project photo${servicePhotos.length === 1 ? '' : 's'}`}
          link={{ href: `/portfolio?service=${service.slug}`, label: 'Open in the portfolio' }}
        />
      )}

      {/* FAQs */}
      {service.faqs.length > 0 && (
      <section className="border-b border-rule bg-paper">
          <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
              <div>
                <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
                  Your {service.name.toLowerCase()} questions.
                </h2>
              </div>
              <Accordion items={service.faqs} />
            </div>
          </div>
        </section>
      )}

      {programmaticPages.some(page => page.service === service.slug) && (
        <section className="field-container service-locations" aria-labelledby="service-locations-heading">
          <h2 id="service-locations-heading">Plan your project by location</h2>
          <p>Our workshop is in Siliguri. Find the site details to include for work across North Bengal.</p>
          <nav aria-label="Regional service guides">{programmaticPages.filter(page => page.service === service.slug).map(page => <Link key={page.slug} href={'/' + page.slug}>{service.name} in {CITY_LABELS[page.city]} ↗</Link>)}</nav>
        </section>
      )}

      {/* Related trades */}
      {related.length > 0 && (
        <section className="border-b border-rule bg-paper">
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
                      <span className="mt-0.5 block text-xs text-ink-subtle transition-colors group-hover:text-paper">
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
