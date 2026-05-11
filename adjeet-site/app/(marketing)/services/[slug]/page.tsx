import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  SERVICE_SLUGS,
  getServiceBySlug,
  type ServiceSlug,
} from '@/content/services'
import {
  buildServiceJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  generateServiceMetadata,
} from '@/lib/seo'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { ServicePageTracker } from '@/components/PageViewTracker'
import styles from './ServiceDetail.module.css'

type Params = { slug: string }

export function generateStaticParams() {
  return SERVICE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug as ServiceSlug)
  if (!service) return {}
  return generateServiceMetadata(service)
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const service = getServiceBySlug(slug as ServiceSlug)
  if (!service) notFound()

  const waUrl = defaultWhatsAppUrl({ service: service.name })

  const serviceIndex = SERVICE_SLUGS.indexOf(slug as ServiceSlug) + 1
  const indexStr = String(serviceIndex).padStart(2, '0')
  const totalStr = String(SERVICE_SLUGS.length).padStart(2, '0')

  const serviceSchema = buildServiceJsonLd(service)
  const faqSchema = buildFaqJsonLd(service.faqs)
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${service.slug}` },
  ])

  return (
    <>
      <ServicePageTracker service={service.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGhost} aria-hidden="true">{indexStr}</div>

        <div className={styles.heroContent}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span className={styles.breadcrumbSep} aria-hidden="true">›</span>
            <Link href="/services">Services</Link>
            <span className={styles.breadcrumbSep} aria-hidden="true">›</span>
            <span>{service.name}</span>
          </nav>

          <div className={styles.heroIndex} aria-label={`Service ${serviceIndex} of ${SERVICE_SLUGS.length}`}>
            <span className={styles.heroIndexNum}>{indexStr}</span>
            <span className={styles.heroIndexSep} aria-hidden="true">/</span>
            <span className={styles.heroIndexTotal}>{totalStr}</span>
          </div>

          <h1 className={styles.heroTitle}>{service.name}</h1>
          <p className={styles.heroTagline}>{service.tagline}</p>

          <div className={styles.heroCtas}>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaPrimary}
            >
              Get a Quote on WhatsApp ↗
            </a>
            <Link href="/services" className={styles.ctaBack}>
              ← All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Spec Strip ── */}
      <section className={styles.specStrip} aria-label="Service specifications">
        <div className={styles.specGrid}>
          <div className={styles.specCell}>
            <span className={styles.specLabel}>Materials</span>
            <ul className={styles.specList}>
              {service.materials.map(m => <li key={m}>{m}</li>)}
            </ul>
          </div>
          <div className={styles.specCell}>
            <span className={styles.specLabel}>Sizes / Formats</span>
            <ul className={styles.specList}>
              {service.sizes.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div className={styles.specCell}>
            <span className={styles.specLabel}>Turnaround</span>
            <p className={styles.specValue}>
              {service.turnaround}
              <span className={styles.specValueSub}>typical lead time</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Back Bar ── */}
      <div className={styles.backBar}>
        <div className={styles.backBarInner}>
          <Link href="/services" className={styles.backLink}>
            ← Explore all services
          </Link>
          <span className={styles.backLink} style={{ opacity: 0.4 }}>
            {indexStr} / {totalStr} — {service.name}
          </span>
        </div>
      </div>
    </>
  )
}
