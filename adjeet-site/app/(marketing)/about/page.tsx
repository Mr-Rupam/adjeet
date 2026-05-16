import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = {
  title: 'About AD-JEET — North Bengal Signage Since 1990',
  description:
    'AD-JEET has been fabricating and installing signage across North Bengal since 1990. Learn our story, our team, and the districts we serve.',
  alternates: { canonical: `${siteConfig.url}/about` },
}

const waUrl = defaultWhatsAppUrl()
const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
])

const MILESTONES = [
  { year: '1990', title: 'The Beginning', desc: 'Jeet Kumar Sarkar opens a small fabrication workshop in Siliguri with hand-painted boards and basic neon installations.' },
  { year: '1998', title: 'Expansion', desc: 'Added flex printing and vehicle branding. Started serving Jalpaiguri and Cooch Behar.' },
  { year: '2005', title: 'The Workshop', desc: 'Opened the dedicated Patiram Jote fabrication facility — full control over every stage of production.' },
  { year: '2012', title: 'LED Revolution', desc: 'Adopted SMD LED technology. 60–70% less power consumption, 50,000-hour lifespan.' },
  { year: '2018', title: '12 Districts', desc: 'Coverage expands across North Bengal, from Darjeeling hills to Malda plains.' },
  { year: '2024', title: 'New Generation', desc: '500+ installations complete. Second-generation Sarkar family leadership carries the craft forward.' },
]

const STANDARDS = [
  {
    n: '01',
    title: 'In-house everything',
    body: 'We never outsource fabrication or installation. Every cut, every weld, every wire — done by our own team at Patiram Jote. Full accountability from brief to final fixing.',
  },
  {
    n: '02',
    title: 'Monsoon-proven builds',
    body: "North Bengal gets 3,000 mm of rain annually. Our signs use sealed enclosures, stainless fixings, and IP65-rated LED drivers designed for humidity and Nor'westers.",
  },
  {
    n: '03',
    title: 'One-year warranty',
    body: 'Every installation comes with a full one-year warranty on LED components and fabrication workmanship — driver replacements, resealing, electrical faults included.',
  },
  {
    n: '04',
    title: 'Same-day site visit',
    body: 'In Siliguri, we do same-day site surveys. For district projects, we coordinate within 24 hours and quote accurately before any work begins.',
  },
]

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

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          § MASTHEAD — Editorial printed-sheet opener
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-paper px-5 pt-4 pb-14 md:px-10"
        style={{ paddingTop: '1rem' }}
      >
        {/* Paper grain */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.7 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* The printed sheet */}
        <div
          className="relative mx-auto flex flex-col"
          style={{
            maxWidth: '1280px',
            border: '1px solid var(--rule)',
            padding: 'clamp(36px, 5vw, 64px) clamp(24px, 4vw, 56px)',
            minHeight: 'calc(85svh - 120px)',
          }}
        >
          {/* Registration marks */}
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
                Company Profile
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
              <div>EST. 1990</div>
              <div>SILIGURI, WB</div>
              <div>35 YRS CRAFT</div>
            </div>
          </header>

          {/* Rule */}
          <div style={{ height: '1px', background: 'var(--rule)', margin: '20px 0' }} />

          {/* Main headline */}
          <div className="flex-1 flex flex-col justify-center py-8 md:py-12">
            <h1
              className="text-ink"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                fontSize: 'clamp(2.75rem, 8vw, 7.5rem)',
                lineHeight: 0.86,
                letterSpacing: '-0.025em',
              }}
            >
              Built by hand.
            </h1>
            <h1
              className="text-ink-muted"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: 'clamp(2.75rem, 8vw, 7.5rem)',
                lineHeight: 0.86,
                letterSpacing: '-0.025em',
                marginTop: '0.15em',
              }}
            >
              Proven by decades.
            </h1>

            <p
              className="text-ink-muted"
              style={{
                marginTop: '2rem',
                maxWidth: '52ch',
                lineHeight: 1.65,
                fontSize: '1rem',
              }}
            >
              From a one-man workshop in Siliguri in 1990 to North Bengal&apos;s most trusted
              signage company — 500+ installations, 12 districts, two generations of craft.
            </p>
          </div>

          {/* Rule */}
          <div style={{ height: '1px', background: 'var(--rule)', margin: '0 0 20px' }} />

          {/* Stats footer */}
          <footer className="flex flex-wrap gap-8 sm:gap-12">
            {[
              { val: '1990', label: 'Founded' },
              { val: '500+', label: 'Installations' },
              { val: '12', label: 'Districts' },
              { val: '35', label: 'Years' },
            ].map(s => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 900,
                    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                    lineHeight: 1,
                    color: 'var(--ink)',
                  }}
                >
                  {s.val}
                </div>
                <div style={{ ...MONO, color: 'var(--ink-subtle)', marginTop: '4px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </footer>

          {/* cont. cue */}
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
          § 01 — THE STORY
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid var(--rule)' }}>
        <div
          className="mx-auto max-w-content px-6 py-4"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <SectionLabel>№ 01 — The Story</SectionLabel>
        </div>

        <div className="mx-auto max-w-content px-6 py-12 md:py-20">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Left — sticky label + pull headline */}
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <h2
                className="text-ink"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 900,
                  fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.02em',
                  marginBottom: '1.5rem',
                }}
              >
                A workshop.<br />
                A craft.<br />
                <span style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                  A legacy.
                </span>
              </h2>
              <div style={{ height: '1px', background: 'var(--rule)', width: '4rem' }} />
            </div>

            {/* Right — editorial prose */}
            <div className="lg:col-span-3">
              {[
                {
                  highlight: null,
                  text: 'AD-JEET was founded in 1990 by Jeet Kumar Sarkar in Siliguri, West Bengal. Starting with hand-painted boards and basic neon installations, the company grew alongside North Bengal\'s commercial expansion — from the early malls on Sevoke Road to the industrial zones near Bagdogra and the tea estates of Darjeeling.',
                },
                {
                  highlight: '3,000+',
                  highlightLabel: 'signs fabricated over three decades',
                  text: 'Over three and a half decades, we have installed signage for pharmacies, hospitals, clothing showrooms, telecom outlets, restaurants, logistics companies, and government departments. Our clients range from solo proprietors opening their first shop to regional chains expanding across five districts.',
                },
                {
                  highlight: null,
                  text: 'In 2005 we opened our dedicated fabrication workshop at Patiram Jote, outside Siliguri, giving us full control over quality at every stage — from metal cutting and acrylic routing to LED wiring and final paint finish.',
                },
                {
                  highlight: '60–70%',
                  highlightLabel: 'less power consumption with LED',
                  text: 'We adopted LED illumination in 2012. Modern SMD LEDs consume dramatically less power, last 30,000–50,000 hours, and produce consistently brighter light. Combined with weatherproofed enclosures, our signs routinely outlast their five-year maintenance agreements.',
                },
                {
                  highlight: null,
                  text: 'Today, AD-JEET is run by the second generation of the Sarkar family, with the same commitment to craftsmanship that built our reputation. We do not outsource fabrication or installation. Every project is handled by our own team.',
                },
              ].map((block, i) => (
                <div key={i} className="relative">
                  {block.highlight && (
                    <div className="mb-3 flex items-end gap-3">
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 'clamp(2rem, 5vw, 3rem)',
                          fontWeight: 900,
                          lineHeight: 1,
                          color: 'var(--ink)',
                        }}
                      >
                        {block.highlight}
                      </span>
                      <span
                        style={{ ...MONO, color: 'var(--ink-subtle)', paddingBottom: '4px' }}
                      >
                        {block.highlightLabel}
                      </span>
                    </div>
                  )}
                  <p className="text-ink-muted" style={{ lineHeight: 1.7, fontSize: '0.9375rem' }}>
                    {block.text}
                  </p>
                  {i < 4 && (
                    <div style={{ marginTop: '2rem', marginBottom: '2rem', height: '1px', background: 'var(--rule)', width: '2rem' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § 02 — MILESTONES
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid var(--rule)' }}>
        <div
          className="mx-auto max-w-content px-6 py-4"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <SectionLabel>№ 02 — Milestones</SectionLabel>
        </div>

        <div className="mx-auto max-w-content px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-0">
            {MILESTONES.map((m, i) => {
              const isLastRow = i >= MILESTONES.length - (MILESTONES.length % 3 || 3)
              return (
                <div
                  key={m.year}
                  className="py-8"
                  style={{
                    borderBottom: isLastRow ? 'none' : '1px solid var(--rule)',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                      fontWeight: 700,
                      lineHeight: 1,
                      color: 'var(--rule)',
                      marginBottom: '0.75rem',
                      userSelect: 'none',
                    }}
                  >
                    {m.year}
                  </div>
                  <h3
                    className="text-ink"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {m.title}
                  </h3>
                  <p
                    className="text-ink-muted"
                    style={{ fontSize: '0.875rem', lineHeight: 1.65, maxWidth: '36ch' }}
                  >
                    {m.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § 03 — OUR STANDARD
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid var(--rule)' }}>
        <div
          className="mx-auto max-w-content px-6 py-4"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <SectionLabel>№ 03 — Our Standard</SectionLabel>
        </div>

        <div className="mx-auto max-w-content px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0">
            {STANDARDS.map((s, i) => (
              <div
                key={s.n}
                className="py-8"
                style={{ borderBottom: i < 2 ? '1px solid var(--rule)' : 'none' }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(3rem, 7vw, 5rem)',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--rule)',
                    marginBottom: '1rem',
                    userSelect: 'none',
                  }}
                >
                  {s.n}
                </div>
                <h3
                  className="text-ink"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    marginBottom: '0.625rem',
                  }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-ink-muted"
                  style={{ fontSize: '0.9rem', lineHeight: 1.65, maxWidth: '38ch' }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § STATS BAND
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="bg-paper-elevated"
        style={{ borderBottom: '1px solid var(--rule)' }}
      >
        <div className="mx-auto max-w-content px-6 py-4" style={{ borderBottom: '1px solid var(--rule)' }}>
          <SectionLabel>By the numbers</SectionLabel>
        </div>
        <div className="mx-auto max-w-content px-6 py-10">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              { value: '1990', label: 'Founded' },
              { value: '500+', label: 'Installations' },
              { value: '12', label: 'Districts' },
              { value: '35', label: 'Years craft' },
              { value: '2', label: 'Generations' },
              { value: '1yr', label: 'Warranty' },
            ].map(s => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 900,
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    lineHeight: 1,
                    color: 'var(--ink)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {s.value}
                </div>
                <div style={{ ...MONO, color: 'var(--ink-subtle)', fontSize: '10px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § 04 — THE WORKSHOP
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid var(--rule)' }}>
        <div
          className="mx-auto max-w-content px-6 py-4"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <SectionLabel>№ 04 — The Workshop</SectionLabel>
        </div>

        <div className="mx-auto max-w-content px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Text */}
            <div>
              <h2
                className="text-ink"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 900,
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.02em',
                  marginBottom: '1.5rem',
                }}
              >
                Where signs<br />come to life.
              </h2>

              <div className="space-y-4 text-ink-muted" style={{ lineHeight: 1.7, fontSize: '0.9375rem' }}>
                <p>
                  Our 4,000 sq ft fabrication facility at Patiram Jote is where every AD-JEET sign
                  is born. Metal cutting, CNC routing, acrylic bending, LED wiring, painting —
                  everything under one roof.
                </p>
                <p>
                  The workshop runs six days a week with a dedicated quality inspection station.
                  We maintain a fleet of installation vehicles equipped with scaffolding, generators,
                  and wiring tools.
                </p>
              </div>

              {/* Workshop specs — rule-separated list */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--rule)' }}>
                {[
                  { val: '4,000 sq ft', label: 'Workshop area' },
                  { val: '6 days/week', label: 'Operating schedule' },
                  { val: '3 vehicles', label: 'Installation fleet' },
                  { val: '15+ skilled workers', label: 'Our team' },
                ].map((spec, i) => (
                  <div
                    key={spec.label}
                    className="flex justify-between items-baseline py-3"
                    style={{ borderBottom: i < 3 ? '1px solid var(--rule)' : 'none' }}
                  >
                    <span style={{ ...MONO, color: 'var(--ink-subtle)' }}>{spec.label}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: 'var(--ink)',
                      }}
                    >
                      {spec.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual — process stages as editorial panels */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Metal', sub: 'Cutting & Welding', dark: true },
                { label: 'LED', sub: 'Wiring & Testing', dark: false },
                { label: 'Acrylic', sub: 'Routing & Bending', dark: false },
                { label: 'Paint', sub: 'Finish & QC', dark: true },
              ].map((panel, i) => (
                <div
                  key={panel.label}
                  className={`aspect-square flex flex-col justify-between p-5 ${i === 1 ? 'mt-8' : i === 2 ? '-mt-4' : ''}`}
                  style={{
                    background: panel.dark ? 'var(--surface-inverse)' : 'var(--paper-elevated)',
                    border: '1px solid var(--rule)',
                  }}
                >
                  <div
                    style={{
                      ...MONO,
                      color: panel.dark ? 'rgba(240,235,222,0.35)' : 'var(--ink-subtle)',
                    }}
                  >
                    {panel.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: panel.dark ? 'var(--paper)' : 'var(--ink)',
                      lineHeight: 1.3,
                    }}
                  >
                    {panel.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § CTA — Always-dark closing section
      ══════════════════════════════════════════════════════════════════ */}
      <section className="section-inverse">
        <div
          className="mx-auto max-w-content px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <SectionLabel style={{ color: 'rgba(240,235,222,0.4)' }}>
            Commission a sign
          </SectionLabel>
        </div>

        <div className="mx-auto max-w-content px-6 py-16 md:py-24">
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 7vw, 6.5rem)',
              lineHeight: 0.86,
              letterSpacing: '-0.025em',
              color: 'var(--paper)',
              marginBottom: '1.5rem',
            }}
          >
            Your sign is<br />
            <span style={{ fontStyle: 'italic', color: 'rgba(240,235,222,0.55)' }}>
              one call away.
            </span>
          </h2>
          <p
            style={{
              color: 'rgba(240,235,222,0.45)',
              lineHeight: 1.6,
              maxWidth: '48ch',
              marginBottom: '2.5rem',
              fontSize: '1rem',
            }}
          >
            35 years of craft, one simple conversation. Tell us what you need — we handle the rest.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all hover:-translate-y-px active:scale-[0.98]"
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
            >
              Chat on WhatsApp →
            </a>
            <Link
              href="/contact"
              className="transition-colors"
              style={{
                padding: '13px 18px',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(240,235,222,0.6)',
                ...MONO,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textDecoration: 'none',
                borderRadius: '1px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Send a message
            </Link>
          </div>

          <p
            style={{
              ...MONO,
              fontSize: '10px',
              color: 'rgba(240,235,222,0.25)',
              marginTop: '2rem',
            }}
          >
            Same-day site visits in Siliguri · One-year LED warranty · Free quotes
          </p>
        </div>
      </section>
    </>
  )
}
