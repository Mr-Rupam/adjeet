import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'

const waUrl = defaultWhatsAppUrl({})

export function CommissionSign() {
  return (
    <section className="section-inverse">
      {/* Section label bar */}
      <div
        className="mx-auto max-w-content px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
          }}
        >
          № 06 — Commission a Sign
        </span>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-content px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-end">

        {/* Headline */}
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '1.5rem',
            }}
          >
            Have a project
            <br />
            <span style={{ color: 'var(--ochre)' }}>in mind?</span>
            <br />
            Let's build it.
          </h2>

          <p
            style={{
              fontSize: '0.9375rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.55)',
              maxWidth: '36ch',
            }}
          >
            From a single shopfront sign to a full-district campaign — we survey,
            fabricate, and install across North Bengal. Same-day quotes on WhatsApp.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-4 md:items-end">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--surface-inverse)',
              fontFamily: 'var(--font-fraunces)',
              fontSize: '1rem',
              padding: '0.875rem 2rem',
              letterSpacing: '-0.01em',
            }}
          >
            Chat on WhatsApp
            <span aria-hidden="true">↗</span>
          </a>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded transition-all hover:opacity-90"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.875rem',
              padding: '0.875rem 2rem',
            }}
          >
            Request a callback →
          </Link>

          {/* Coverage footnote */}
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
              marginTop: '0.5rem',
              textAlign: 'right',
            }}
          >
            Siliguri · Jalpaiguri · Cooch Behar · Darjeeling · Malda
          </p>
        </div>
      </div>
    </section>
  )
}
