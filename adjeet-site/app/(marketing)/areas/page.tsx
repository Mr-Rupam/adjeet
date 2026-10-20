import Link from 'next/link'
import {
  AREAS_FAQS,
  AREAS_SEND_US,
  AREAS_STEPS,
  AREA_GROUPS,
  TOWNS,
  distanceKm,
  townPath,
} from '@/content/areas'
import { SILIGURI_BRIEFS } from '@/content/service-local'
import { getServiceBySlug, type ServiceSlug } from '@/content/services'
import { formatReviewDate, reviewedOn } from '@/content/page-reviews'
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
  jsonLdString,
} from '@/lib/seo'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { PageMasthead } from '@/components/street/PageMasthead'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { Accordion } from '@/components/ui/Accordion'
import { CoverageMapProvider } from '@/components/coverage/CoverageMapContext'
import { CoveragePlaceList } from '@/components/coverage/CoveragePlaceList'
import { CoverageStage } from '@/components/coverage/CoverageStage'
import { BriefForm } from '@/components/areas/BriefForm'
import styles from '@/components/areas/Areas.module.css'

const PAGE = {
  title: 'Areas We Cover: Signage Across North Bengal & Sikkim',
  description: 'AD JEET makes signs at its Siliguri workshop and installs them across North Bengal and Sikkim: the hills, the Dooars, Cooch Behar, Malda and more. Distances and how each job is planned.',
  path: '/areas',
}

export const metadata = buildPageMetadata(PAGE)

const webPage = buildWebPageJsonLd(PAGE)
const faqSchema = buildFaqJsonLd(AREAS_FAQS)
const breadcrumb = buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Areas we cover', url: '/areas' }])
const waUrl = defaultWhatsAppUrl()

/** The trades whose service pages carry the Siliguri brief, in catalogue order. */
const SILIGURI_TRADES = (Object.keys(SILIGURI_BRIEFS) as ServiceSlug[]).map(slug => getServiceBySlug(slug)!)

export default function AreasPage() {
  const reviewed = reviewedOn(PAGE.path)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />

      <PageMasthead
        meta={['Areas we cover', 'North Bengal', 'Sikkim']}
        title={<>Areas we cover.<br /><span className="text-signal">Made in Siliguri.</span></>}
        lead="Every sign is made at our Siliguri workshop, then delivered and installed across North Bengal and Sikkim. Every place below is covered the same way."
      >
        <WhatsAppLink href={waUrl} source="areas" className="cta cta--md">Discuss your site ↗</WhatsAppLink>
      </PageMasthead>

      <section className={styles.section} aria-labelledby="areas-map-heading">
        <CoverageMapProvider>
          <div className={`field-container ${styles.mapGrid}`}>
            <div className={styles.mapCopy}>
              <p className="spec text-signal">The map</p>
              <h2 id="areas-map-heading" className={styles.heading}>From the hills to Malda.</h2>
              <p className={styles.intro}>Pick a place to see how far it is from the workshop and start a quote for it.</p>
              <CoveragePlaceList />
            </div>
            <div className={styles.map}>
              <CoverageStage caption="Coverage shown approximately; the reach is not a fixed service boundary." />
            </div>
          </div>
        </CoverageMapProvider>
      </section>

      <section className={styles.section} aria-labelledby="areas-groups-heading">
        <div className="field-container">
          <p className="spec text-signal">Distance and planning</p>
          <h2 id="areas-groups-heading" className={styles.heading}>How a job is planned, place by place</h2>
          <p className={styles.intro}>Distances are from the workshop in a straight line; the roads are longer. What changes from place to place is the trip, so each group says what helps us plan it.</p>
          <div className={styles.groups}>
            {AREA_GROUPS.map(group => (
              <section key={group.id} className={styles.group} aria-labelledby={`areas-group-${group.id}`}>
                <div>
                  <h3 id={`areas-group-${group.id}`} className={styles.groupTitle}>{group.title}</h3>
                  <ul className={styles.mileage} aria-label={`${group.title}: places and distances`}>
                    {/* Nearest first, so each group reads like a road sign. */}
                    {[...group.places].sort((a, b) => distanceKm(a) - distanceKm(b)).map(place => {
                      const km = distanceKm(place)
                      return (
                        <li key={place}>
                          <span className={styles.mileageName}>{place}</span>
                          <span className={styles.mileageKm}>{km === 0 ? 'Workshop' : `${km} km`}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                <div className={styles.guidance}>
                  {group.guidance.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                  {group.id === 'siliguri' && (
                    <ul className={styles.tradeLinks} aria-label="Trades with a Siliguri brief">
                      {SILIGURI_TRADES.map(service => (
                        <li key={service.slug}><Link href={`/services/${service.slug}`} className={styles.textLink}>{service.name}</Link></li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
          <p className={styles.reviewed}>Page reviewed <time dateTime={reviewed}>{formatReviewDate(reviewed)}</time></p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="areas-steps-heading">
        <div className="field-container">
          <p className="spec text-signal">Every place, the same way</p>
          <h2 id="areas-steps-heading" className={styles.heading}>From your site to the workshop and back</h2>
          <ol className={styles.steps}>
            {AREAS_STEPS.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.body}</p></li>)}
          </ol>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="areas-towns-heading">
        <div className="field-container">
          <p className="spec text-signal">Town pages</p>
          <h2 id="areas-towns-heading" className={styles.heading}>Cooch Behar, Jalpaiguri and Gangtok</h2>
          <p className={styles.intro}>These towns each have a page with the work photographed there, the questions people from those towns ask and what to send for each trade.</p>
          <ul className={styles.towns}>
            {TOWNS.map(town => (
              <li key={town.slug}>
                <Link href={townPath(town)}>
                  <span>
                    <span className={styles.townName}>{town.name}</span>
                    <span className={styles.townNote}>{town.region === 'Sikkim' ? 'Sikkim' : 'North Bengal'}, about {distanceKm(town.coverageArea)} km from the workshop</span>
                  </span>
                  <span className={styles.townArrow} aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="areas-faq-heading">
        <div className={`field-container ${styles.faqGrid}`}>
          <div>
            <p className="spec text-signal">Questions</p>
            <h2 id="areas-faq-heading" className={styles.heading}>Working outside Siliguri</h2>
            <div className={`${styles.sendUs} mt-8`}>
              <p className="spec text-signal">Every enquiry needs</p>
              <ul>{AREAS_SEND_US.map(item => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          <Accordion items={AREAS_FAQS} />
        </div>
      </section>

      <BriefForm
        heading="Send the brief here."
        note="Choose your town in the form, tick the work you need and add whatever details you have. A location pin and a photo help most."
        whatsAppUrl={waUrl}
        source="areas-form"
      />
    </>
  )
}
