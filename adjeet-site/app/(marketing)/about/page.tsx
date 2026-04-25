import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeIn } from '@/components/motion/FadeIn'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { buildBreadcrumbJsonLd, siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'About AD-JEET — North Bengal Signage Since 1990',
  description: 'AD-JEET has been fabricating and installing signage across North Bengal since 1990. Learn our story, our team, and the districts we serve.',
  alternates: { canonical: `${siteConfig.url}/about` },
}

const MILESTONES = [
  { year: '1990', label: 'Founded in Siliguri by Jeet Kumar Sarkar' },
  { year: '1998', label: 'Expanded to flex printing and vehicle branding' },
  { year: '2005', label: 'Opened Patiram Jote fabrication workshop' },
  { year: '2012', label: 'Adopted LED illumination across all sign types' },
  { year: '2018', label: 'Reached 12 districts across North Bengal' },
  { year: '2024', label: '500+ installations, second-generation leadership' },
]

const DISTRICTS = [
  'Siliguri', 'Jalpaiguri', 'Cooch Behar', 'Darjeeling', 'Malda',
  'Alipurduar', 'Kalimpong', 'North Dinajpur', 'South Dinajpur',
  'Murshidabad', 'Birbhum', 'Siliguri Corridor', 'Kurseong', 'Mirik', 'Dooars',
]

const waUrl = defaultWhatsAppUrl()
const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
])

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero */}
      <section className="flex items-end min-h-[50vh] bg-ink py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
            Est. 1990 · North Bengal
          </p>
          <h1 className="text-[var(--text-display-2)] font-[var(--font-fraunces)] font-bold text-white mb-4 leading-tight">
            Three decades of signs<br />that stand the test of time
          </h1>
          <p className="text-white/70 max-w-xl text-lg">
            AD-JEET started as a small fabrication workshop in Siliguri. Today we are North Bengal&apos;s most trusted name in signage and outdoor advertising.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-[var(--section-py)] border-b border-rule">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-2xl">
            <FadeIn>
              <h2 className="text-2xl font-bold font-[var(--font-fraunces)] text-ink mb-8">Our Story</h2>
            </FadeIn>
            <FadeIn>
              <div className="prose prose-sm text-ink-muted space-y-5 leading-relaxed">
                <p>
                  AD-JEET was founded in 1990 by Jeet Kumar Sarkar in Siliguri, West Bengal. Starting with hand-painted boards and basic neon installations, the company grew alongside North Bengal&apos;s commercial expansion — from the early malls on Sevoke Road to the industrial zones near Bagdogra and the tea estates of Darjeeling.
                </p>
                <p>
                  Over three and a half decades, we have installed signage for pharmacies, hospitals, clothing showrooms, telecom outlets, restaurants, logistics companies, and government departments. Our clients range from solo proprietors opening their first shop to regional chains expanding across five districts.
                </p>
                <p>
                  In 2005 we opened our dedicated fabrication workshop at Patiram Jote, outside Siliguri, giving us full control over quality at every stage — from metal cutting and acrylic routing to LED wiring and final paint finish. Every sign that leaves our workshop is inspected before installation.
                </p>
                <p>
                  We adopted LED illumination in 2012 and have not looked back. Modern SMD LEDs consume 60–70% less power than the fluorescent tubes they replaced, last 30,000–50,000 hours, and produce consistently brighter, more even light. Combined with weatherproofed enclosures designed for North Bengal&apos;s monsoon conditions, our signs routinely outlast their five-year maintenance agreements.
                </p>
                <p>
                  Today, AD-JEET is run by the second generation of the Sarkar family, with the same commitment to craftsmanship that built our reputation. We do not outsource fabrication or installation. Every project — from a small shop fascia in Jalpaiguri to a full building wrap in Cooch Behar — is handled by our own team.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-[var(--section-py)] bg-paper-elevated border-b border-rule">
        <div className="mx-auto max-w-content px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold font-[var(--font-fraunces)] text-ink mb-12">Milestones</h2>
          </FadeIn>
          <ol className="relative border-l border-rule space-y-10 ml-4">
            {MILESTONES.map(m => (
              <li key={m.year} className="pl-8 relative">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue border-2 border-paper-elevated" />
                <p className="text-xs font-semibold text-blue uppercase tracking-widest mb-1">{m.year}</p>
                <p className="text-sm text-ink">{m.label}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Districts */}
      <section className="py-[var(--section-py)] border-b border-rule">
        <div className="mx-auto max-w-content px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold font-[var(--font-fraunces)] text-ink mb-4">Districts We Serve</h2>
            <p className="text-ink-muted mb-10 max-w-xl">
              We operate across 15+ districts and sub-divisions of North Bengal and the surrounding region.
            </p>
          </FadeIn>
          <div className="flex flex-wrap gap-3">
            {DISTRICTS.map(d => (
              <span key={d} className="px-4 py-2 rounded-full border border-rule text-sm text-ink-muted">
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 bg-blue">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-white text-2xl font-bold mb-3">Have a project in mind?</h2>
          <p className="text-white/80 mb-8">Reach us on WhatsApp — we respond within 2 hours on business days.</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded bg-white text-blue font-semibold px-8 py-3.5 hover:bg-white/90 transition-colors"
          >
            Chat on WhatsApp
          </a>
          <p className="mt-6 text-white/60 text-sm">
            Or <Link href="/contact" className="underline hover:text-white/80">send us a message</Link> and we&apos;ll call you back.
          </p>
        </div>
      </section>
    </>
  )
}
