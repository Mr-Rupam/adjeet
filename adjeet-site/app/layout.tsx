import type { Metadata } from 'next'
import { fraunces, inter, jetbrainsMono } from '@/app/fonts'
import { ThemeScript } from '@/components/ThemeScript'
import { SkipLink } from '@/components/SkipLink'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { WhatsAppFAB } from '@/components/WhatsAppFAB'
import { ConsentBanner } from '@/components/ui/ConsentBanner'
import { Analytics } from '@/components/Analytics'
import { ReducedMotionWrapper } from '@/components/motion/ReducedMotionWrapper'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AD-JEET — North Bengal Signage & OOH',
    template: '%s | AD-JEET',
  },
  description: 'North Bengal\'s most trusted signage and outdoor advertising partner since 1990. Glow signs, ACP/LED, flex printing, vehicle branding across 15+ districts.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'AD-JEET — North Bengal Signage & OOH',
    description: 'North Bengal\'s most trusted signage and outdoor advertising partner since 1990. Glow signs, ACP/LED, flex printing, vehicle branding across 15+ districts.',
    url: 'https://adjeet.in',
    siteName: 'AD-JEET',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AD-JEET fabrication workshop, Siliguri — North Bengal signage since 1990' }],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AD-JEET — North Bengal Signage & OOH',
    description: 'North Bengal\'s most trusted signage and outdoor advertising partner since 1990.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen flex flex-col bg-paper text-ink">
        <ReducedMotionWrapper>
          <SkipLink />
          <Nav />
          <main id="main-content" className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
          <WhatsAppFAB />
          <ConsentBanner />
          <Analytics />
        </ReducedMotionWrapper>
      </body>
    </html>
  )
}
