import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PortfolioContent } from './PortfolioContent'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Installation photos from AD-JEET across North Bengal — Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, and Malda.',
}

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <section className="flex items-end min-h-[40vh] bg-surface-inverse py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
            Our Work
          </p>
          <h1 className="text-[var(--text-display-2)] font-[var(--font-fraunces)] font-bold text-white mb-4">
            Portfolio
          </h1>
          <p className="text-white/70 max-w-xl">
            Installation photos from across North Bengal — Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, and Malda.
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="py-24 text-center text-ink-muted text-sm">Loading…</div>}>
        <PortfolioContent />
      </Suspense>
    </>
  )
}
