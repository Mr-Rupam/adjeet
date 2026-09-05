import type React from 'react'

/**
 * The LocalBusiness JSON-LD used to be emitted here as well as inline in the
 * root layout, so every marketing page shipped two conflicting LocalBusiness
 * entities while the programmatic city pages shipped only the stale one. It is
 * now emitted once, in the root layout, which covers every route.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
