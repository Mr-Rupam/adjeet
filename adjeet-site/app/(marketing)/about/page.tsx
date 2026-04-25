import type { Metadata } from 'next'
import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, siteConfig } from '@/lib/seo'

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
  { year: '1998', title: 'Expansion', desc: 'Added flex printing and vehicle branding to our services. Started serving Jalpaiguri and Cooch Behar.' },
  { year: '2005', title: 'The Workshop', desc: 'Opened the dedicated Patiram Jote fabrication facility — full control over every stage of production.' },
  { year: '2012', title: 'LED Revolution', desc: 'Adopted SMD LED technology across all sign types. 60–70% less power consumption, 50,000-hour lifespan.' },
  { year: '2018', title: '12 Districts', desc: 'Our coverage expands to 12 districts across North Bengal, from Darjeeling hills to Malda plains.' },
  { year: '2024', title: 'New Generation', desc: '500+ installations complete. Second-generation Sarkar family leadership carries the craft forward.' },
]

const VALUES = [
  {
    number: '01',
    title: 'In-House Everything',
    desc: 'We never outsource fabrication or installation. Every cut, every weld, every wire — done by our own team at Patiram Jote.',
    icon: '🔧',
  },
  {
    number: '02',
    title: 'Built for Monsoon',
    desc: 'North Bengal gets 3,000mm of rain annually. Our signs use sealed enclosures, stainless fixings, and IP65-rated LED drivers.',
    icon: '🌧️',
  },
  {
    number: '03',
    title: 'One-Year Warranty',
    desc: 'Every installation comes with a full one-year warranty on LED components. Problems? We fix them, no questions asked.',
    icon: '🛡️',
  },
  {
    number: '04',
    title: 'Same-Day Site Visits',
    desc: 'In Siliguri, we do same-day site surveys. For district projects, we coordinate with our weekly transport runs.',
    icon: '🚐',
  },
]

const STATS = [
  { value: '1990', label: 'Year founded' },
  { value: '500+', label: 'Signs installed' },
  { value: '12', label: 'Districts served' },
  { value: '35', label: 'Years of craft' },
  { value: '2', label: 'Generations' },
  { value: '1', label: 'Year warranty' },
]

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* ═══════════════════ HERO — Cinematic opening ═══════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden section-inverse">
        {/* Multi-layer background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#080807] via-[#1A1916] to-[#0a0f14]" />
          {/* Diagonal lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                var(--adjeet-blue),
                var(--adjeet-blue) 1px,
                transparent 1px,
                transparent 80px
              )`,
            }}
          />
          {/* Radial warmth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_20%,rgba(201,150,46,0.06),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_10%_90%,rgba(30,127,184,0.08),transparent)]" />
        </div>

        {/* Giant ghost year */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[5%] select-none pointer-events-none">
          <span
            className="block font-[var(--font-fraunces)] font-black text-transparent leading-none"
            style={{
              fontSize: 'clamp(12rem, 30vw, 35rem)',
              WebkitTextStroke: '1px rgba(201,150,46,0.06)',
            }}
          >
            1990
          </span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-content px-6">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-20 h-[1px] bg-ochre/60" />
            <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-ochre/60">
              Est. 1990 · Siliguri, West Bengal
            </span>
          </div>

          {/* Headline — stacked, oversized */}
          <h1 className="mb-8">
            <span
              className="block font-[var(--font-fraunces)] font-black text-white leading-[0.82] tracking-tight"
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
            >
              We don&apos;t just
            </span>
            <span
              className="block font-[var(--font-fraunces)] font-black text-white leading-[0.82] tracking-tight"
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
            >
              make signs.
            </span>
            <span
              className="block font-[var(--font-fraunces)] font-black leading-[0.82] tracking-tight mt-2"
              style={{
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                background: 'linear-gradient(135deg, var(--ochre), #E8C06A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              We build legacies.
            </span>
          </h1>

          <p className="text-white/40 text-lg max-w-lg leading-relaxed mb-12">
            From a one-man workshop in 1990 to North Bengal&apos;s most trusted signage company
            — this is our story.
          </p>

          {/* Mini stats row */}
          <div className="flex flex-wrap gap-8 sm:gap-12">
            {[
              { val: '35+', label: 'Years' },
              { val: '500+', label: 'Signs' },
              { val: '12', label: 'Districts' },
            ].map(s => (
              <div key={s.label}>
                <span className="block font-[var(--font-fraunces)] text-3xl font-black text-white leading-none">
                  {s.val}
                </span>
                <span className="block text-[10px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-white/25 mt-1">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent to-white/20" />
          <span className="text-[9px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-white/20">
            Scroll
          </span>
        </div>

        {/* Angled cut */}
        <div className="absolute bottom-0 left-0 right-0 h-20">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 80h1440V30L960 0 0 30v50z" fill="var(--paper)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ THE STORY — Editorial split ═══════════════════ */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-content px-6">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            {/* Left — sticky label */}
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-[var(--adjeet-blue)]" />
                <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-ink-subtle">
                  Our Story
                </span>
              </div>
              <h2
                className="font-[var(--font-fraunces)] font-black text-ink leading-[0.9] mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
              >
                Built by hand.<br />
                Proven by<br />
                decades.
              </h2>
              <div className="w-16 h-1 bg-ochre/40 rounded-full" />
            </div>

            {/* Right — story text with alternating highlights */}
            <div className="lg:col-span-3 space-y-8">
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
                  text: 'In 2005 we opened our dedicated fabrication workshop at Patiram Jote, outside Siliguri, giving us full control over quality at every stage — from metal cutting and acrylic routing to LED wiring and final paint finish. Every sign that leaves our workshop is inspected before installation.',
                },
                {
                  highlight: '60–70%',
                  highlightLabel: 'less power consumption with LED',
                  text: 'We adopted LED illumination in 2012 and have not looked back. Modern SMD LEDs consume dramatically less power than the fluorescent tubes they replaced, last 30,000–50,000 hours, and produce consistently brighter, more even light. Combined with weatherproofed enclosures designed for North Bengal\'s monsoon conditions, our signs routinely outlast their five-year maintenance agreements.',
                },
                {
                  highlight: null,
                  text: 'Today, AD-JEET is run by the second generation of the Sarkar family, with the same commitment to craftsmanship that built our reputation. We do not outsource fabrication or installation. Every project — from a small shop fascia in Jalpaiguri to a full building wrap in Cooch Behar — is handled by our own team.',
                },
              ].map((block, i) => (
                <div key={i} className="relative">
                  {block.highlight && (
                    <div className="mb-4 flex items-end gap-3">
                      <span className="font-[var(--font-fraunces)] text-4xl font-black text-blue leading-none">
                        {block.highlight}
                      </span>
                      <span className="text-xs text-ink-subtle pb-1">{block.highlightLabel}</span>
                    </div>
                  )}
                  <p className="text-ink-muted leading-relaxed">{block.text}</p>
                  {i < 4 && (
                    <div className="mt-8 w-8 h-[1px] bg-rule" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TIMELINE — Horizontal, dramatic ═══════════════════ */}
      <section className="py-24 section-inverse relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--adjeet-blue) 1px, transparent 1px),
              linear-gradient(90deg, var(--adjeet-blue) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative max-w-content mx-auto px-6 mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-ochre/60" />
            <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-white/40">
              Milestones
            </span>
          </div>
          <h2
            className="font-[var(--font-fraunces)] font-black text-white leading-[0.9]"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          >
            35 years of<br />milestones.
          </h2>
        </div>

        {/* Timeline cards */}
        <div className="relative px-6">
          {/* Horizontal line */}
          <div className="hidden lg:block absolute top-[5.5rem] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="max-w-content mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.year}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500"
                >
                  {/* Year — massive */}
                  <span
                    className="block font-[var(--font-fraunces)] font-black leading-none mb-4"
                    style={{
                      fontSize: '3.5rem',
                      background: `linear-gradient(135deg, ${i % 2 === 0 ? 'var(--adjeet-blue)' : 'var(--ochre)'}, rgba(255,255,255,0.2))`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {m.year}
                  </span>
                  <h3 className="text-white font-bold text-lg mb-2">{m.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{m.desc}</p>

                  {/* Corner dot */}
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-blue/40 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ VALUES — Bold grid ═══════════════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-content px-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[var(--adjeet-blue)]" />
            <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-ink-subtle">
              Why AD-JEET
            </span>
          </div>
          <h2
            className="font-[var(--font-fraunces)] font-black text-ink leading-[0.9] mb-16"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          >
            What sets us<br />apart.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map(v => (
              <div
                key={v.number}
                className="group relative rounded-2xl border border-rule p-8 hover:border-blue/30 transition-all duration-300 overflow-hidden"
              >
                {/* Background number */}
                <span
                  className="absolute -top-4 -right-2 font-[var(--font-fraunces)] font-black text-transparent leading-none select-none pointer-events-none"
                  style={{
                    fontSize: '8rem',
                    WebkitTextStroke: '1px rgba(30,127,184,0.06)',
                  }}
                >
                  {v.number}
                </span>

                <div className="relative">
                  <span className="text-3xl mb-4 block">{v.icon}</span>
                  <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-blue mb-3 block">
                    {v.number}
                  </span>
                  <h3 className="text-xl font-bold text-ink mb-3">{v.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{v.desc}</p>
                </div>

                {/* Hover accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue to-blue/0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS BAND — Full-width numbers ═══════════════════ */}
      <section className="py-16 border-y border-rule bg-paper-elevated">
        <div className="mx-auto max-w-content px-6">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <span className="block font-[var(--font-fraunces)] text-3xl sm:text-4xl font-black text-ink leading-none mb-1">
                  {s.value}
                </span>
                <span className="block text-[10px] font-[var(--font-mono)] uppercase tracking-[0.15em] text-ink-subtle">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WORKSHOP — Visual showcase ═══════════════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-content px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-ochre/60" />
                <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-ink-subtle">
                  The Workshop
                </span>
              </div>
              <h2
                className="font-[var(--font-fraunces)] font-black text-ink leading-[0.9] mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                Where signs<br />come to life.
              </h2>
              <div className="space-y-4 text-ink-muted leading-relaxed">
                <p>
                  Our 4,000 sq ft fabrication facility at Patiram Jote is where every AD-JEET sign is born.
                  Metal cutting, CNC routing, acrylic bending, LED wiring, painting — everything happens under one roof.
                </p>
                <p>
                  The workshop runs six days a week, with a dedicated quality inspection station before
                  any sign is cleared for dispatch. We maintain a fleet of installation vehicles equipped
                  with scaffolding, generators, and wiring tools.
                </p>
              </div>

              {/* Workshop specs */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { val: '4,000', unit: 'sq ft', label: 'Workshop area' },
                  { val: '6', unit: 'days/week', label: 'Operating schedule' },
                  { val: '3', unit: 'vehicles', label: 'Installation fleet' },
                  { val: '15+', unit: 'team', label: 'Skilled workers' },
                ].map(spec => (
                  <div key={spec.label} className="rounded-xl border border-rule p-4">
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className="font-[var(--font-fraunces)] text-2xl font-black text-ink leading-none">
                        {spec.val}
                      </span>
                      <span className="text-xs text-ink-subtle">{spec.unit}</span>
                    </div>
                    <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-wider text-ink-subtle">
                      {spec.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual — abstract workshop representation */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-slate to-slate/60 aspect-[3/4] flex items-end p-6">
                  <div>
                    <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-wider text-white/40 block mb-1">Metal</span>
                    <span className="text-white font-bold text-sm">Cutting & Welding</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-blue to-blue-deep aspect-square flex items-end p-6 mt-8">
                  <div>
                    <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-wider text-white/40 block mb-1">LED</span>
                    <span className="text-white font-bold text-sm">Wiring & Testing</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-ochre to-ochre/60 aspect-square flex items-end p-6 -mt-4">
                  <div>
                    <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-wider text-white/40 block mb-1">Acrylic</span>
                    <span className="text-white font-bold text-sm">Routing & Bending</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-sage to-sage/60 aspect-[3/4] flex items-end p-6 mt-4">
                  <div>
                    <span className="text-[10px] font-[var(--font-mono)] uppercase tracking-wider text-white/40 block mb-1">Paint</span>
                    <span className="text-white font-bold text-sm">Finish & QC</span>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-paper border border-rule shadow-lg">
                <span className="text-xs font-bold text-ink">All in-house ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA — Close the loop ═══════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--adjeet-blue)] via-[var(--adjeet-blue-deep)] to-[#08192a]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-content mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block text-[10px] font-[var(--font-mono)] uppercase tracking-[0.3em] text-white/40 mb-6">
              Ready to start?
            </span>
            <h2
              className="font-[var(--font-fraunces)] font-black text-white leading-[0.9] mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              Your sign is<br />one call away.
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-md mx-auto">
              35 years of craft, one simple conversation. Tell us what you need — we handle the rest.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-white text-[var(--adjeet-blue-deep)] font-bold px-8 py-4 text-sm hover:bg-white/90 transition-colors active:scale-[0.98]"
              >
                Chat on WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 text-white font-medium px-8 py-4 text-sm hover:bg-white/10 transition-colors active:scale-[0.98]"
              >
                Send a message →
              </Link>
            </div>
            <p className="mt-8 text-white/30 text-xs font-[var(--font-mono)]">
              Same-day site visits in Siliguri · One-year LED warranty · Free quotes
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
