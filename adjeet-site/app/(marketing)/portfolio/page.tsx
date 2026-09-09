import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PortfolioContent } from './PortfolioContent'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { CommissionCTA } from '@/components/street/CommissionCTA'

export const metadata: Metadata = {
  title: 'Portfolio: Signage Work Across North Bengal',
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
        meta={['Selected work', 'North Bengal', 'Five documented projects']}
        title={
          <>
            Work made for
            <br />
            the <span className="glow-signal text-signal">real world.</span>
          </>
        }
        lead="A focused selection of project photographs. Filter by what was made or where the work was recorded."
      />

      <Suspense
        fallback={
          <div className="border-b border-rule py-32 text-center">
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
