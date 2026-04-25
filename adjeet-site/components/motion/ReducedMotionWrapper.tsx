'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ReducedMotionContext = createContext<boolean | null>(null)

export function useReducedMotion() {
  const ctx = useContext(ReducedMotionContext)
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    // Only run standalone subscription when not inside a ReducedMotionWrapper
    if (ctx !== null) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [ctx])

  // If inside a Provider, use context value; otherwise use local state
  return ctx !== null ? ctx : reduced
}

export function ReducedMotionWrapper({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <ReducedMotionContext.Provider value={reduced}>
      {children}
    </ReducedMotionContext.Provider>
  )
}
