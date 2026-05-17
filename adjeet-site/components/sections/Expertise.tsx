'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import styles from './Expertise.module.css'

interface ExpertiseCard {
  slug: string
  title: string
  short: string
  long: string
  image: string
  href: string
  cta: string
}

const CARDS: readonly ExpertiseCard[] = [
  {
    slug: 'glow',
    title: 'Glow Sign Boards',
    short: 'LED backlit acrylic faces',
    long: 'Aluminium cabinet, white acrylic face, SMD LED · 12V. Crisp at night, weather-rated for the monsoon. 12-month hardware warranty.',
    image: '/airtel.png',
    href: '/services/glow-sign-boards',
    cta: 'See glow signs',
  },
  {
    slug: 'acp',
    title: 'ACP & LED Signage',
    short: 'Channel letters, 4 mm panel',
    long: 'Aluminium composite panel, custom-cut channel letters, full-colour LED modules. The look on every chain-brand shopfront in Siliguri.',
    image: '/Ambuja_cement_ACP-LED.png',
    href: '/services/acp-led-signage',
    cta: 'See ACP / LED',
  },
  {
    slug: 'vehicle',
    title: 'Vehicle Branding',
    short: 'Cast vinyl wraps, 7-yr outdoor',
    long: 'Cast vinyl with a 7-year outdoor rating. Conforms to compound curves, peels clean. Used by SRMB, Ambuja, regional delivery fleets.',
    image: '/SRMB_vechile.png',
    href: '/services/vehicle-branding',
    cta: 'See vehicle wraps',
  },
] as const

export function Expertise() {
  const [hovered, setHovered] = useState<number>(1)
  const waUrl = defaultWhatsAppUrl({ city: 'Siliguri' })

  const cols =
    hovered === 0 ? '1.9fr 1fr 1fr' :
    hovered === 2 ? '1fr 1fr 1.9fr' :
                    '1fr 1.9fr 1fr'

  return (
    <section className={styles.wrap} aria-label="AD-JEET Expertise">
      <header className={styles.head}>
        <h2 className={styles.heading}>Our Expertise</h2>
        <p className={styles.headDesc}>
          Glow sign boards, flex printing, ACP/LED signage, vehicle wraps, wall
          painting and F-poles &mdash; fabricated by hand in Siliguri and
          installed across Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, and
          Malda since 1990.
        </p>
      </header>

      <div
        className={styles.grid}
        style={{ '--cols': cols } as CSSProperties}
        onMouseLeave={() => setHovered(1)}
      >
        {CARDS.map((c, i) => {
          const isActive = hovered === i
          return (
            <article
              key={c.slug}
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
            >
              <Link href={c.href} className={styles.cardLink}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <span className={styles.cardArrow} aria-hidden="true">
                    <ArrowUpRight size={18} strokeWidth={2.4} />
                  </span>
                </div>

                <p className={styles.cardShort}>{c.short}</p>

                {/* Image — visible always, but feels integral when active */}
                <div className={styles.cardImage} aria-hidden="true">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 90vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* Long description only renders when active */}
                <p className={styles.cardLong}>{c.long}</p>

                <span className={styles.cardCta}>
                  {c.cta} <ArrowUpRight size={14} strokeWidth={2.6} />
                </span>
              </Link>
            </article>
          )
        })}
      </div>

      {/* Bottom band: huge claim + spinning badge + counter */}
      <div className={styles.bottomBand}>
        <h2 className={styles.claim}>
          We make signs that <em>make brands unmissable</em> across North Bengal.
        </h2>

        <div className={styles.bandRight}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.spinBadge}
          >
            <svg viewBox="0 0 140 140" width="140" height="140" className={styles.spinBadgeSvg}>
              <defs>
                <path
                  id="circle-text-band"
                  d="M 70, 70 m -54, 0 a 54,54 0 1,1 108,0 a 54,54 0 1,1 -108,0"
                />
              </defs>
              <text className={styles.spinBadgeText}>
                <textPath href="#circle-text-band">
                  LET&apos;S GET STARTED &middot; QUOTE ON WHATSAPP &middot;{' '}
                </textPath>
              </text>
            </svg>
            <span className={styles.spinBadgeCore} aria-hidden="true">
              <ArrowUpRight size={28} strokeWidth={2.4} />
            </span>
            <span className="sr-only">Quote on WhatsApp</span>
          </a>

          <div className={styles.counter} aria-label="500 plus installations completed">
            <div className={styles.counterValue}>500+</div>
            <div className={styles.counterLabel}>Installations completed</div>
          </div>
        </div>
      </div>
    </section>
  )
}
