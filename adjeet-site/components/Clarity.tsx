'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { CLARITY_ID } from '@/lib/analytics'

type Choice = 'accepted' | 'declined' | null
type ClarityFn = (...args: unknown[]) => void

/**
 * Microsoft Clarity (session replays and heatmaps), following the same three
 * consent states as components/Analytics.tsx.
 *
 * - No choice yet: the tag loads with consent denied. Clarity then assigns a
 *   new ID to every page view and sets no cookies.
 * - Accepted: analytics storage is granted (consentv2); advertising storage
 *   stays denied. Clarity may now use its cookies to join pages into sessions.
 * - Declined: the tag is never loaded. If it already loaded this visit it is
 *   told consent is denied and to erase its cookies and end the session
 *   (`consent` false, the call Microsoft documents for erasing cookies).
 *
 * Typed text is masked by Clarity by default, and the lead form and chat
 * panel also carry data-clarity-mask. Clarity must not be pointed at under-18
 * audiences; this site sells to businesses.
 */
export function Clarity() {
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
      const clarity = (window as unknown as { clarity?: ClarityFn }).clarity
      if (typeof clarity !== 'function') return
      if (next === 'accepted') clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' })
      if (next === 'declined') {
        clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' })
        clarity('consent', false)
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(read())
    setReady(true)
    window.addEventListener('adjeet:consent', onChange)
    return () => window.removeEventListener('adjeet:consent', onChange)
  }, [])

  // Wait for the stored choice so a returning visitor who declined never loads the tag.
  if (!CLARITY_ID || !ready || choice === 'declined') return null

  const analyticsStorage = choice === 'accepted' ? 'granted' : 'denied'

  return (
    <>
      {/* Microsoft's queue stub, then the consent call, so both are waiting when the tag arrives. */}
      <Script id="clarity-queue" strategy="afterInteractive">
        {`
          window.clarity = window.clarity || function(){(window.clarity.q = window.clarity.q || []).push(arguments)};
          window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: '${analyticsStorage}' });
        `}
      </Script>
      {/* Idle-time load, so the tag never competes with first paint. */}
      <Script src={`https://www.clarity.ms/tag/${CLARITY_ID}`} strategy="lazyOnload" />
    </>
  )
}
