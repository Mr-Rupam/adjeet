'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'adjeet-consent'

/**
 * Cookie consent, pinned to the bottom of the viewport.
 *
 * Two things this has to get right and previously did not:
 *
 * 1. It must not sit on top of the WhatsApp button. Both were `bottom` +
 *    `z-50`, and this banner spans the full width, so on every first visit it
 *    covered the site's primary conversion action. It now publishes its own
 *    height as `--consent-h` on the document element, and WhatsAppFAB offsets
 *    itself by that, so the two stack instead of collide.
 * 2. Accept must not wear the primary CTA's costume. It had the accent fill
 *    and the plate shadow, which made a cookie notice the loudest, most
 *    finished-looking thing on the page at the exact moment a buyer is
 *    deciding whether this firm is worth contacting. Both buttons are now
 *    quiet and equal; the decision is genuinely the visitor's either way.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
  }, [])

  // Publish the banner's height so anything else pinned to the bottom of the
  // viewport can clear it. Re-measured on resize because the copy wraps to two
  // lines on narrow screens.
  useEffect(() => {
    const root = document.documentElement
    if (!visible) {
      root.style.removeProperty('--consent-h')
      return
    }
    const measure = () => {
      const h = ref.current?.offsetHeight ?? 0
      root.style.setProperty('--consent-h', `${h}px`)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      root.style.removeProperty('--consent-h')
    }
  }, [visible])

  function respond(value: 'accepted' | 'declined') {
    localStorage.setItem(CONSENT_KEY, value)
    setVisible(false)
    if (value === 'accepted' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adjeet:consent', { detail: value }))
    }
  }

  if (!visible) return null

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Cookie and analytics consent"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-paper-elevated p-5 md:flex md:items-center md:justify-between md:gap-8"
    >
      <p className="mb-4 max-w-prose text-sm text-ink-muted md:mb-0">
        We use analytics cookies (Google Analytics 4) to understand how visitors use our site.
        No personal data is shared with third parties.{' '}
        <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>
      </p>
      <div className="flex shrink-0 gap-3">
        <button
          onClick={() => respond('declined')}
          className="spec inline-flex min-h-11 items-center border-2 border-ink px-4 text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Decline
        </button>
        <button
          onClick={() => respond('accepted')}
          className="spec inline-flex min-h-11 items-center border-2 border-ink px-4 font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
