import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { LeadForm } from '@/components/sections/LeadForm'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = {
  title: 'Contact AD-JEET — Get a Signage Quote',
  description:
    'Contact AD-JEET for signage and outdoor advertising across North Bengal. Office in Siliguri, workshop at Patiram Jote. WhatsApp, call, or use the lead form.',
  alternates: { canonical: `${siteConfig.url}/contact` },
}

const waUrl = defaultWhatsAppUrl()
const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' },
])

const MONO: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

function RegMark({ style }: { style?: CSSProperties }) {
  return (
    <svg style={style} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <line x1="11" y1="0" x2="11" y2="22" stroke="currentColor" strokeWidth="0.7" />
      <line x1="0" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="0.7" fill="none" />
    </svg>
  )
}

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          § MASTHEAD — Editorial opener
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-paper px-5 pt-4 pb-14 md:px-10">
        {/* Paper grain */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.7 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
          }}
        />

        <div
          className="relative mx-auto flex flex-col"
          style={{
            maxWidth: '1280px',
            border: '1px solid var(--rule)',
            padding: 'clamp(36px, 5vw, 64px) clamp(24px, 4vw, 56px)',
            minHeight: 'calc(70svh - 100px)',
          }}
        >
          <RegMark style={{ position: 'absolute', top: '-11px', left: '-11px', color: 'var(--ink-subtle)' }} />
          <RegMark style={{ position: 'absolute', top: '-11px', right: '-11px', color: 'var(--ink-subtle)' }} />
          <RegMark style={{ position: 'absolute', bottom: '-11px', left: '-11px', color: 'var(--ink-subtle)' }} />
          <RegMark style={{ position: 'absolute', bottom: '-11px', right: '-11px', color: 'var(--ink-subtle)' }} />

          {/* Masthead row */}
          <header className="flex justify-between items-start gap-6">
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                  color: 'var(--ink)',
                }}
              >
                AD-JEET
              </div>
              <div style={{ ...MONO, marginTop: '6px', color: 'var(--ink-muted)', letterSpacing: '0.22em' }}>
                Get in touch
              </div>
            </div>
            <div
              style={{
                ...MONO,
                fontSize: '9.5px',
                color: 'var(--ink-subtle)',
                textAlign: 'right',
                lineHeight: 1.7,
                letterSpacing: '0.22em',
              }}
            >
              <div>+91 98320 11524</div>
              <div>SILIGURI, WB</div>
              <div>MON–SAT 9–7</div>
            </div>
          </header>

          <div style={{ height: '1px', background: 'var(--rule)', margin: '20px 0' }} />

          {/* Main headline */}
          <div className="flex-1 flex flex-col justify-center py-8 md:py-12">
            <h1
              className="text-ink"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                fontSize: 'clamp(3.5rem, 11vw, 10rem)',
                lineHeight: 0.82,
                letterSpacing: '-0.03em',
              }}
            >
              Let&apos;s
            </h1>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: 'clamp(3.5rem, 11vw, 10rem)',
                lineHeight: 0.82,
                letterSpacing: '-0.03em',
                color: 'var(--ink-muted)',
              }}
            >
              talk.
            </h1>
            <p
              className="text-ink-muted"
              style={{
                marginTop: '2rem',
                maxWidth: '46ch',
                lineHeight: 1.65,
                fontSize: '1rem',
              }}
            >
              Whether it&apos;s a quick quote or a full project discussion — we respond within 2 hours on business days.
            </p>
          </div>

          <div style={{ height: '1px', background: 'var(--rule)', margin: '0 0 20px' }} />

          {/* Fastest path CTA */}
          <footer className="flex flex-wrap items-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all hover:-translate-y-px active:scale-[0.98]"
              style={{
                padding: '14px 24px',
                background: 'var(--ink)',
                color: 'var(--paper)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                fontSize: '15px',
                letterSpacing: '0.01em',
                textDecoration: 'none',
                borderRadius: '1px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              WhatsApp us →
            </a>
            <span style={{ ...MONO, color: 'var(--ink-subtle)', fontSize: '10px' }}>
              Fastest — reply within 2 hrs
            </span>
          </footer>

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '14px',
              right: '22px',
              ...MONO,
              fontSize: '9.5px',
              color: 'var(--ink-subtle)',
              letterSpacing: '0.22em',
              opacity: 0.7,
              pointerEvents: 'none',
            }}
          >
            cont. ↓
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § CONTACT METHODS — Rule-separated list, no emoji cards
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid var(--rule)' }}>
        <div
          className="mx-auto max-w-content px-6 py-4"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <SectionLabel>Ways to reach us</SectionLabel>
        </div>

        <div className="mx-auto max-w-content px-6">
          {[
            {
              method: 'WhatsApp',
              value: '+91 98320 11524',
              note: 'Fastest response — within 2 hrs on business days',
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
          ].map((item, i) => (
            <a
              key={item.method}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              className="group flex items-center justify-between gap-6 py-6 transition-colors hover:bg-paper-elevated"
              style={{
                borderBottom: i < 2 ? '1px solid var(--rule)' : 'none',
                paddingLeft: '0',
                paddingRight: '0',
                textDecoration: 'none',
                marginLeft: '-1.5rem',
                marginRight: '-1.5rem',
                paddingInline: '1.5rem',
              }}
            >
              <div className="flex items-baseline gap-6 min-w-0">
                <span
                  style={{
                    ...MONO,
                    color: 'var(--ink-subtle)',
                    flexShrink: 0,
                    fontSize: '10px',
                    width: '4.5rem',
                  }}
                >
                  {item.method}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                    color: 'var(--ink)',
                    lineHeight: 1.2,
                  }}
                  className="truncate group-hover:text-blue transition-colors"
                >
                  {item.value}
                </span>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span
                  style={{
                    ...MONO,
                    color: 'var(--ink-subtle)',
                    fontSize: '10px',
                  }}
                  className="hidden sm:block"
                >
                  {item.note}
                </span>
                <span
                  className="text-ink-subtle group-hover:text-ink group-hover:translate-x-1 transition-all"
                  style={{ fontSize: '1.125rem', lineHeight: 1 }}
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § FORM + LOCATIONS — The main act
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid var(--rule)' }}>
        <div
          className="mx-auto max-w-content px-6 py-4"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <SectionLabel>№ 01 — Send a message</SectionLabel>
        </div>

        <div className="mx-auto max-w-content px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form — 3 cols */}
            <div className="lg:col-span-3">
              <h2
                className="text-ink"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 900,
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.5rem',
                }}
              >
                Get a quote
              </h2>
              <p
                className="text-ink-muted"
                style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}
              >
                Fill in the details — we&apos;ll respond within 2 business hours.
              </p>

              <div
                style={{
                  border: '1px solid var(--rule)',
                  padding: 'clamp(24px, 4vw, 40px)',
                }}
              >
                <LeadForm />
              </div>
            </div>

            {/* Sidebar — locations + quick info */}
            <div className="lg:col-span-2 space-y-0">
              {/* Office */}
              <div style={{ borderBottom: '1px solid var(--rule)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ ...MONO, color: 'var(--ink-subtle)', marginBottom: '0.75rem' }}>
                  Office
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--ink)',
                    marginBottom: '0.375rem',
                  }}
                >
                  AD-JEET
                </div>
                <div className="text-ink-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Platinum Square, Siliguri<br />
                  West Bengal 734001
                </div>
                <div
                  style={{
                    ...MONO,
                    color: 'var(--ink-subtle)',
                    marginTop: '0.5rem',
                    fontSize: '10px',
                  }}
                >
                  Mon–Sat, 9 AM – 7 PM
                </div>
              </div>

              {/* Workshop */}
              <div style={{ borderBottom: '1px solid var(--rule)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ ...MONO, color: 'var(--ink-subtle)', marginBottom: '0.75rem' }}>
                  Workshop
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--ink)',
                    marginBottom: '0.375rem',
                  }}
                >
                  AD-JEET Fabrication
                </div>
                <div className="text-ink-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Patiram Jote<br />
                  Near Siliguri, West Bengal
                </div>
                <div
                  style={{
                    ...MONO,
                    color: 'var(--ink-subtle)',
                    marginTop: '0.5rem',
                    fontSize: '10px',
                  }}
                >
                  Mon–Sat, 8 AM – 6 PM
                </div>
              </div>

              {/* Map */}
              <div
                style={{
                  border: '1px solid var(--rule)',
                  aspectRatio: '4/3',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '1.5rem',
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3562.4!2d88.395!3d26.727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDQzJzM3LjIiTiA4OMKwMjMnNDIuMCJF!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin"
                  title="AD-JEET office location"
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: 'var(--paper)',
                    border: '1px solid var(--rule)',
                    padding: '4px 10px',
                  }}
                >
                  <span style={{ ...MONO, color: 'var(--ink-muted)', fontSize: '9.5px' }}>
                    Platinum Square, Siliguri
                  </span>
                </div>
              </div>

              {/* Quick info — rule-separated list */}
              <div style={{ border: '1px solid var(--rule)', padding: '1.25rem' }}>
                <div style={{ ...MONO, color: 'var(--ink-subtle)', marginBottom: '1rem' }}>
                  Quick info
                </div>
                {[
                  { label: 'Response time', value: '< 2 hours' },
                  { label: 'Site visit', value: 'Same-day in Siliguri' },
                  { label: 'Quote validity', value: '15 days' },
                  { label: 'Coverage', value: '12+ districts' },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-baseline py-2"
                    style={{ borderBottom: i < 3 ? '1px solid var(--rule)' : 'none' }}
                  >
                    <span className="text-ink-muted" style={{ fontSize: '0.8125rem' }}>
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        letterSpacing: '0.06em',
                        color: 'var(--ink)',
                        fontWeight: 600,
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § COVERAGE — Clean district grid
      ══════════════════════════════════════════════════════════════════ */}
      <section className="section-inverse">
        <div
          className="mx-auto max-w-content px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <SectionLabel style={{ color: 'rgba(240,235,222,0.4)' }}>
            Service coverage
          </SectionLabel>
        </div>

        <div className="mx-auto max-w-content px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Headline */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 900,
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  lineHeight: 0.88,
                  letterSpacing: '-0.025em',
                  color: 'var(--paper)',
                  marginBottom: '1.5rem',
                }}
              >
                All of<br />
                <span style={{ fontStyle: 'italic', color: 'rgba(240,235,222,0.5)' }}>
                  North Bengal.
                </span>
              </h2>
              <p
                style={{
                  color: 'rgba(240,235,222,0.4)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.65,
                  maxWidth: '40ch',
                  marginBottom: '2rem',
                }}
              >
                Don&apos;t see your location? We likely cover it — ask on WhatsApp.
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '14px 24px',
                  background: 'var(--paper)',
                  color: 'var(--adjeet-blue)',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  fontSize: '15px',
                  letterSpacing: '0.01em',
                  textDecoration: 'none',
                  borderRadius: '1px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                className="transition-all hover:-translate-y-px active:scale-[0.98]"
              >
                Ask about your area →
              </a>
            </div>

            {/* District grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {[
                { name: 'Siliguri', hq: true },
                { name: 'Jalpaiguri', hq: false },
                { name: 'Cooch Behar', hq: false },
                { name: 'Darjeeling', hq: false },
                { name: 'Malda', hq: false },
                { name: 'Alipurduar', hq: false },
                { name: 'Kalimpong', hq: false },
                { name: 'N. Dinajpur', hq: false },
                { name: 'S. Dinajpur', hq: false },
                { name: 'Dooars', hq: false },
              ].map((d, i) => (
                <div
                  key={d.name}
                  className="py-3 px-4 flex items-center justify-between"
                  style={{
                    borderBottom: i < 8 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: d.hq ? 700 : 400,
                      fontSize: '0.9375rem',
                      color: d.hq ? 'var(--paper)' : 'rgba(240,235,222,0.55)',
                    }}
                  >
                    {d.name}
                  </span>
                  {d.hq && (
                    <span
                      style={{
                        ...MONO,
                        fontSize: '9px',
                        color: 'rgba(240,235,222,0.35)',
                      }}
                    >
                      HQ
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
