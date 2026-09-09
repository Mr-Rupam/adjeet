import type { Metadata } from 'next'
import { LeadForm } from '@/components/sections/LeadForm'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

export const metadata: Metadata = {
  title: 'Contact AD JEET: Get a Signage Quote',
  description: 'Contact AD JEET for signage and outdoor advertising across North Bengal. WhatsApp, call, email, or send a project brief.',
  alternates: { canonical: `${siteConfig.url}/contact` },
}

const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' },
])

const METHODS = [
  { method: 'WhatsApp', value: '+91 98320 11524', note: 'Send a project photo or a short brief.', href: 'https://wa.me/919832011524', external: true },
  { method: 'Call', value: '+91 98320 11524', note: 'Talk through the site and what needs to happen there.', href: 'tel:+919832011524', external: false },
  { method: 'Email', value: 'ranjitadjeet@gmail.com', note: 'Useful for drawings, documents and detailed briefs.', href: 'mailto:ranjitadjeet@gmail.com', external: false },
]

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />

      <PageMasthead
        meta={['+91 98320 11524', 'Siliguri', 'North Bengal']}
        title={<>Tell us what the<br /><span className="glow-signal text-signal">street should say.</span></>}
        lead="A photo, a rough size, or a complete project brief all work. Choose the way you would rather start."
      >
        <QuoteCTA source="contact" tone="yellow" label="WhatsApp your project" />
      </PageMasthead>

      <section className="border-b border-rule bg-paper">
        <div className="mx-auto max-w-content px-5 py-14 md:px-8 md:py-20">
          <p className="spec text-signal">Choose a way in</p>
          <ol className="m-0 mt-6 list-none border-t border-rule p-0">
            {METHODS.map(item => (
              <li key={item.method} className="border-b border-rule">
                <a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} className="group grid min-h-24 grid-cols-[5.8rem_minmax(0,1fr)_auto] items-center gap-x-3 py-4 transition-colors hover:text-signal md:grid-cols-[8rem_minmax(0,1fr)_auto] md:px-3">
                  <span className="spec text-ink-subtle">{item.method}</span>
                  <span className="min-w-0">
                    <span className="display block truncate text-2xl text-ink group-hover:text-signal md:text-3xl">{item.value}</span>
                    <span className="mt-1 block text-sm text-ink-muted">{item.note}</span>
                  </span>
                  <span aria-hidden="true" className="text-xl text-ink-subtle transition-transform group-hover:translate-x-1 group-hover:text-signal">↗</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-rule bg-paper-elevated">
        <div className="mx-auto grid max-w-content gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <p className="spec text-signal">Project brief</p>
            <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }}>Put the useful details here.</h2>
            <p className="mt-4 max-w-[41ch] text-base leading-relaxed text-ink-muted">The form reaches the same team. Tell us the location, service and timing you have in mind.</p>
            <div className="mt-8 rounded-[1.15rem] border border-rule bg-paper p-5 shadow-[var(--elev-1)] md:p-8">
              <LeadForm />
            </div>
          </div>

          <aside className="self-start lg:sticky lg:top-28">
            <div className="border-t border-rule py-6">
              <p className="spec text-signal">Office</p>
              <p className="display mt-2 text-3xl text-ink">Platinum Square</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">Siliguri, West Bengal 734001</p>
            </div>
            <div className="border-y border-rule py-6">
              <p className="spec text-signal">Workshop</p>
              <p className="display mt-2 text-3xl text-ink">Patiram Jote</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">Siliguri, West Bengal</p>
            </div>
            <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-[1rem] bg-night">
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
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
