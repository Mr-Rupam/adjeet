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
import { getPhotosByService, getServiceCover } from '@/content/gallery'
import { formatReviewDate, reviewedOn } from '@/content/page-reviews'
import { COMPARED_SLUGS } from '@/content/sign-comparison'
import { SILIGURI_BRIEFS, SILIGURI_NEARBY } from '@/content/service-local'
import { TOWNS, townPath } from '@/content/areas'
import { shareImageFor } from '@/content/photo-places'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { SignComparison } from '@/components/sections/SignComparison'
import { BriefForm } from '@/components/areas/BriefForm'
import areaStyles from '@/components/areas/Areas.module.css'

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
  // The page's own lead photograph is its link preview, where it has one.
  const cover = getServiceCover(service.slug as ServiceSlug)
  return generateServiceMetadata(service, cover ? shareImageFor(cover) : undefined)
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
  const siliguri = SILIGURI_BRIEFS[service.slug as ServiceSlug]

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

      {/*
        The Siliguri brief, moved here when /<trade>-in-siliguri started
        redirecting to this page. It is written for the workshop's own town;
        other towns are on /areas.
      */}
      {siliguri && (
        <section className={areaStyles.section} aria-labelledby="service-siliguri-heading">
          <div className="field-container">
            <p className="spec text-signal">Siliguri brief</p>
            <h2 id="service-siliguri-heading" className={areaStyles.heading}>Planning {siliguri.work} in Siliguri</h2>
            <div className={areaStyles.brief}>
              <p className={areaStyles.briefText}>{siliguri.brief}</p>
              <div className={areaStyles.sendUs}>
                <p className="spec text-signal">Send us</p>
                <ul>{siliguri.sendUs.map(item => <li key={item}>{item}</li>)}</ul>
                <p className={areaStyles.sendUsNote}>Also for nearby {SILIGURI_NEARBY.slice(0, -1).join(', ')} and {SILIGURI_NEARBY.at(-1)}.</p>
              </div>
            </div>
          </div>
        </section>
      )}

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
                  {/* Not `name.toLowerCase()`, which printed "acp & led signage". */}
                  Your questions about {service.name}.
                </h2>
              </div>
              <Accordion items={service.faqs} />
            </div>
          </div>
        </section>
      )}

      <section className={areaStyles.section} aria-labelledby="service-outside-heading">
        <div className={`field-container ${areaStyles.outside}`}>
          <div>
            <p className="spec text-signal">Beyond the workshop town</p>
            <h2 id="service-outside-heading" className={areaStyles.heading}>Working outside Siliguri?</h2>
            <p className={areaStyles.intro}>Everything is made at the Siliguri workshop and installed on site across North Bengal and Sikkim. The areas page has the distance to every place we cover and what helps us plan a job there.</p>
            <ul className={areaStyles.outsideLinks} aria-label="Town pages">
              {TOWNS.map(town => (
                <li key={town.slug}>
                  <Link href={townPath(town)} className={areaStyles.textLink}>
                    {/* Name the trade only where the town page has a brief for it. */}
                    {town.trades.some(trade => trade.service === service.slug) ? `${service.name} in ${town.name}` : town.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/areas" className="field-link">Areas we cover ↗</Link>
        </div>
      </section>

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

      {/*
        The trade is known, and Siliguri is the workshop town the H1 names, so
        both are filled in. LeadForm keeps that city even when the URL carries
        a different `?city=`, which old links to the Siliguri pages still can.
      */}
      <BriefForm
        heading="Or send the brief here."
        note={`${service.name} and Siliguri are filled in already. Change the town if your site is elsewhere.`}
        whatsAppUrl={defaultWhatsAppUrl({ service: service.name, city: 'Siliguri' })}
        source={'service-form:' + service.slug}
        defaultCity="Siliguri"
        defaultService={service.slug as ServiceSlug}
      />
    </>
  )
}
