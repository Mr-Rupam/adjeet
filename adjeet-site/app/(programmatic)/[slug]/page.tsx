import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { programmaticPages, getProgrammaticPage, CITY_LABELS } from '@/content/programmatic'
import { getServiceBySlug, type ServiceSlug } from '@/content/services'
import { getPhotosByService } from '@/content/gallery'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, buildServiceJsonLd, buildFaqJsonLd, jsonLdString, buildPageMetadata } from '@/lib/seo'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { ProgrammaticPageTracker } from '@/components/PageViewTracker'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { PageMasthead } from '@/components/street/PageMasthead'
import { Accordion } from '@/components/ui/Accordion'

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
  return buildPageMetadata({
    title: service ? `${service.name} in ${city}` : page.headline,
    description: `${service?.name} in ${city} from AD JEET's Siliguri workshop. Materials, site-planning guidance and project quotes for North Bengal.`,
    path: `/${slug}`,
  })
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
  const relatedCityPages = page.relatedCities.flatMap(city => {
    const match = programmaticPages.find(candidate => candidate.service === page.service && candidate.city === city)
    return match ? [match] : []
  })

  const serviceSchema = buildServiceJsonLd(service, { city: cityLabel, path: `/${slug}`, description: page.body })
  const faqSchema = service.faqs.length > 0 ? buildFaqJsonLd(service.faqs) : null
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
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

      <nav aria-label="Breadcrumb" className="field-container service-detail-breadcrumb regional-breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/services">Services</Link><span aria-hidden="true">/</span><Link href={'/services/' + service.slug}>{service.name}</Link><span aria-hidden="true">/</span><span aria-current="page">{cityLabel}</span>
      </nav>
      <PageMasthead compact meta={[service.name, cityLabel, 'North Bengal']} title={page.headline} lead={service.tagline}>
        <WhatsAppLink href={waUrl} source={'programmatic:' + slug} className="cta cta--md">Discuss your project ↗</WhatsAppLink>
      </PageMasthead>
      <section className="regional-body field-container">
        <div className="regional-copy">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          <h2>Planning your {cityLabel} project</h2>
          <p>{page.localBrief}</p>
          <h2>What we can make</h2>
          <p>{service.description}</p>
        </div>
        <aside className="regional-spec">
          <p className="spec text-signal">Project notes / {cityLabel}</p>
          <dl><div><dt>Workshop base</dt><dd>Siliguri</dd></div><div><dt>Project location</dt><dd>{cityLabel}</dd></div><div><dt>Quote and schedule</dt><dd>Confirmed for your site</dd></div></dl>
          <p>Send a location, photos, approximate dimensions and your target date.</p>
          <Link href={'/services/' + service.slug} className="field-link">Materials &amp; specifications ↗</Link>
        </aside>
      </section>
      {/* Gallery */}
      {photos.length > 0 && <GalleryStrip photos={photos} />}

      <section className="field-container regional-faq" aria-labelledby="regional-faq-heading">
        <h2 id="regional-faq-heading">{service.name}: questions before you order</h2>
        <Accordion items={service.faqs} />
      </section>

      {/* Related cities */}
      {page.relatedCities.length > 0 && (
        <section className="border-b-2 border-ink bg-paper-elevated">
          <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
            <p className="spec mb-5 text-signal">Also available in</p>
            <div className="flex flex-wrap gap-3">
              {relatedCityPages.map(relatedPage => (
                <Link
                  key={relatedPage.slug}
                  href={`/${relatedPage.slug}`}
                  className="spec border-2 border-ink px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  {service.name} in {CITY_LABELS[relatedPage.city] ?? relatedPage.city}
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

      <section className="commission">
        <div className="field-container commission-inner">
          <div><p className="spec">Start with the site</p><h2>{service.name}<br />in {cityLabel}.</h2></div>
          <div className="commission-actions"><p>Share a photo, size and location for a project-specific quote.</p><WhatsAppLink href={waUrl} source={'programmatic:' + slug} className="cta cta--md">WhatsApp us now →</WhatsAppLink></div>
        </div>
      </section>
    </>
  )
}
