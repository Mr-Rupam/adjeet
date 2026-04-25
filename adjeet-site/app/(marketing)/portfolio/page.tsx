import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PortfolioContent } from './PortfolioContent'
import { photos } from '@/content/gallery'
import { services } from '@/content/services'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, siteConfig } from '@/lib/seo'

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

const STATS = [
  { number: '500+', label: 'Installations', suffix: 'completed' },
  { number: '35', label: 'Years', suffix: 'of craft' },
  { number: '12', label: 'Districts', suffix: 'covered' },
  { number: '10', label: 'Service', suffix: 'categories' },
]

export default function PortfolioPage() {
  const waUrl = defaultWhatsAppUrl()
  const featuredCount = photos.filter(p => p.featured).length
  const totalCount = photos.length

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* ═══════════════════ HERO — Full-bleed dramatic entry ═══════════════════ */}
      <section className="relative min-h-[85vh] flex flex-col justify-end overflow-hidden section-inverse">
        {/* Layered background effects */}
        <div className="absolute inset-0">
          {/* Base dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a08] via-[#1A1916] to-[#0d1117]" />
          {/* Blueprint-style grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(var(--adjeet-blue) 1px, transparent 1px),
                linear-gradient(90deg, var(--adjeet-blue) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Radial spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_80%,rgba(30,127,184,0.15),transparent)]" />
          {/* Diagonal accent line */}
          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[var(--adjeet-blue)] to-transparent opacity-20 translate-x-[-120px]" />
        </div>

        {/* Oversized background number */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[10%] select-none pointer-events-none">
          <span
            className="block font-[var(--font-fraunces)] font-black text-transparent leading-none"
            style={{
              fontSize: 'clamp(15rem, 35vw, 40rem)',
              WebkitTextStroke: '1px rgba(30,127,184,0.08)',
            }}
          >
            500
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-content px-6 pb-16 pt-32">
          {/* Eyebrow with animated line */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-[1px] bg-[var(--adjeet-blue)]" />
            <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-white/40">
              Portfolio / {new Date().getFullYear()}
            </span>
          </div>

          {/* Main headline — massive, editorial */}
          <h1 className="mb-6">
            <span
              className="block font-[var(--font-fraunces)] font-black text-white leading-[0.85] tracking-tight"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
            >
              Our
            </span>
            <span
              className="block font-[var(--font-fraunces)] font-black leading-[0.85] tracking-tight"
              style={{
                fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                background: 'linear-gradient(135deg, var(--adjeet-blue), #7EC8E3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Craft.
            </span>
          </h1>

          <p className="text-white/50 text-lg max-w-lg mb-12 leading-relaxed">
            Three decades of signage installations across North Bengal.
            Every sign fabricated in-house. Every installation by our own team.
          </p>

          {/* Stats row — industrial counter style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 mb-12">
            {STATS.map((stat, i) => (
              <div key={i} className="group">
                <span className="block font-[var(--font-fraunces)] text-4xl sm:text-5xl font-black text-white leading-none mb-1">
                  {stat.number}
                </span>
                <span className="block text-[10px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-white/30">
                  {stat.label}
                </span>
                <span className="block text-[10px] text-white/20 mt-0.5">{stat.suffix}</span>
              </div>
            ))}
          </div>

          {/* Scroll cue */}
          <div className="flex items-center gap-3 text-white/20">
            <div className="w-[1px] h-8 bg-white/20 animate-pulse" />
            <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em]">
              Scroll to explore
            </span>
          </div>
        </div>

        {/* Bottom edge — torn/angled cut */}
        <div className="absolute bottom-0 left-0 right-0 h-16">
          <svg viewBox="0 0 1440 64" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 64h1440V20L720 0 0 20v44z" fill="var(--paper)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ QUICK SERVICE NAV — Horizontal scroller ═══════════════════ */}
      <section className="py-8 border-b border-rule bg-paper relative z-10">
        <div className="mx-auto max-w-content px-6">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
            <span className="flex-shrink-0 text-[10px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-ink-subtle">
              Jump to:
            </span>
            {services.slice(0, 6).map((s, i) => (
              <Link
                key={s.slug}
                href={`/portfolio?service=${s.slug}`}
                className="flex-shrink-0 group flex items-center gap-2 text-sm text-ink-muted hover:text-blue transition-colors"
              >
                <span className="font-[var(--font-mono)] text-[10px] text-ink-subtle/50 group-hover:text-blue/50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-medium">{s.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ GALLERY — The main event ═══════════════════ */}
      <Suspense
        fallback={
          <div className="py-32 text-center">
            <div className="inline-block w-8 h-8 border-2 border-blue/30 border-t-blue rounded-full animate-spin" />
            <p className="mt-4 text-ink-muted text-sm font-[var(--font-mono)]">Loading gallery…</p>
          </div>
        }
      >
        <PortfolioContent />
      </Suspense>

      {/* ═══════════════════ PROCESS — How we build ═══════════════════ */}
      <section className="py-24 section-inverse relative overflow-hidden">
        {/* Subtle grid bg */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(var(--adjeet-blue) 1px, transparent 1px),
              linear-gradient(90deg, var(--adjeet-blue) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-content mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-[1px] bg-[var(--adjeet-blue)]" />
            <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-white/40">
              Our Process
            </span>
          </div>

          <h2
            className="font-[var(--font-fraunces)] font-black text-white leading-[0.9] mb-16"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          >
            From sketch<br />to street.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Survey', desc: 'We visit your site, measure the substrate, and assess power, visibility, and municipal requirements.' },
              { step: '02', title: 'Design', desc: 'Our team creates a compliant design mockup matching your brand guidelines and location constraints.' },
              { step: '03', title: 'Fabricate', desc: 'Metal cutting, acrylic routing, LED wiring, and paint — every step at our Patiram Jote workshop.' },
              { step: '04', title: 'Install', desc: 'Our crew installs on-site with proper scaffolding, wiring, and weatherproofing. One-year warranty included.' },
            ].map(item => (
              <div key={item.step} className="group relative">
                <span
                  className="block font-[var(--font-fraunces)] font-black text-transparent leading-none mb-4"
                  style={{
                    fontSize: '5rem',
                    WebkitTextStroke: '1px rgba(30,127,184,0.15)',
                  }}
                >
                  {item.step}
                </span>
                <h3 className="text-white font-bold text-lg mb-2 -mt-4">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[var(--adjeet-blue)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA — Bold close ═══════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--adjeet-blue)] via-[var(--adjeet-blue-deep)] to-[#0a2a40]" />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative max-w-content mx-auto px-6 text-center">
          <span className="inline-block text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-white/50 mb-6">
            Ready to start?
          </span>
          <h2
            className="font-[var(--font-fraunces)] font-black text-white leading-[0.9] mb-6"
            style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}
          >
            Let&apos;s build<br />your sign.
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto mb-10">
            Share your requirements on WhatsApp — we respond within 2 hours on business days.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded bg-white text-[var(--adjeet-blue-deep)] font-bold px-8 py-4 text-sm hover:bg-white/90 transition-colors active:scale-[0.98]"
            >
              Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded border border-white/30 text-white font-medium px-8 py-4 text-sm hover:bg-white/10 transition-colors active:scale-[0.98]"
            >
              Send a message
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
