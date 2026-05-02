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

export function Hero() {
  const waUrl = defaultWhatsAppUrl()

  return (
    <section
      id="hero-section"
      className={`${styles.hero} ${heroDisplay.variable} ${heroBody.variable}`}
      aria-labelledby="home-hero-heading"
    >
      <Image
        src="/og-image.jpg"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGOQklEDAACwAF31pX+jAAAAAElFTkSuQmCC"
        className={styles.photo}
      />

      <div className={styles.shell}>
        {/* Top bar: brand + year */}
        <div className={styles.metaBar} aria-label="Company info">
          <span className={styles.metaBrand}>AD-JEET Branding Solution</span>
          <span className={styles.metaYear}>Since 1990</span>
        </div>

        {/* Main copy block */}
        <div className={styles.copyStack}>
          <p className={styles.eyebrow}>Signage fabrication &middot; outdoor advertising</p>

          <h1 id="home-hero-heading" className={styles.heading}>
            North<br />
            Bengal&rsquo;s<br />
            sign maker.
          </h1>

          <p className={styles.districts} aria-label="Coverage districts">
            Siliguri &middot; Jalpaiguri &middot; Cooch Behar &middot; Darjeeling &middot; Malda
          </p>

          <p className={styles.lede}>
            Glow sign boards, ACP&thinsp;/&thinsp;LED signage, flex printing, vehicle
            branding, F-pole structures, wall murals. Designed, fabricated, and
            installed by our own team at our Siliguri workshop.
          </p>

          <div className={styles.actionRow} aria-label="Calls to action">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappAction}
            >
              Get Quote on WhatsApp
            </a>
            <Link href="/services" className={styles.servicesAction}>
              Our Services <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/portfolio" className={styles.textAction}>
              View Portfolio
            </Link>
          </div>
        </div>

        {/* Process steps at bottom */}
        <div className={styles.processBar} aria-label="Our process">
          <span>Survey</span>
          <span className={styles.dot} aria-hidden="true" />
          <span>Fabricate</span>
          <span className={styles.dot} aria-hidden="true" />
          <span>Install</span>
          <span className={styles.dot} aria-hidden="true" />
          <span>Maintain</span>
        </div>
      </div>
    </section>
  )
}
