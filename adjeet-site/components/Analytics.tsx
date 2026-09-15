'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { GA_ID } from '@/lib/analytics'

type Choice = 'accepted' | 'declined' | null

/**
 * GA4 with Google Consent Mode v2.
 *
 * - No choice yet (banner ignored): the tag loads with analytics_storage
 *   denied. Google receives cookieless pings with no client ID, which GA4 can
 *   use for modelled reporting. No analytics cookies are set.
 * - Accepted: analytics_storage is granted and normal cookie-based
 *   measurement runs.
 * - Declined: the tag is never loaded, and if it already loaded this visit it
 *   is switched off with Google's documented ga-disable flag.
 *
 * Ad storage and ad personalisation stay denied in every case; the site does
 * not run ads.
 */
export function Analytics() {
  const [choice, setChoice] = useState<Choice>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    function read(): Choice {
      const value = localStorage.getItem('adjeet-consent')
      return value === 'accepted' || value === 'declined' ? value : null
    }
    function onChange() {
      const next = read()
      setChoice(next)
      const w = window as unknown as { gtag?: (...args: unknown[]) => void } & Record<string, unknown>
      if (next === 'accepted') w.gtag?.('consent', 'update', { analytics_storage: 'granted' })
      if (next === 'declined') w[`ga-disable-${GA_ID}`] = true
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(read())
    setReady(true)
    window.addEventListener('adjeet:consent', onChange)
    return () => window.removeEventListener('adjeet:consent', onChange)
  }, [])

  // Wait for the stored choice so a returning visitor who declined never loads the tag.
  if (!GA_ID || !ready || choice === 'declined') return null

  const analyticsStorage = choice === 'accepted' ? 'granted' : 'denied'

  return (
    <>
      <Script id="ga4-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: '${analyticsStorage}',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: true });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
    </>
  )
}
