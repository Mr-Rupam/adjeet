import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { programmaticPages, getProgrammaticPage, CITY_LABELS } from '@/content/programmatic'
import { getServiceBySlug, SERVICE_SLUGS, type ServiceSlug } from '@/content/services'
import { getPhotosByService } from '@/content/gallery'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { COVERAGE_CITIES, type LeadInput } from '@/lib/lead-schema'
import { buildBreadcrumbJsonLd, buildServiceJsonLd, buildFaqJsonLd, jsonLdString, buildPageMetadata } from '@/lib/seo'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { LeadForm } from '@/components/sections/LeadForm'
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
  const city = CITY_LABELS[page.city] ?? page.city
  return buildPageMetadata({
    title: `${page.searchPhrase} in ${city}`,
    description: `${page.searchPhrase} in ${city} and nearby ${page.nearbyAreas.slice(0, 2).join(' and ')}, made at AD JEET's Siliguri workshop. What to send, materials and a project quote.`,
    path: `/${slug}`,
  })
}

export default async function ProgrammaticPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const page = getProgrammaticPage(slug)
  if (!page) notFound()

  const service = getServiceBySlug(page.service as ServiceSlug)
  if (!service) notFound()

  // Prefer photos recorded in this city. Otherwise show the trade's work and
  // say plainly that it was photographed somewhere else.
  const servicePhotos = getPhotosByService(page.service as ServiceSlug)
  const cityPhotos = servicePhotos.filter(p => p.city === page.city)
  const photos = cityPhotos.length > 0 ? cityPhotos : servicePhotos
  const waUrl = defaultWhatsAppUrl({ service: service.name, city: CITY_LABELS[page.city] })
  const cityLabel = CITY_LABELS[page.city] ?? page.city

  // Every CITY_LABELS value is currently a member of the enquiry form's city
  // enum, but the two lists are maintained separately. Check rather than cast,
  // so a label added on one side without the other degrades to "no prefill"
  // instead of seeding a value the schema rejects on submit.
  const leadCity = (COVERAGE_CITIES as readonly string[]).includes(cityLabel)
    ? (cityLabel as LeadInput['city'])
    : undefined

  // Same guard for the trade, for the same reason: PROG_SERVICES and
  // SERVICE_SLUGS are separate lists. A slug that is not rendered as a checkbox
  // would leave every box visibly unchecked while the form value still carried
  // it, so the visitor submits a service they never picked, or gets a generic
  // "Invalid form data." All five current values pass.
  const leadService = (SERVICE_SLUGS as readonly string[]).includes(page.service)
    ? (page.service as ServiceSlug)
    : undefined

  // `relatedCities` arrives in rotated declared order; the cut to three happens
  // after the existence filter so a service with no page in the next city along
  // still offers three links rather than two.
  const relatedCityPages = page.relatedCities.flatMap(city => {
    const match = programmaticPages.find(candidate => candidate.service === page.service && candidate.city === city)
    return match ? [match] : []
  }).slice(0, 3)

  // The local question leads, so the same answer appears on the page and in the FAQ markup.
  const faqs = [page.faq, ...service.faqs]

  // The schema description reads from `localBrief`, the paragraph the visitor
  // actually sees. It used to read from a templated `body` that was identical
  // across all 27 pages; that paragraph no longer exists.
  const serviceSchema = buildServiceJsonLd(service, { city: cityLabel, path: `/${slug}`, description: page.localBrief })
  const faqSchema = buildFaqJsonLd(faqs)
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${service.slug}` },
    { name: cityLabel, url: `/${slug}` },
  ])

  return (
    <>
      <ProgrammaticPageTracker service={page.service} city={page.city} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />

      <nav aria-label="Breadcrumb" className="field-container service-detail-breadcrumb regional-breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/services">Services</Link><span aria-hidden="true">/</span><Link href={'/services/' + service.slug}>{service.name}</Link><span aria-hidden="true">/</span><span aria-current="page">{cityLabel}</span>
      </nav>

      <PageMasthead compact meta={[service.name, cityLabel, page.city === 'gangtok' ? 'Sikkim' : 'North Bengal']} title={page.headline} lead={service.tagline}>
        <WhatsAppLink href={waUrl} source={'programmatic:' + slug} className="cta cta--md">Discuss your project ↗</WhatsAppLink>
      </PageMasthead>

      {/*
        The hand-written local brief leads, with no heading of its own. It is the
        only content on this page written for this city, and the visitor's first
        question is whether we know their town.
      */}
      <section className="regional-body field-container">
        <p className="regional-lead">{page.localBrief}</p>
        <div className="regional-sendus">
          <p className="spec text-signal">Send us</p>
          <ul>
            <li>a location pin</li>
            <li>photos of the frontage</li>
            <li>rough dimensions</li>
            <li>your target date</li>
          </ul>
          <p className="regional-nearby">Nearby: {page.nearbyAreas.join(', ')}</p>
          <Link href={'/services/' + service.slug} className="field-link">Materials &amp; specifications ↗</Link>
        </div>
      </section>

      {photos.length > 0 ? (
        <GalleryStrip
          photos={photos}
          title={cityPhotos.length > 0 ? `${service.name} in ${cityLabel}: project photos` : `${service.name}: recent AD JEET work`}
          /*
            Scoped to the trade, not the city. `cityPhotos` filters by service
            AND city, so an empty list means "no photos of THIS TRADE in this
            city". It does not mean we have never worked there. The earlier
            wording claimed the latter, which was false on 21 of the 27 pages
            and self-contradicting on the four Siliguri ones, where the previous
            sentence names the Siliguri workshop.
          */
          note={cityPhotos.length > 0 ? undefined : `From our Siliguri workshop and North Bengal installations. We have not photographed ${page.work} in ${cityLabel} yet.`}
          link={{ href: `/portfolio?service=${service.slug}`, label: 'More in the portfolio' }}
        />
      ) : (
        /*
          Not reachable for the five services currently in PROG_SERVICES, all of
          which have photographs. It becomes reachable the moment that list
          grows, and an unexplained missing section is worse than a sentence.
        */
        <section className="regional-gallery-empty field-container">
          <h2 className="spec text-signal">{service.name}: photography in progress</h2>
          <p>We are photographing recent {page.work} work. Ask to see it in person, or on WhatsApp.</p>
          <WhatsAppLink href={waUrl} source={'programmatic-nophotos:' + slug} className="field-link">Ask to see this work ↗</WhatsAppLink>
        </section>
      )}

      <section className="regional-about field-container">
        <h2>About {page.work}</h2>
        <p>{service.answer}</p>
        <p>{service.description}</p>
      </section>

      <section className="field-container regional-faq" aria-labelledby="regional-faq-heading">
        <h2 id="regional-faq-heading">{page.searchPhrase} in {cityLabel}: questions before you order</h2>
        <Accordion items={faqs} />
      </section>

      {relatedCityPages.length > 0 && (
        <section className="regional-related">
          <div className="field-container">
            <p className="spec text-signal">Also available in</p>
            <nav aria-label={`${service.name} in other places`}>
              {relatedCityPages.map(relatedPage => (
                <Link key={relatedPage.slug} href={`/${relatedPage.slug}`} className="regional-chip">
                  {service.name} in {CITY_LABELS[relatedPage.city] ?? relatedPage.city}
                </Link>
              ))}
              <Link href={`/services/${service.slug}`} className="regional-chip regional-chip--quiet">
                ← All {service.name}
              </Link>
            </nav>
          </div>
        </section>
      )}

      <section className="commission">
        <div className="field-container commission-inner">
          <div><p className="spec">Start with the site</p><h2>{service.name}<br />in {cityLabel}.</h2></div>
          <div className="commission-actions"><p>Share a photo, size and location for a project-specific quote.</p><WhatsAppLink href={waUrl} source={'programmatic:' + slug} className="cta cta--md">WhatsApp us now →</WhatsAppLink></div>
        </div>
      </section>

      {/*
        The desktop path for visitors who will not open WhatsApp. City and trade
        are already known, so neither is asked for again.

        Its own section, deliberately: the commission block above is saturated
        cerulean with white text, and LeadForm was built for a paper background.
        Nesting it there put near-black headings on cerulean at about 3:1 and
        asked every field, label and error colour to work against a surface it
        was never designed for. It also gave one section two primary actions.
      */}
      <section className="regional-form">
        <div className="field-container">
          <h2>Or send the brief here.</h2>
          <p>Your city and trade are filled in already.</p>
          <LeadForm defaultCity={leadCity} defaultService={leadService} />
        </div>
      </section>
    </>
  )
}
