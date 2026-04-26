import type { Metadata } from 'next'
import { LeadForm } from '@/components/sections/LeadForm'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Contact AD-JEET — Get a Signage Quote',
  description:
    'Contact AD-JEET for signage and outdoor advertising across North Bengal. Office in Siliguri, workshop at Patiram Jote. WhatsApp, call, or use the lead form.',
  alternates: { canonical: `https://adjeet.vercel.app/contact` },
}

const waUrl = defaultWhatsAppUrl()
const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' },
])

const CONTACT_METHODS = [
  {
    icon: '💬',
    label: 'WhatsApp',
    value: '+91 98320 11524',
    sublabel: 'Fastest — reply within 2 hrs',
    href: waUrl,
    accent: true,
  },
  {
    icon: '📞',
    label: 'Call us',
    value: '+91 98320 11524',
    sublabel: 'Mon–Sat, 9 AM – 7 PM IST',
    href: 'tel:+919832011524',
    accent: false,
  },
  {
    icon: '✉️',
    label: 'Email',
    value: 'ranjitadjeet@gmail.com',
    sublabel: 'For detailed proposals',
    href: 'mailto:ranjitadjeet@gmail.com',
    accent: false,
  },
]

const LOCATIONS = [
  {
    type: 'Office',
    name: 'AD-JEET',
    address: 'Platinum Square, Siliguri',
    region: 'West Bengal 734001',
    hours: 'Mon–Sat, 9 AM – 7 PM',
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3562.4!2d88.395!3d26.727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDQzJzM3LjIiTiA4OMKwMjMnNDIuMCJF!5e0!3m2!1sen!2sin!4v1',
  },
  {
    type: 'Workshop',
    name: 'AD-JEET Fabrication',
    address: 'Patiram Jote',
    region: 'Near Siliguri, West Bengal',
    hours: 'Mon–Sat, 8 AM – 6 PM',
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

      {/* ═══════════════════ HERO — Dramatic split ═══════════════════ */}
      <section className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden section-inverse">
        {/* Layered background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a08] via-[#1A1916] to-[#0d1117]" />
          {/* Cross-hatch pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(45deg, var(--adjeet-blue) 1px, transparent 1px),
                linear-gradient(-45deg, var(--adjeet-blue) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_70%_100%,rgba(30,127,184,0.12),transparent)]" />
        </div>

        {/* Huge ghost text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none whitespace-nowrap">
          <span
            className="block font-serif font-black text-transparent leading-none"
            style={{
              fontSize: 'clamp(10rem, 25vw, 30rem)',
              WebkitTextStroke: '1px rgba(30,127,184,0.05)',
            }}
          >
            SAY HI
          </span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-content px-6 pb-20 pt-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-[1px] bg-blue" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
              Contact
            </span>
          </div>

          <h1 className="mb-6">
            <span
              className="block font-serif font-black text-white leading-[0.85] tracking-tight"
              style={{ fontSize: 'clamp(3rem, 9vw, 8rem)' }}
            >
              Let&apos;s
            </span>
            <span
              className="block font-serif font-black leading-[0.85] tracking-tight"
              style={{
                fontSize: 'clamp(3rem, 9vw, 8rem)',
                background: 'linear-gradient(135deg, var(--adjeet-blue), #7EC8E3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Talk.
            </span>
          </h1>

          <p className="text-white/50 text-lg max-w-md leading-relaxed">
            Whether it&apos;s a quick quote or a full project discussion — we&apos;re here.
          </p>
        </div>

        {/* Angled transition */}
        <div className="absolute bottom-0 left-0 right-0 h-16">
          <svg viewBox="0 0 1440 64" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 64h1440V20L720 0 0 20v44z" fill="var(--paper)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ CONTACT METHODS — Three columns ═══════════════════ */}
      <section className="py-16 relative z-10">
        <div className="mx-auto max-w-content px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONTACT_METHODS.map(method => (
              <a
                key={method.label}
                href={method.href}
                target={method.label === 'WhatsApp' ? '_blank' : undefined}
                rel={method.label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                className={`group relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  method.accent
                    ? 'border-blue/30 bg-blue/5 hover:border-blue/60 hover:bg-blue/10'
                    : 'border-rule bg-paper-elevated hover:border-blue/30'
                }`}
              >
                {/* Glow on accent card */}
                {method.accent && (
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
                )}

                <span className="text-2xl mb-4 block">{method.icon}</span>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-subtle mb-2">
                  {method.label}
                </p>
                <p className="font-bold text-ink text-lg mb-1 group-hover:text-blue transition-colors">
                  {method.value}
                </p>
                <p className="text-xs text-ink-muted">{method.sublabel}</p>

                {/* Arrow */}
                <span className="absolute top-6 right-6 text-ink-subtle/30 group-hover:text-blue group-hover:translate-x-1 transition-all text-lg">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FORM + LOCATIONS — The main act ═══════════════════ */}
      <section className="pb-24">
        <div className="mx-auto max-w-content px-6">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-[1px] bg-blue" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-subtle">
              Send us a message
            </span>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form — takes 3 columns */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-rule bg-paper-elevated p-8 sm:p-10 shadow-sm">
                <h2
                  className="font-serif font-bold text-ink mb-2"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                >
                  Get a quote
                </h2>
                <p className="text-sm text-ink-muted mb-8">
                  Fill in the details below and we&apos;ll get back to you within 2 business hours.
                </p>
                <LeadForm />
              </div>
            </div>

            {/* Sidebar — locations + info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Locations */}
              {LOCATIONS.map(loc => (
                <div
                  key={loc.type}
                  className="rounded-2xl border border-rule p-6 relative overflow-hidden group hover:border-blue/30 transition-colors"
                >
                  {/* Subtle corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue/5 to-transparent rounded-bl-full" />

                  <div className="relative">
                    <span className="inline-block px-2 py-0.5 rounded bg-blue/10 text-[10px] font-mono uppercase tracking-[0.2em] text-blue mb-3">
                      {loc.type}
                    </span>
                    <h3 className="font-bold text-ink mb-2">{loc.name}</h3>
                    <p className="text-sm text-ink-muted">{loc.address}</p>
                    <p className="text-sm text-ink-muted">{loc.region}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-ink-subtle">
                      <span>🕐</span>
                      <span>{loc.hours}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-rule aspect-[4/3] relative group">
                <iframe
                  src={LOCATIONS[0].mapSrc!}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin"
                  title="AD-JEET office location map"
                />
                {/* Map overlay label */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-paper/90 backdrop-blur-sm border border-rule shadow-sm">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">
                    📍 Platinum Square, Siliguri
                  </p>
                </div>
              </div>

              {/* Quick info card */}
              <div className="rounded-2xl border border-rule bg-paper-elevated p-6">
                <h3 className="text-sm font-bold text-ink mb-4">Quick Info</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Response time', value: '< 2 hours' },
                    { label: 'Site visit', value: 'Same-day in Siliguri' },
                    { label: 'Quote validity', value: '15 days' },
                    { label: 'Coverage', value: '12+ districts' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center text-sm">
                      <span className="text-ink-muted">{item.label}</span>
                      <span className="font-mono text-xs text-ink font-medium">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA — Coverage map ═══════════════════ */}
      <section className="py-20 section-inverse relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(var(--adjeet-blue) 1px, transparent 1px),
              linear-gradient(90deg, var(--adjeet-blue) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-content mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 mb-4">
              Service Area
            </span>
            <h2
              className="font-serif font-black text-white leading-[0.9]"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              We cover all of<br />North Bengal.
            </h2>
          </div>

          {/* District grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-3xl mx-auto">
            {[
              { name: 'Siliguri', tag: 'HQ' },
              { name: 'Jalpaiguri', tag: null },
              { name: 'Cooch Behar', tag: null },
              { name: 'Darjeeling', tag: null },
              { name: 'Malda', tag: null },
              { name: 'Alipurduar', tag: null },
              { name: 'Kalimpong', tag: null },
              { name: 'N. Dinajpur', tag: null },
              { name: 'S. Dinajpur', tag: null },
              { name: 'Dooars', tag: null },
            ].map(d => (
              <div
                key={d.name}
                className={`rounded-xl border px-4 py-3 text-center transition-colors ${
                  d.tag
                    ? 'border-blue/40 bg-blue/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className="text-sm font-medium text-white">{d.name}</p>
                {d.tag && (
                  <span className="text-[9px] font-mono uppercase tracking-wider text-blue">
                    {d.tag}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-white/40 text-sm mb-6">
              Don&apos;t see your location? We likely cover it.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded bg-white text-blue-deep font-bold px-8 py-4 text-sm hover:bg-white/90 transition-colors active:scale-[0.98]"
            >
              Ask about your area →
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
