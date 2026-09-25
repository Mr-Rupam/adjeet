import { buildPageMetadata } from '@/lib/seo'
import { connection } from 'next/server'
import { PortfolioContent } from './PortfolioContent'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd, jsonLdString } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { photos, getFeaturedPhotos } from '@/content/gallery'

const PAGE = {
  title: "Signage & Vehicle Branding Portfolio",
  description: "Over 100 AD JEET project photographs: glow signs, ACP facades, wall paintings, vehicle wraps and puja gates for Airtel, Havells, Supreme, Shyam Steel, Star Cement and more.",
  path: "/portfolio",
}

export const metadata = buildPageMetadata(PAGE)

const webPage = buildWebPageJsonLd({ ...PAGE, type: 'CollectionPage', image: getFeaturedPhotos()[0]?.src })

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(webPage) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }}
      />

      <PageMasthead
        meta={['Selected work', photos.length + ' project photographs', 'Made in North Bengal']}
        title={
          <>
            Signage &amp; branding. <br />
            <span className="glow-signal text-signal">Our work in North Bengal.</span>
          </>
        }
        lead="Shopfronts, walls, vehicles and puja gates, photographed on site. Browse the work by trade or see every project together."
      />

      <PortfolioContent />

      <CommissionCTA />
    </>
  )
}
