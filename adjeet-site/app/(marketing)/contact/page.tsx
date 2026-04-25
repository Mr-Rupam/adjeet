import type { Metadata } from 'next'
import { LeadForm } from '@/components/sections/LeadForm'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, siteConfig } from '@/lib/seo'
import { FadeIn } from '@/components/motion/FadeIn'

export const metadata: Metadata = {
  title: 'Contact AD-JEET — Get a Signage Quote',
  description: 'Contact AD-JEET for signage and outdoor advertising across North Bengal. Office in Siliguri, workshop at Patiram Jote. WhatsApp, call, or use the lead form.',
  alternates: { canonical: `${siteConfig.url}/contact` },
}

const waUrl = defaultWhatsAppUrl()
const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' },
])

const ADDRESSES = [
  {
    label: 'Office',
    name: 'AD-JEET',
    lines: ['Platinum Square, Siliguri', 'West Bengal 734001'],
    phone: '+91 98320 11524',
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3562.4!2d88.395!3d26.727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDQzJzM3LjIiTiA4OMKwMjMnNDIuMCJF!5e0!3m2!1sen!2sin!4v1',
  },
  {
    label: 'Workshop',
    name: 'AD-JEET Fabrication',
    lines: ['Patiram Jote', 'Near Siliguri, West Bengal'],
    phone: '+91 98320 11524',
    mapSrc: null,
  },
]

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero */}
      <section className="flex items-end min-h-[35vh] bg-ink py-16">
        <div className="mx-auto max-w-content px-6">
          <h1 className="text-[var(--text-display-2)] font-[var(--font-fraunces)] font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-white/70 max-w-xl">
            Tell us about your project and we&apos;ll get back to you with a quote within 2 business hours.
          </p>
        </div>
      </section>

      {/* WhatsApp primary CTA */}
      <section className="bg-paper-elevated border-b border-rule py-8">
        <div className="mx-auto max-w-content px-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-ink">Prefer WhatsApp?</p>
            <p className="text-sm text-ink-muted">Chat with us directly — fastest way to get a quote.</p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded bg-blue text-white font-semibold px-7 py-3 text-sm hover:opacity-90 transition-opacity shrink-0"
          >
            Chat on WhatsApp →
          </a>
        </div>
      </section>

      <section className="py-[var(--section-py)]">
        <div className="mx-auto max-w-content px-6">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Lead form */}
            <div>
              <FadeIn>
                <h2 className="text-xl font-bold font-[var(--font-fraunces)] text-ink mb-6">Send a Message</h2>
              </FadeIn>
              <LeadForm />
            </div>

            {/* Address cards + map */}
            <div className="space-y-8">
              <FadeIn>
                <h2 className="text-xl font-bold font-[var(--font-fraunces)] text-ink mb-6">Find Us</h2>
              </FadeIn>

              {ADDRESSES.map(addr => (
                <div key={addr.label} className="rounded-lg border border-rule p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue mb-3">{addr.label}</p>
                  <p className="font-semibold text-ink mb-1">{addr.name}</p>
                  {addr.lines.map(l => (
                    <p key={l} className="text-sm text-ink-muted">{l}</p>
                  ))}
                  <a
                    href={`tel:${addr.phone.replace(/\s/g, '')}`}
                    className="mt-3 inline-block text-sm text-blue hover:underline"
                  >
                    {addr.phone}
                  </a>
                </div>
              ))}

              {/* Map embed */}
              <div className="rounded-lg overflow-hidden border border-rule aspect-[4/3]">
                <iframe
                  src={ADDRESSES[0].mapSrc!}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="AD-JEET office location map"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
