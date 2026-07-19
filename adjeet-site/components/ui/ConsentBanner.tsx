'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'adjeet-consent'

export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
  }, [])

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
          className="spec border-2 border-ink/30 px-4 py-2.5 text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          Decline
        </button>
        <button
          onClick={() => respond('accepted')}
          className="spec border-2 border-ink bg-signal px-4 py-2.5 font-semibold text-ink shadow-[3px_3px_0_0_var(--ink)] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--ink)]"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
