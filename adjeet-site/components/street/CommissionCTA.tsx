import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

export function CommissionCTA() {
  return (
    <section className="bg-signal text-signal-ink">
      <div className="mx-auto grid max-w-content gap-8 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-end md:px-8 md:py-24">
        <div data-site-reveal="title">
          <p className="spec">Start with a photo</p>
          <h2 className="display mt-4 max-w-[10ch]" style={{ fontSize: 'clamp(3.6rem, 9vw, 8rem)' }}>
            Your name has a place.
          </h2>
        </div>
        <div className="flex flex-col items-start gap-5" data-site-reveal="actions">
          <p className="max-w-[29ch] text-lg leading-relaxed">Show us the site, tell us the town, and we&apos;ll begin the conversation.</p>
          <QuoteCTA source="commission-cta" tone="yellow" label="WhatsApp your project" />
          <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-signal-ink underline underline-offset-4">
            Or send a project brief <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
