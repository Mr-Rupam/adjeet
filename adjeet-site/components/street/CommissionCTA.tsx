'use client'

import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'

/**
 * The closer. One loud signal-blue panel, the only full-accent moment on
 * the page, pointing at the single thing this site exists to do.
 *
 * Everything here sits ON --signal, so foregrounds use --signal-ink, never
 * --ink: both --signal and --ink flip light in dark theme, so text-ink on
 * this panel collapsed to 2.33:1. Solid, not alpha. Hierarchy comes from
 * the type scale, which is already enormous.
 */
export function CommissionCTA() {
  const waUrl = defaultWhatsAppUrl()

  return (
    <section className="bg-signal">
      <div className="mx-auto max-w-content px-5 py-20 md:px-8 md:py-28">
        <h2
          className="display mt-4 text-signal-ink"
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
            className="spec inline-flex items-center gap-2 border-2 border-ink px-6 py-4 text-signal-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Or send the brief
          </Link>
        </div>

        <p className="spec mt-10 text-signal-ink">
          Reply within 2 hours · Same-day site visit in Siliguri · Free quote, valid 15 days
        </p>
      </div>
    </section>
  )
}
