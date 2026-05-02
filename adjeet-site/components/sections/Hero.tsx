import Image from 'next/image'
import Link from 'next/link'
import { Anek_Latin, Khand } from 'next/font/google'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import styles from './Hero.module.css'

const heroDisplay = Khand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-hero-display',
  display: 'swap',
  preload: true,
})

const heroBody = Anek_Latin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hero-body',
  display: 'swap',
  preload: true,
})

const SERVICES = [
  'Glow Sign Boards',
  'ACP/LED Signage',
  'Flex Printing',
  'Vehicle Branding',
  'F-Pole Installation',
  'Wall Painting',
]

const CITIES = ['Siliguri', 'Jalpaiguri', 'Cooch Behar', 'Darjeeling', 'Malda']

export function Hero() {
  const waUrl = defaultWhatsAppUrl()
  const marqueeItems = [...SERVICES, ...CITIES]

  return (
    <section
      id="hero-section"
      className={`${styles.hero} ${heroDisplay.variable} ${heroBody.variable}`}
      aria-labelledby="home-hero-heading"
    >
      <Image
        src="/og-image.jpg"
        alt="AD-JEET fabrication workshop entrance in Siliguri"
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGOQklEDAACwAF31pX+jAAAAAElFTkSuQmCC"
        className={styles.photo}
      />
      <div className={styles.inkWash} aria-hidden="true" />
      <div className={styles.blueprint} aria-hidden="true" />
      <div className={styles.edgeGlow} aria-hidden="true" />
      <div className={styles.signalField} aria-hidden="true">
        <span className={styles.signalWord}>VISIBLE</span>
        <span className={styles.measureLine} />
        <span className={styles.measurePin}>26.7271 N</span>
        <span className={styles.measurePin}>88.3953 E</span>
      </div>

      <div className={styles.shell}>
        <div className={styles.metaBar} aria-label="AD-JEET company facts">
          <span>AD-JEET Branding Solution</span>
          <span>Siliguri workshop</span>
          <span>Since 1990</span>
        </div>

        <div className={styles.copyStack}>
          <p className={styles.eyebrow}>Signage fabrication and outdoor advertising</p>
          <h1 id="home-hero-heading" className={styles.heading}>
            North Bengal signage that gets seen, built in Siliguri since 1990
          </h1>
          <p className={styles.lede}>
            AD-JEET designs, fabricates, prints, and installs glow sign boards,
            ACP/LED signage, flex printing, vehicle branding, wall painting, and
            F-pole structures across Siliguri, Jalpaiguri, Cooch Behar,
            Darjeeling, and Malda.
          </p>

          <div className={styles.actionRow} aria-label="Hero calls to action">
            <Link href="/services" className={styles.primaryAction}>
              Our Services
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappAction}
            >
              Get Quote on WhatsApp
            </a>
            <Link href="/portfolio" className={styles.textAction}>
              View Portfolio
            </Link>
          </div>

          <div className={styles.processRail} aria-label="AD-JEET process">
            <span>Survey</span>
            <span>Fabricate</span>
            <span>Install</span>
            <span>Maintain</span>
          </div>
        </div>

        <div className={styles.lowerDeck}>
          <div className={styles.specimen} aria-hidden="true">
            <span className={styles.specimenLabel}>Lit face sample</span>
            <span className={styles.specimenWord}>AD-JEET</span>
          </div>
        </div>
      </div>

      <div className={styles.ticker} aria-label="Services and coverage areas">
        <div className={styles.tickerTrack}>
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
