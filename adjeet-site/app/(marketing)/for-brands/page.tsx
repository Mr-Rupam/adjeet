import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import {
  BRAND_TRADES,
  FOR_BRANDS_FAQS,
  FOR_BRANDS_LEAD,
  FOR_BRANDS_PAGE,
  FOR_BRANDS_WHATSAPP_MESSAGE,
  MOSAIC_PHOTO_IDS,
  PROFILE_WHATSAPP_MESSAGE,
  ROLLOUT_STEPS,
  SPEED_PHOTO_ID,
  TYPE_ONLY_TRADES,
  VENDOR_LINE,
} from '@/content/for-brands'
import { GPS_PHOTO_LINE, HOARDINGS_ON_REQUEST, MALDA_STORY } from '@/content/company-figures'
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
import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { FasciaCaption } from '@/components/street/FasciaCaption'
import { BrandMosaic } from '@/components/brands/BrandMosaic'
import { BrandFigures } from '@/components/brands/BrandFigures'
import { BrandLedger } from '@/components/brands/BrandLedger'
import { DayGrid } from '@/components/brands/DayGrid'
import styles from './ForBrands.module.css'

export const metadata = buildPageMetadata(FOR_BRANDS_PAGE)

const mosaic = MOSAIC_PHOTO_IDS.map(getPhotoById)
const speedPhoto = getPhotoById(SPEED_PHOTO_ID)
const webPage = buildWebPageJsonLd({ ...FOR_BRANDS_PAGE, image: mosaic[0].src })
const faqSchema = buildFaqJsonLd(FOR_BRANDS_FAQS)
const breadcrumb = buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'For brands', url: FOR_BRANDS_PAGE.path }])
const profileUrl = buildWhatsAppUrl(business.phone, PROFILE_WHATSAPP_MESSAGE)
const outletUrl = buildWhatsAppUrl(business.phone, FOR_BRANDS_WHATSAPP_MESSAGE)

function Actions({ source }: { source: string }) {
  return (
    <div className={styles.actions}>
      <WhatsAppLink href={profileUrl} source={source} className="cta cta--md cta--yellow"><WhatsAppIcon />Ask for the company profile</WhatsAppLink>
      <WhatsAppLink href={outletUrl} source="for-brands" className="action-quiet">Send your outlet list <ArrowUpRight size={17} aria-hidden="true" /></WhatsAppLink>
    </div>
  )
}

export default function ForBrandsPage() {
  const reviewed = reviewedOn(FOR_BRANDS_PAGE.path)
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />

      <section className={`page-masthead ${styles.opening}`} aria-labelledby="brands-heading">
        <div className={`field-container ${styles.openingInner}`}>
          <div className={styles.openingCopy}>
            <h1 id="brands-heading" className={styles.title}>The advertising agency brands use across <span>North Bengal and Sikkim.</span></h1>
            <p className={styles.lead}>{FOR_BRANDS_LEAD}</p>
            <Actions source="brands-profile" />
          </div>
          <div className={styles.openingWork}>
            <BrandMosaic photos={mosaic} />
            <Link href="/portfolio" className={styles.quietLink}>See the whole portfolio <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <BrandFigures />

      <BrandLedger />

      <section className={styles.trades} aria-labelledby="brands-trades-heading">
        <div className="field-container">
          <h2 id="brands-trades-heading" className={styles.nightHeading} data-site-reveal="title">What we run for brands.</h2>
          <ul className={styles.tradeList}>
            {BRAND_TRADES.map(trade => {
              const photo = getPhotoById(trade.photoId)
              return (
                <li key={trade.title} className={styles.trade}>
                  <figure className={styles.tradeFigure}>
                    <div className={styles.tradePhoto}>
                      <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) calc(100vw - 44px), (max-width: 1279px) 45vw, 560px" />
                    </div>
                    <FasciaCaption photo={photo} size="sm" />
                  </figure>
                  <h3>{trade.title}</h3>
                  <Link href={`/services/${trade.link.slug}`} className={styles.tradeLink}>{trade.link.label} <ArrowUpRight size={16} aria-hidden="true" /></Link>
                </li>
              )
            })}
            <li className={styles.typeCell}>
              <ul className={styles.typeOnly}>
                {TYPE_ONLY_TRADES.map(trade => (
                  <li key={trade.title}><h3>{trade.title}</h3><p>{trade.line}</p></li>
                ))}
              </ul>
              <p className={styles.onRequest}>{HOARDINGS_ON_REQUEST}</p>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.speed} aria-labelledby="brands-speed-heading">
        <div className={`field-container ${styles.speedInner}`}>
          <div>
            <h2 id="brands-speed-heading" className={styles.paperHeading} data-site-reveal="title">One week in Malda.</h2>
            <p className={styles.story}>{MALDA_STORY}</p>
          </div>
          <figure className={styles.speedFigure} data-site-reveal="media">
            <div className={styles.speedPhoto}>
              <Image src={speedPhoto.src} alt={speedPhoto.alt} fill sizes="(max-width: 767px) calc(100vw - 44px), 600px" />
            </div>
            <FasciaCaption photo={speedPhoto} size="sm" />
          </figure>
        </div>
      </section>

      <section className={styles.rollout} aria-labelledby="brands-rollout-heading">
        <div className="field-container">
          <h2 id="brands-rollout-heading" className={styles.nightHeading} data-site-reveal="title">How a rollout runs.</h2>
          <ol className={styles.steps}>
            {ROLLOUT_STEPS.map((step, index) => (
              <li key={step}>
                <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                <h3>{step}</h3>
              </li>
            ))}
          </ol>
          <div className={styles.report}>
            <p className={styles.gps}>{GPS_PHOTO_LINE}</p>
            <p>{VENDOR_LINE}</p>
          </div>
        </div>
      </section>

      <section className={styles.days} aria-labelledby="brands-days-heading">
        <div className={`field-container ${styles.daysInner}`}>
          <h2 id="brands-days-heading" className={styles.paperHeading} data-site-reveal="title">From the order to fitted.</h2>
          <DayGrid />
        </div>
      </section>

      <section className={styles.close} aria-labelledby="brands-faq-heading">
        <div className={`field-container ${styles.closeInner}`}>
          <h2 id="brands-faq-heading" className={styles.nightHeading} data-site-reveal="title">Questions from brand teams.</h2>
          <dl className={styles.faqs}>
            {FOR_BRANDS_FAQS.map(item => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.closeAction}>
            <p className={styles.closeLine}>Start with the company profile.</p>
            <Actions source="brands-profile-close" />
            {/* Not every brand team writes on WhatsApp from a work laptop. */}
            <p className={styles.closeReach}>For a call or an email, see <Link href="/contact">how to reach us</Link>.</p>
            <p className={styles.reviewed}>Page reviewed <time dateTime={reviewed}>{formatReviewDate(reviewed)}</time></p>
          </div>
        </div>
      </section>
    </>
  )
}
