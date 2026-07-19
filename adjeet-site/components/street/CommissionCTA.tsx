'use client'

import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'

/**
 * The closer. One loud signal-orange panel — the only full-orange moment
 * on the page — pointing at the single thing this site exists to do.
 */
export function CommissionCTA() {
  const waUrl = defaultWhatsAppUrl()

  return (
    <section className="bg-signal">
      <div className="mx-auto max-w-content px-5 py-20 md:px-8 md:py-28">
        <p className="spec text-ink/70">Commission a sign</p>
        <h2
          className="display mt-4 text-ink"
          style={{ fontSize: 'clamp(3.25rem, 10vw, 9rem)' }}
        >
          Your name
          <br />
          in lights.
        </h2>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick({ source_page: 'commission-cta' })}
            className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-paper shadow-[5px_5px_0_0_rgba(0,0,0,0.35)] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[7px_7px_0_0_rgba(0,0,0,0.35)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_rgba(0,0,0,0.35)]"
          >
            WhatsApp us now →
          </a>
          <Link
            href="/contact"
            className="spec inline-flex items-center gap-2 border-2 border-ink px-6 py-4 text-ink transition-colors hover:bg-ink hover:text-signal"
          >
            Or send the brief
          </Link>
        </div>

        <p className="spec mt-10 text-ink/60">
          Reply within 2 hours · Same-day site visit in Siliguri · Free quote, valid 15 days
        </p>
      </div>
    </section>
  )
}
