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
import { buildLocalBusinessJsonLd, jsonLdString } from '@/lib/seo'
import './globals.css'
import { FOUNDED_YEAR } from '@/lib/coverage'

const siteDescription = `Signage, print and outdoor branding from Siliguri for businesses across North Bengal since ${FOUNDED_YEAR}.`

export const metadata: Metadata = {
  metadataBase: new URL('https://adjeet.in'),
  title: {
    default: 'AD JEET: North Bengal Signage & OOH',
    template: '%s | AD JEET',
  },
  description: siteDescription,
  verification: {
    google: '_uBPSx4pM-PlgTFlrNQ2C6hzGj90A9JUeW4XH7nJc5g',
  },
  icons: {
    icon: [{ url: '/brand/favicon.png?v=aj-1990', type: 'image/png', sizes: '256x256' }],
    shortcut: '/brand/favicon.png?v=aj-1990',
  },
  openGraph: {
    title: 'AD JEET: North Bengal Signage & OOH',
    description: siteDescription,
    url: 'https://adjeet.in',
    siteName: 'AD JEET',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AD JEET fabrication workshop, Siliguri, North Bengal signage since 1990' }],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AD JEET: North Bengal Signage & OOH',
    description: siteDescription,
    images: ['/og-image.jpg'],
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
            one. Two LocalBusiness entities on a page is a schema error. */}
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
