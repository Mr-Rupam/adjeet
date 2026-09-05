import type { Metadata } from 'next'
import { LeadForm } from '@/components/sections/LeadForm'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { DISTRICTS_SERVED } from '@/lib/coverage'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'

export const metadata: Metadata = {
  title: 'Contact AD JEET: Get a Signage Quote',
  description:
    'Contact AD JEET for signage and outdoor advertising across North Bengal. Office in Siliguri, workshop at Patiram Jote. WhatsApp, call, or use the lead form.',
  alternates: { canonical: `${siteConfig.url}/contact` },
}

const waUrl = defaultWhatsAppUrl()
const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' },
])

const METHODS = [
  {
    method: 'WhatsApp',
    value: '+91 98320 11524',
    note: 'Fastest: reply within 2 hrs on business days',
    href: waUrl,
    external: true,
  },
  {
    method: 'Call',
    value: '+91 98320 11524',
    note: 'Mon–Sat, 9 AM – 7 PM IST',
    href: 'tel:+919832011524',
    external: false,
  },
  {
    method: 'Email',
    value: 'ranjitadjeet@gmail.com',
    note: 'For detailed proposals and project briefs',
    href: 'mailto:ranjitadjeet@gmail.com',
    external: false,
  },
]

const QUICK_INFO = [
  { label: 'Response time', value: '< 2 hours' },
  { label: 'Site visit', value: 'Same-day in Siliguri' },
  { label: 'Quote validity', value: '15 days' },
  { label: 'Coverage', value: `${DISTRICTS_SERVED} districts` },
]

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }}
      />

      <PageMasthead
        meta={['+91 98320 11524', 'Siliguri, WB', 'Mon–Sat 9–7']}
        title={
          <>
            Tell us what the
            <br />
            street should <span className="glow-signal text-signal">say.</span>
          </>
        }
        lead="A quick quote or a full project brief. We reply within 2 hours on business days, and survey Siliguri sites the same day."
      >
        <WhatsAppLink
          href={waUrl}
          source={'contact'}
          className="inline-flex items-center gap-2 border-2 border-ink bg-signal px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-signal-ink shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--ink)]"
        >
          WhatsApp us →
        </WhatsAppLink>
      </PageMasthead>

      {/* Ways to reach us: board rows */}
      <section className="border-b-2 border-ink bg-paper">
        <div className="mx-auto max-w-content px-5 py-12 md:px-8 md:py-16">
          <p className="spec mb-6 text-signal">Ways to reach us</p>
          <ol className="m-0 list-none border-t-2 border-ink p-0">
            {METHODS.map(item => (
              <li key={item.method} className="border-b-2 border-ink">
                <a
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="group grid grid-cols-[6rem_1fr_auto] items-baseline gap-x-4 px-2 py-5 transition-colors hover:bg-ink md:gap-x-8 md:px-4"
                >
                  <span className="spec text-ink-subtle transition-colors group-hover:text-signal">
                    {item.method}
                  </span>
                  <span className="min-w-0">
                    <span className="display block truncate text-xl text-ink transition-colors group-hover:text-paper md:text-3xl">
                      {item.value}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-subtle transition-colors group-hover:text-paper/60">
                      {item.note}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-xl text-ink-subtle transition-all group-hover:translate-x-1 group-hover:text-signal">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Form + locations */}
      <section className="border-b-2 border-ink bg-paper-elevated">
        <div className="mx-auto grid max-w-content gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-5 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
              Get a quote.
            </h2>
            <p className="mt-3 mb-8 text-sm leading-relaxed text-ink-muted">
              Fill in the details. We&apos;ll come back within 2 business hours.
            </p>
            <div className="plate p-6 md:p-10">
              <LeadForm />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="border-b-2 border-ink pb-6">
              <p className="spec text-ink-subtle">Office</p>
              <p className="display m-0 mt-2 text-2xl text-ink">Platinum Square</p>
              <p className="m-0 mt-1 text-sm text-ink-muted">Siliguri, West Bengal 734001</p>
              <p className="spec m-0 mt-2 text-ink-subtle">Mon–Sat, 9 AM – 7 PM</p>
            </div>

            <div className="border-b-2 border-ink py-6">
              <p className="spec text-ink-subtle">Workshop</p>
              <p className="display m-0 mt-2 text-2xl text-ink">Patiram Jote</p>
              <p className="m-0 mt-1 text-sm text-ink-muted">Near Siliguri, West Bengal</p>
              <p className="spec m-0 mt-2 text-ink-subtle">Mon–Sat, 8 AM – 6 PM</p>
            </div>

            {/* Map */}
            <div className="relative mt-6 aspect-[4/3] overflow-hidden border-2 border-ink">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d891.0683159711388!2d88.42128342377295!3d26.703715758176227!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e44152d31a91b7%3A0x57ba4767fe74c984!2sAD%20SQUARE!5e0!3m2!1sen!2sin!4v1788639136120!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin"
                title="AD JEET office location"
              />
              <span className="spec absolute bottom-3 left-3 border-2 border-ink bg-paper px-2 py-1 text-ink-muted">
                Platinum Square, Siliguri
              </span>
            </div>

            {/* Quick info */}
            <dl className="plate m-0 mt-6 p-5">
              <p className="spec m-0 mb-3 text-signal">Quick info</p>
              {QUICK_INFO.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-baseline justify-between gap-4 py-2 ${
                    i < QUICK_INFO.length - 1 ? 'border-b border-rule' : ''
                  }`}
                >
                  <dt className="text-[13px] text-ink-muted">{row.label}</dt>
                  <dd className="spec m-0 font-semibold text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
