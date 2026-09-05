import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PortfolioContent } from './PortfolioContent'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { DISTRICTS_SERVED, YEARS_ACTIVE } from '@/lib/coverage'

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

export default function PortfolioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }}
      />

      <PageMasthead
        eyebrow="Work — the street record"
        title={
          <>
            Signs you have
            <br />
            already <span className="glow-signal text-signal">driven past.</span>
          </>
        }
        lead={`${YEARS_ACTIVE} years of installations across North Bengal. Every sign fabricated in-house at Patiram Jote, every one hung by our own crew.`}
      >
        <dl className="m-0 flex flex-wrap gap-6 md:gap-10">
          {[
            { v: '500+', k: 'Installations' },
            { v: '10', k: 'Trades' },
            { v: String(DISTRICTS_SERVED), k: 'Districts' },
          ].map(s => (
            <div key={s.k} className="flex flex-col border-l-2 border-ink pl-4">
              <dt className="spec order-2 text-ink-subtle">{s.k}</dt>
              <dd className="display order-1 m-0 text-4xl text-ink">{s.v}</dd>
            </div>
          ))}
        </dl>
      </PageMasthead>

      <Suspense
        fallback={
          <div className="border-b-2 border-ink py-32 text-center">
            <span
              className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-rule"
              style={{ borderTopColor: 'var(--signal)' }}
            />
            <p className="spec mt-4 text-ink-subtle">Loading gallery…</p>
          </div>
        }
      >
        <PortfolioContent />
      </Suspense>

      <CommissionCTA />
    </>
  )
}
