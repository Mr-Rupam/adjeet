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
      className="fixed bottom-0 inset-x-0 z-50 p-6 bg-paper-elevated border-t border-rule shadow-lg md:flex md:items-center md:justify-between md:gap-8"
    >
      <p className="text-sm text-ink-muted mb-4 md:mb-0 max-w-prose">
        We use analytics cookies (Google Analytics 4) to understand how visitors use our site.
        No personal data is shared with third parties.{' '}
        <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>
      </p>
      <div className="flex gap-3 shrink-0">
        <button
          onClick={() => respond('declined')}
          className="px-4 py-2 text-sm border border-rule rounded hover:bg-paper transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => respond('accepted')}
          className="px-4 py-2 text-sm bg-blue text-white rounded hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
