import { buildPageMetadata } from '@/lib/seo'
import { connection } from 'next/server'
import { PortfolioContent } from './PortfolioContent'
import { buildBreadcrumbJsonLd, jsonLdString } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { CommissionCTA } from '@/components/street/CommissionCTA'

export const metadata = buildPageMetadata({
  title: "Signage & Vehicle Branding Portfolio",
  description: "See AD JEET project photographs, including ACC Cement signs, Ambuja Cement ACP and LED signage, and SRMB vehicle branding. Explore our North Bengal work.",
  path: "/portfolio",
})

const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Portfolio', url: '/portfolio' },
])

export default async function PortfolioPage() {
  // Resolve URL filters on the server so the actual work ships in HTML.
  // A static Suspense fallback previously hid the gallery from no-JS visitors.
  await connection()
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
            Signage &amp; branding. <br />
            <span className="glow-signal text-signal">Our work in North Bengal.</span>
          </>
        }
        lead="A focused selection of project photographs. Filter by what was made or where the work was recorded."
      />

      <PortfolioContent />

      <CommissionCTA />
    </>
  )
}
