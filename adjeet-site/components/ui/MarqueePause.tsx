'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'adjeet-marquees'

/**
 * The WCAG 2.2.2 "Pause, Stop, Hide" mechanism for the site's marquees.
 *
 * Five marquees (the hero services ticker, both ClientStreet rows, and the
 * mobile NightWork gallery) start on their own, run indefinitely, and sit
 * alongside other content. That combination requires a way to stop them.
 *
 * One control stops all of them: it sets data-marquees on the root element and
 * app/globals.css halts every `.animate-marquee` from there. The choice is
 * remembered, because someone who needs motion stopped needs it stopped on
 * every page, not once per visit.
 */
export function MarqueePause() {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(STORAGE_KEY) === 'paused') setPaused(true)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.marquees = paused ? 'paused' : 'running'
  }, [paused])

  function toggle() {
    const next = !paused
    setPaused(next)
    localStorage.setItem(STORAGE_KEY, next ? 'paused' : 'running')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={paused}
      className="spec inline-flex min-h-11 items-center gap-2 border-2 border-night-rule px-3 text-night-ink-muted transition-colors hover:border-signal-hot hover:text-signal-hot"
    >
      <span aria-hidden="true" className="text-[9px] leading-none">
        {paused ? '▶' : '‖'}
      </span>
      {paused ? 'Resume moving text' : 'Pause moving text'}
    </button>
  )
}
