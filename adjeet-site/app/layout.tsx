import type { Metadata } from 'next'
import { barlowCondensed, hindSiliguri } from '@/app/fonts'
import { ThemeScript } from '@/components/ThemeScript'
import { SkipLink } from '@/components/SkipLink'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { WhatsAppFAB } from '@/components/WhatsAppFAB'
import { Chatbot } from '@/components/Chatbot'
import { ConsentBanner } from '@/components/ui/ConsentBanner'
import { Analytics } from '@/components/Analytics'
import { ReducedMotionWrapper } from '@/components/motion/ReducedMotionWrapper'
import { SiteMotion } from '@/components/motion/SiteMotion'
import { buildLocalBusinessJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import './globals.css'
import '@/design/fieldwork.css'

const siteDescription = siteConfig.description

export const metadata: Metadata = {
  metadataBase: new URL('https://adjeet.in'),
  title: {
    default: 'Signage & Outdoor Advertising in Siliguri | AD JEET',
    template: '%s | AD JEET',
  },
  description: siteDescription,
  verification: {
    google: '_uBPSx4pM-PlgTFlrNQ2C6hzGj90A9JUeW4XH7nJc5g',
  },
  openGraph: {
    title: 'Signage & Outdoor Advertising in Siliguri | AD JEET',
    description: siteDescription,
    url: 'https://adjeet.in',
    siteName: 'AD JEET',
    images: [{ url: siteConfig.ogImage, alt: 'Ambuja Cement ACP and LED signage by AD JEET' }],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signage & Outdoor Advertising in Siliguri | AD JEET',
    description: siteDescription,
    images: [siteConfig.ogImage],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${hindSiliguri.variable}`}
    >
      <head>
        <ThemeScript />
        {/* One authoritative LocalBusiness for the whole site. It lives in the
            ROOT layout, not the (marketing) one, so the programmatic city pages
            are covered too. They previously received only a stale inline copy
            with no telephone, while (marketing) pages got a second, conflicting
            one. A shared entity ID keeps the provider consistent across all pages. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(buildLocalBusinessJsonLd()) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-paper text-ink">
        <ReducedMotionWrapper>
          <SkipLink />
          <Nav />
          <main id="main-content" className="flex-1 pt-20 md:pt-[88px]">
            {children}
          </main>
          <SiteMotion />
          <Footer />
          <Chatbot />
          <WhatsAppFAB />
          <ConsentBanner />
          <Analytics />
        </ReducedMotionWrapper>
      </body>
    </html>
  )
}
