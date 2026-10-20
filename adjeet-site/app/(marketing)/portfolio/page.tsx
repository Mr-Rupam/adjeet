import { buildPageMetadata } from '@/lib/seo'
import { connection } from 'next/server'
import { photos, getFeaturedPhotos } from '@/content/gallery'
import { PortfolioContent } from './PortfolioContent'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd, jsonLdString } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { CommissionCTA } from '@/components/street/CommissionCTA'

const PAGE = {
  title: "Signage & Vehicle Branding Portfolio",
  // The count is read from the gallery, and every brand named here has photos in it.
  description: `${photos.length} AD JEET project photographs: glow signs, ACP facades, wall paintings, vehicle wraps and puja gates for Airtel, Havells, Supreme Pipe, Star Cement and more.`,
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
        lead="Shopfronts, walls, vehicles and puja gates, photographed on site. Open any photo to ask us about a sign like it on WhatsApp."
      />

      <PortfolioContent />

      <CommissionCTA />
    </>
  )
}
