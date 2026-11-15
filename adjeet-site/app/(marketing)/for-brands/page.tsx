import Link from 'next/link'
import {
  BRAND_PHOTO_IDS,
  BRAND_TRADES,
  BRANDS_PHOTOGRAPHED,
  FOR_BRANDS_FAQS,
  FOR_BRANDS_INTRO,
  FOR_BRANDS_LEAD,
  FOR_BRANDS_PAGE,
  FOR_BRANDS_WHATSAPP_MESSAGE,
  ON_REQUEST,
  ROLLOUT_STEPS,
} from '@/content/for-brands'
import { getPhotoById } from '@/content/gallery'
import { formatReviewDate, reviewedOn } from '@/content/page-reviews'
import { business } from '@/lib/business'
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
  jsonLdString,
} from '@/lib/seo'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { PageMasthead } from '@/components/street/PageMasthead'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { ArrowDown } from 'lucide-react'
import { Accordion } from '@/components/ui/Accordion'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { BriefForm } from '@/components/areas/BriefForm'
import areaStyles from '@/components/areas/Areas.module.css'
import styles from './ForBrands.module.css'

export const metadata = buildPageMetadata(FOR_BRANDS_PAGE)

const webPage = buildWebPageJsonLd({ ...FOR_BRANDS_PAGE, image: getPhotoById(BRAND_PHOTO_IDS[0]).src })
const faqSchema = buildFaqJsonLd(FOR_BRANDS_FAQS)
const breadcrumb = buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'For brands', url: FOR_BRANDS_PAGE.path }])
const waUrl = buildWhatsAppUrl(business.phone, FOR_BRANDS_WHATSAPP_MESSAGE)
const brandPhotos = BRAND_PHOTO_IDS.map(getPhotoById)

export default function ForBrandsPage() {
  const reviewed = reviewedOn(FOR_BRANDS_PAGE.path)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />

      <PageMasthead
        title={<>Dealer boards for brands.<br /><span className="text-signal">An outdoor advertising agency in Siliguri.</span></>}
        lead={FOR_BRANDS_LEAD}
      >
        <WhatsAppLink href={waUrl} source="for-brands" className="cta cta--md cta--yellow"><WhatsAppIcon />Send your outlet list</WhatsAppLink>
        <a href="#send-brief" className="action-quiet">Or send the brief <ArrowDown size={17} aria-hidden="true" /></a>
      </PageMasthead>

      <section className={areaStyles.section} aria-labelledby="brands-who-heading">
        <div className="field-container">
          <h2 id="brands-who-heading" className={areaStyles.heading}>For regional and trade marketing teams</h2>
          <div className={`${areaStyles.prose} ${styles.intro}`}>
            {FOR_BRANDS_INTRO.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <p className={areaStyles.reviewed}>Page reviewed <time dateTime={reviewed}>{formatReviewDate(reviewed)}</time></p>
        </div>
      </section>

      <section className={areaStyles.section} aria-labelledby="brands-trades-heading">
        <div className="field-container">
          <h2 id="brands-trades-heading" className={areaStyles.heading}>What we roll out for brands</h2>
          <ul className={areaStyles.trades}>
            {BRAND_TRADES.map(trade => (
              <li key={trade.title}>
                <h3 className={styles.tradeTitle}>{trade.title}</h3>
                <p>{trade.body}</p>
                <ul className={`${areaStyles.tradeLinks} ${styles.tradeLinkList}`} aria-label={`${trade.title}: service pages`}>
                  {trade.links.map(link => (
                    <li key={link.slug}><Link href={`/services/${link.slug}`} className={areaStyles.textLink}>{link.label}</Link></li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={areaStyles.section} aria-labelledby="brands-rollout-heading">
        <div className="field-container">
          <h2 id="brands-rollout-heading" className={areaStyles.heading}>How a rollout is sent in</h2>
          <ol className={areaStyles.steps}>
            {ROLLOUT_STEPS.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.body}</p></li>)}
          </ol>
          <div className={`${areaStyles.sendUs} ${styles.onRequest}`}>
            <h3 className={styles.onRequestHeading}>What your team can ask for</h3>
            <ul>{ON_REQUEST.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className={areaStyles.section} aria-labelledby="brands-work-heading">
        <div className="field-container">
          <h2 id="brands-work-heading" className={areaStyles.heading}>Brand work, photographed on site</h2>
          <p className={areaStyles.intro}>
            The portfolio is the record. It holds site photographs of work for {BRANDS_PHOTOGRAPHED.slice(0, -1).join(', ')} and {BRANDS_PHOTOGRAPHED.at(-1)}, among others, many with the place and the year they went up.
          </p>
        </div>
      </section>
      <GalleryStrip
        photos={brandPhotos}
        title={`Work for brands: ${brandPhotos.length} project photos`}
        link={{ href: '/portfolio', label: 'See the whole portfolio' }}
      />

      <section className={areaStyles.section} aria-labelledby="brands-where-heading">
        <div className={`field-container ${areaStyles.outside}`}>
          <div>
            <h2 id="brands-where-heading" className={areaStyles.heading}>Where your outlets are</h2>
            <p className={areaStyles.intro}>Every district on the areas page is covered the same way: made in Siliguri, then delivered and fitted. It gives the distance from the workshop to each place and what helps plan a job there, from hill towns to the southern districts.</p>
          </div>
          <Link href="/areas" className="field-link">Areas we cover ↗</Link>
        </div>
      </section>

      <section className={areaStyles.section} aria-labelledby="brands-faq-heading">
        <div className={`field-container ${areaStyles.faqGrid}`}>
          <div>
            <h2 id="brands-faq-heading" className={areaStyles.heading}>Questions from brand teams</h2>
          </div>
          <Accordion items={FOR_BRANDS_FAQS} />
        </div>
      </section>

      <BriefForm
        heading="Send the rollout brief here."
        note="Add the brand, the number of outlets and the districts in the message, with your target date. The outlet list and photos can follow on WhatsApp or email."
        whatsAppUrl={waUrl}
        source="for-brands-form"
      />
    </>
  )
}
