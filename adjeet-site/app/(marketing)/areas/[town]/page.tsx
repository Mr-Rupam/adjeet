import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { TOWNS, distanceKm, getTown, townPath, type Town } from '@/content/areas'
import { getServiceBySlug } from '@/content/services'
import { formatReviewDate, reviewedOn } from '@/content/page-reviews'
import { shareImageFor } from '@/content/photo-places'
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
  buildServiceJsonLd,
  buildWebPageJsonLd,
  jsonLdString,
} from '@/lib/seo'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { PageMasthead } from '@/components/street/PageMasthead'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { Accordion } from '@/components/ui/Accordion'
import { BriefForm } from '@/components/areas/BriefForm'
import styles from '@/components/areas/Areas.module.css'

type Params = { town: string }

export function generateStaticParams() {
  return TOWNS.map(town => ({ town: town.slug }))
}

function coverPhoto(town: Town) {
  return town.photos.find(photo => photo.id === town.coverPhotoId) ?? town.photos[0]
}

function pageSeo(town: Town) {
  return { title: town.seoTitle, description: town.metaDescription, path: townPath(town) }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const town = getTown((await params).town)
  if (!town) return {}
  const cover = coverPhoto(town)
  return buildPageMetadata({ ...pageSeo(town), image: cover ? shareImageFor(cover) : undefined, indexable: town.indexable })
}

export default async function TownPage({ params }: { params: Promise<Params> }) {
  const town = getTown((await params).town)
  if (!town) notFound()

  const path = townPath(town)
  const km = distanceKm(town.coverageArea)
  const cover = coverPhoto(town)
  const reviewed = reviewedOn(path)
  const waUrl = defaultWhatsAppUrl({ city: town.name })
  const servedTown = { name: town.name, state: town.state }
  const trades = town.trades.map(trade => ({ ...trade, service: getServiceBySlug(trade.service)! }))

  // One Service node per trade the page describes, each with the brief the
  // visitor reads as its description and this town as the area it serves.
  const serviceSchemas = trades.map(trade => buildServiceJsonLd(trade.service, { town: servedTown, path, description: trade.brief }))
  const webPageSchema = buildWebPageJsonLd({ ...pageSeo(town), image: cover?.src })
  const faqSchema = buildFaqJsonLd(town.faqs)
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Areas we cover', url: '/areas' },
    { name: town.name, url: path },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(webPageSchema) }} />
      {serviceSchemas.map(schema => (
        <script key={schema['@id']} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(schema) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />

      <nav aria-label="Breadcrumb" className={`field-container ${styles.breadcrumb}`}>
        <Link href="/">Home</Link><span aria-hidden="true">/</span>
        <Link href="/areas">Areas we cover</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{town.name}</span>
      </nav>

      <PageMasthead compact meta={[town.name, town.region, `About ${km} km from the workshop`]} title={town.headline} lead={town.lead}>
        <WhatsAppLink href={waUrl} source={'area:' + town.slug} className="cta cta--md">Discuss your project ↗</WhatsAppLink>
      </PageMasthead>

      <section className={`${styles.section} ${styles.sectionTight}`} aria-labelledby="town-work-heading">
        <div className="field-container">
          <p className="spec text-signal">Photographed on site</p>
          <h2 id="town-work-heading" className={styles.heading}>Work in and around {town.name}</h2>
          <p className={styles.lead}>{town.work}</p>
          <p className={styles.reviewed}>Page reviewed <time dateTime={reviewed}>{formatReviewDate(reviewed)}</time></p>
        </div>
      </section>

      {town.photos.length > 0 && (
        <GalleryStrip
          photos={town.photos}
          title={`${town.name}: project photos`}
          link={{ href: '/portfolio', label: 'All our work' }}
        />
      )}

      <section className={styles.section} aria-labelledby="town-trip-heading">
        <div className="field-container">
          <p className="spec text-signal">From the Siliguri workshop</p>
          <h2 id="town-trip-heading" className={styles.heading}>How a {town.name} job is planned</h2>
          <div className={styles.tripGrid}>
            <div className={styles.prose}>
              {town.trip.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <aside className={styles.plate} aria-label={`${town.name} at a glance`}>
              <p className={styles.plateFigure}>{km}<span className={styles.plateUnit}>km</span></p>
              <p className={styles.plateLabel}>From our Siliguri workshop to {town.name}, in a straight line.</p>
              <p className={styles.plateNearby}>
                <strong>Around {town.name}</strong>
                {town.nearbyNote}
              </p>
              <Link href="/areas" className={styles.textLink}>Every place we cover ↗</Link>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="town-trades-heading">
        <div className="field-container">
          <p className="spec text-signal">Before you send the brief</p>
          <h2 id="town-trades-heading" className={styles.heading}>What to send from {town.name}, trade by trade</h2>
          <ul className={styles.trades}>
            {trades.map(trade => (
              <li key={trade.service.slug}>
                <h3 className="m-0">
                  <Link href={`/services/${trade.service.slug}`} className={styles.tradeLink}>
                    {trade.service.name} <span aria-hidden="true">↗</span>
                  </Link>
                </h3>
                <p>{trade.brief}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="town-faq-heading">
        <div className={`field-container ${styles.faqGrid}`}>
          <div>
            <p className="spec text-signal">Questions</p>
            <h2 id="town-faq-heading" className={styles.heading}>Asked from {town.name}</h2>
          </div>
          <Accordion items={town.faqs} />
        </div>
      </section>

      <section className="commission" aria-labelledby="town-commission-heading">
        <div className="field-container commission-inner">
          <div><p className="spec">Start with the site</p><h2 id="town-commission-heading">Your sign,<br />in {town.name}.</h2></div>
          <div className="commission-actions">
            <p>Share a photo, the size and the location for a project-specific quote.</p>
            <WhatsAppLink href={waUrl} source={'area-commission:' + town.slug} className="cta cta--md">WhatsApp us now →</WhatsAppLink>
          </div>
        </div>
      </section>

      <BriefForm
        heading="Or send the brief here."
        note={`${town.name} is filled in already. Tick the work you need and add the details you have.`}
        whatsAppUrl={waUrl}
        source={'area-form:' + town.slug}
        defaultCity={town.leadCity}
      />
    </>
  )
}
