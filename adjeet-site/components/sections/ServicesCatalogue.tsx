import Link from 'next/link'
import {
  Lightbulb, Layers, Printer, Truck, Paintbrush,
  Flag, Store, Sparkles, Eye, Monitor,
} from 'lucide-react'
import { services } from '@/content/services'
import styles from './ServicesCatalogue.module.css'

const ICON_MAP: Record<string, typeof Lightbulb> = {
  lightbulb:       Lightbulb,
  panels:          Layers,
  print:           Printer,
  truck:           Truck,
  'paint-roller':  Paintbrush,
  'flag-pole':     Flag,
  store:           Store,
  sparkles:        Sparkles,
  eye:             Eye,
  display:         Monitor,
}

export function ServicesCatalogue() {
  return (
    <section className={styles.section}>

      <div className={styles.header}>
        <span className={styles.headerLabel}>№ 02 — The Catalogue</span>
        <span className={styles.headerCount}>{services.length} services</span>
      </div>

      <div className={styles.grid}>
        {services.map((service, i) => {
          const Icon = ICON_MAP[service.icon] ?? Sparkles
          return (
            <div
              key={service.slug}
              className={styles.cardOuter}
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <Link href={`/services/${service.slug}`} className={styles.cardLink}>
                <div className={styles.cardInner}>

                  <div className={styles.cardFront}>
                    <span className={styles.cardNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.cardName}>{service.name}</span>
                    <span className={styles.cardArrow} aria-hidden="true">↗</span>
                  </div>

                  <div className={styles.cardBack}>
                    <Icon size={36} strokeWidth={1.5} className={styles.cardIcon} />
                    <span className={styles.cardTagline}>{service.tagline}</span>
                  </div>

                </div>
              </Link>
            </div>
          )
        })}
      </div>

    </section>
  )
}
