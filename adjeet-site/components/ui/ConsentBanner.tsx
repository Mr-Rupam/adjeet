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
  const [expanded, setExpanded] = useState(false)
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
    // "More" and keyboard focus on the policy link change the height too.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    if (ref.current) observer?.observe(ref.current)
    return () => {
      window.removeEventListener('resize', measure)
      observer?.disconnect()
      root.style.removeProperty('--consent-h')
    }
  }, [visible])

  function respond(value: 'accepted' | 'declined') {
    localStorage.setItem(CONSENT_KEY, value)
    setVisible(false)
    // Analytics listens for both answers: accept turns on cookies, decline switches GA4 off.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adjeet:consent', { detail: value }))
    }
  }

  if (!visible) return null

  // Phones: the message is held to two lines with "More" to read the rest, and
  // both buttons share one row, so the banner stays short of the hero's
  // WhatsApp action. From 768px the whole message shows beside the buttons.
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Cookie and analytics consent"
      aria-live="polite"
      className="consent-banner"
      data-expanded={expanded ? 'true' : undefined}
    >
      <p id="consent-message" className="consent-banner__text">
        We use Google Analytics to understand how visitors use our site. Until you choose, it runs
        without cookies or identifiers. Accept to allow analytics cookies, or decline to switch analytics off.{' '}
        {/* No prefetch: the banner shows on every first visit, and few readers follow this link. */}
        <Link href="/privacy" prefetch={false} className="underline hover:text-ink">Privacy Policy</Link>
      </p>
      <div className="consent-banner__actions">
        <button
          type="button"
          className="consent-banner__more"
          aria-expanded={expanded}
          aria-controls="consent-message"
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? 'Less' : 'More'}
        </button>
        <button
          type="button"
          onClick={() => respond('declined')}
          className="consent-banner__button button-shape"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => respond('accepted')}
          className="consent-banner__button consent-banner__button--accept button-shape"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
