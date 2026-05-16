import { Suspense } from 'react'
import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { PortfolioContent } from './PortfolioContent'
import { services } from '@/content/services'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = {
  title: 'Portfolio — 500+ Installations Across North Bengal',
  description:
    'See our work: glow sign boards, ACP signage, flex printing, vehicle branding, and F-pole installations across Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, and Malda.',
  alternates: { canonical: `${siteConfig.url}/portfolio` },
}

const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Portfolio', url: '/portfolio' },
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

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Survey',
    body: 'We visit your site, measure the substrate, and assess power, visibility, and municipal requirements. Same-day in Siliguri.',
  },
  {
    n: '02',
    title: 'Design',
    body: 'Our team creates a compliant design mockup matching your brand guidelines and location constraints. Revisions until you\'re happy.',
  },
  {
    n: '03',
    title: 'Fabricate',
    body: 'Metal cutting, acrylic routing, LED wiring, and paint — every step at our Patiram Jote workshop. No subcontracting.',
  },
  {
    n: '04',
    title: 'Install',
    body: 'Our crew installs on-site with proper scaffolding, wiring, and weatherproofing. One-year warranty on all LED and workmanship.',
  },
]

export default function PortfolioPage() {
  const waUrl = defaultWhatsAppUrl()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          § MASTHEAD — Editorial printed-sheet opener
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
            minHeight: 'calc(80svh - 120px)',
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
                Portfolio / {new Date().getFullYear()}
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
              <div>500+ INSTALLS</div>
              <div>12 DISTRICTS</div>
              <div>35 YRS CRAFT</div>
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
                fontSize: 'clamp(3.5rem, 12vw, 10rem)',
                lineHeight: 0.82,
                letterSpacing: '-0.03em',
              }}
            >
              Our
            </h1>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: 'clamp(3.5rem, 12vw, 10rem)',
                lineHeight: 0.82,
                letterSpacing: '-0.03em',
                color: 'var(--ink-muted)',
              }}
            >
              Craft.
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
              Three decades of signage installations across North Bengal.
              Every sign fabricated in-house. Every installation by our own team.
            </p>
          </div>

          <div style={{ height: '1px', background: 'var(--rule)', margin: '0 0 20px' }} />

          {/* Stats footer */}
          <footer className="flex flex-wrap gap-8 sm:gap-12 items-end justify-between">
            <div className="flex flex-wrap gap-8 sm:gap-12">
              {[
                { val: '500+', label: 'Installations' },
                { val: '35', label: 'Years craft' },
                { val: '12', label: 'Districts' },
                { val: '10', label: 'Service types' },
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
            </div>
            <div
              style={{
                ...MONO,
                fontSize: '10px',
                color: 'var(--ink-subtle)',
                letterSpacing: '0.22em',
              }}
            >
              {services.length} · Service categories
            </div>
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
          § QUICK SERVICE NAV — Horizontal scroller (unchanged — already good)
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="bg-paper"
        style={{ borderBottom: '1px solid var(--rule)' }}
      >
        <div className="mx-auto max-w-content px-6 py-3">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span style={{ ...MONO, color: 'var(--ink-subtle)', flexShrink: 0 }}>Jump to:</span>
            {services.slice(0, 6).map((s, i) => (
              <Link
                key={s.slug}
                href={`/portfolio?service=${s.slug}`}
                className="flex-shrink-0 group flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors"
                style={{ textDecoration: 'none' }}
              >
                <span
                  style={{ ...MONO, color: 'var(--ink-subtle)', fontSize: '9px' }}
                  className="group-hover:text-ink-muted transition-colors"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 500 }}>{s.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § GALLERY — The main event (unchanged — already excellent)
      ══════════════════════════════════════════════════════════════════ */}
      <Suspense
        fallback={
          <div className="py-32 text-center">
            <div
              className="inline-block w-6 h-6 border-2 border-t-ink rounded-full animate-spin"
              style={{ borderColor: 'var(--rule)', borderTopColor: 'var(--ink)' }}
            />
            <p
              className="mt-4 text-ink-muted"
              style={{ ...MONO, fontSize: '10px' }}
            >
              Loading gallery…
            </p>
          </div>
        }
      >
        <PortfolioContent />
      </Suspense>

      {/* ══════════════════════════════════════════════════════════════════
          § PROCESS — From sketch to street (light bg, no dark section)
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid var(--rule)' }}>
        <SectionLabel number="01" label="From sketch to street" />

        <div className="mx-auto max-w-content px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.n}
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
                  {step.n}
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
                  {step.title}
                </h3>
                <p
                  className="text-ink-muted"
                  style={{ fontSize: '0.9rem', lineHeight: 1.65, maxWidth: '38ch' }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § CTA — Always-dark closing
      ══════════════════════════════════════════════════════════════════ */}
      <section className="section-inverse">
        <SectionLabel label="Commission a sign" invert />

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
            Let&apos;s build<br />
            <span style={{ fontStyle: 'italic', color: 'rgba(240,235,222,0.55)' }}>
              your sign.
            </span>
          </h2>
          <p
            style={{
              color: 'rgba(240,235,222,0.45)',
              lineHeight: 1.6,
              maxWidth: '46ch',
              marginBottom: '2.5rem',
              fontSize: '1rem',
            }}
          >
            Share your requirements on WhatsApp — we respond within 2 hours on business days.
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
        </div>
      </section>
    </>
  )
}
