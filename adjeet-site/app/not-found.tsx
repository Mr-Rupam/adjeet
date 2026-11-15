import type { Metadata } from 'next'
import Link from 'next/link'
import { PageMasthead } from '@/components/street/PageMasthead'
import { DEFAULT_SHARE_IMAGE, siteConfig } from '@/lib/seo'

const TITLE = `Page not found | ${siteConfig.name}`
const DESCRIPTION = "This address has no page on adjeet.in. Find AD JEET's sign board services, project photographs and contact details for Siliguri and North Bengal."

// Its own title and description, instead of inheriting the home page's. No
// canonical and no og:url: a missing page is not the home page. Next marks the
// 404 response noindex itself.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: siteConfig.name,
    type: 'website',
    locale: 'en_IN',
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [DEFAULT_SHARE_IMAGE.url] },
}

export default function NotFound() {
  return (
    <PageMasthead
      title={<>Page not found.</>}
      lead="This address doesn’t lead to a page. Explore our work, browse the services or head back home."
    >
      <div className="flex flex-wrap gap-x-7 gap-y-3">
        <Link href="/" className="field-link">Back to home ↗</Link>
        <Link href="/services" className="field-link">Our services ↗</Link>
        <Link href="/portfolio" className="field-link">See our work ↗</Link>
      </div>
    </PageMasthead>
  )
}
