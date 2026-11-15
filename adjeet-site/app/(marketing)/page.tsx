import { HomePageView } from '@/components/home/HomePageView'
import { buildPageMetadata, buildFaqJsonLd, buildWebPageJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { homeFaqs } from '@/content/home-faqs'

const PAGE = {
  title: 'Sign Board Makers & Outdoor Advertising in Siliguri',
  description: siteConfig.description,
  path: '/',
}

export const metadata = buildPageMetadata(PAGE)

// The WebSite node Google reads the site name from is in the root layout,
// which emits it once on every page, this one included.
export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(buildWebPageJsonLd({ ...PAGE, image: siteConfig.ogImage })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(buildFaqJsonLd(homeFaqs)) }} />
      <HomePageView />
    </>
  )
}
