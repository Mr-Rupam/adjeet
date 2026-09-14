import { HomePageView } from '@/components/home/HomePageView'
import { buildPageMetadata, buildFaqJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { homeFaqs } from '@/content/home-faqs'

export const metadata = buildPageMetadata({
  title: 'Signage & Outdoor Advertising in Siliguri',
  description: siteConfig.description,
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(buildFaqJsonLd(homeFaqs)) }} />
      <HomePageView />
    </>
  )
}
