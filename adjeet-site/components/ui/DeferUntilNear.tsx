'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * Renders its children only once a visitor gets close to them: when this spot
 * comes within `margin` of the viewport, or when anything in the surrounding
 * form takes focus, since a keyboard user can tab in from far away.
 *
 * Built for the Turnstile CAPTCHA, which downloads about 1MB and keeps polling
 * Cloudflare for as long as the page stays open. On the 27 regional pages the
 * form sits far below the fold, so most visitors never need it at all. Pass the
 * child's size as `reserve` so the late mount does not shift the layout.
 */
export function DeferUntilNear({ children, reserve, margin = '800px' }: {
  children: ReactNode
  reserve?: CSSProperties
  margin?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (near) return
    const spot = ref.current
    if (!spot) return
    if (typeof IntersectionObserver === 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNear(true)
      return
    }
    const observer = new IntersectionObserver(
      entries => { if (entries.some(entry => entry.isIntersecting)) setNear(true) },
      { rootMargin: `${margin} 0px` },
    )
    observer.observe(spot)
    const form = spot.closest('form')
    const onFocus = () => setNear(true)
    form?.addEventListener('focusin', onFocus)
    return () => {
      observer.disconnect()
      form?.removeEventListener('focusin', onFocus)
    }
  }, [near, margin])

  return <div ref={ref} style={reserve}>{near ? children : null}</div>
}
