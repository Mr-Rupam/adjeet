import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SERVICE_SLUGS, getServiceBySlug, type ServiceSlug } from '@/content/services'
import { getPhotosByService } from '@/content/gallery'
import {
  buildServiceJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  generateServiceMetadata,
} from '@/lib/seo'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { Accordion } from '@/components/ui/Accordion'
import { ServiceTile } from '@/components/sections/ServicesGrid'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { LeadForm } from '@/components/sections/LeadForm'
import { ServicePageTracker } from '@/components/PageViewTracker'

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

  const photos = getPhotosByService(slug as ServiceSlug)
  const waUrl = defaultWhatsAppUrl({ service: service.name })

  const relatedServices = service.relatedServices
    .map(s => getServiceBySlug(s))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)

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

      {/* Hero */}
      <section className="relative flex items-end min-h-[40vh] section-inverse py-16">
        <div className="relative z-10 mx-auto max-w-content px-6">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex gap-2 text-xs text-white/50 list-none p-0 m-0">
              <li><Link href="/" className="hover:text-white/80 transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/services" className="hover:text-white/80 transition-colors">Services</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/80">{service.name}</li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            {service.name}
          </h1>
          <p className="text-white/75 text-lg max-w-xl">{service.tagline}</p>
        </div>
      </section>

      {/* Details band */}
      <section className="py-12 border-b border-rule">
        <div className="mx-auto max-w-content px-6 grid sm:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-3">
              Materials
            </h2>
            <ul className="text-sm text-ink-muted space-y-1 list-none p-0 m-0">
              {service.materials.map(m => <li key={m}>{m}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-3">
              Sizes / Formats
            </h2>
            <ul className="text-sm text-ink-muted space-y-1 list-none p-0 m-0">
              {service.sizes.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-3">
              Turnaround
            </h2>
            <p className="text-sm text-ink-muted">{service.turnaround}</p>
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      {photos.length > 0 && <GalleryStrip photos={photos} />}

      {/* WhatsApp CTA */}
      <section className="bg-blue py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-white text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/80 mb-8">Chat with us on WhatsApp for a fast quote.</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded bg-white text-blue font-semibold px-8 py-3.5 hover:bg-white/90 transition-colors active:scale-[0.98]"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-32">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold font-serif text-ink mb-8">
              Frequently Asked Questions
            </h2>
            <Accordion items={service.faqs} />
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section className="py-16 md:py-32 border-t border-rule">
        <div className="mx-auto max-w-content px-6 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold font-serif text-ink mb-3">
              Get a Callback
            </h2>
            <p className="text-ink-muted text-sm mb-2">
              Leave your details and our team will reach out with a quote for {service.name}.
            </p>
            <p className="text-xs text-ink-subtle">
              Prefer WhatsApp?{' '}
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                Message us directly →
              </a>
            </p>
          </div>
          <LeadForm />
        </div>
      </section>

      {/* Related services */}
      {relatedServices.length > 0 && (
        <section className="py-12 bg-paper-elevated border-t border-rule">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-subtle mb-6">
              Related Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedServices.map(rs => (
                <ServiceTile
                  key={rs.slug}
                  slug={rs.slug}
                  name={rs.name}
                  tagline={rs.tagline}
                  icon={rs.icon}
                  expanded={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Secondary CTA */}
      <div className="py-12 text-center border-t border-rule">
        <Link href="/services" className="text-sm text-blue hover:underline">
          ← Explore all services
        </Link>
      </div>
    </>
  )
}
