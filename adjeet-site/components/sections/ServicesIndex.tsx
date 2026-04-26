import Link from 'next/link'
import { services } from '@/content/services'

export function ServicesIndex() {
  return (
    <section style={{ borderBottom: '1px solid var(--rule)' }}>
      {/* Section label bar */}
      <div
        className="mx-auto max-w-content px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--rule)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            color: 'var(--ink-subtle)',
            textTransform: 'uppercase',
          }}
        >
          № 01 — Services
        </span>
        <Link
          href="/services"
          className="hover:text-blue transition-colors"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--ink-subtle)',
          }}
        >
          View all →
        </Link>
      </div>

      {/* Index rows */}
      <div className="mx-auto max-w-content">
        {services.slice(0, 5).map((service, i) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group flex items-baseline gap-5 px-6 py-5 hover:bg-paper-elevated transition-colors"
            style={{ borderBottom: '1px solid var(--rule)' }}
          >
            {/* Row number */}
            <span
              className="flex-shrink-0"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.06em',
                color: 'var(--ink-subtle)',
                minWidth: '2rem',
                paddingTop: '3px',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* Service name */}
            <span
              className="flex-1 text-ink group-hover:text-blue transition-colors"
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(1.0625rem, 2.4vw, 1.375rem)',
                fontWeight: 600,
                lineHeight: 1.25,
              }}
            >
              {service.name}
            </span>

            {/* Tagline — hidden on mobile */}
            <span
              className="hidden sm:block text-ink-subtle"
              style={{
                fontSize: '0.8125rem',
                lineHeight: 1.45,
                maxWidth: '260px',
                textAlign: 'right',
              }}
            >
              {service.tagline}
            </span>

            {/* Arrow */}
            <span
              className="flex-shrink-0 text-ink-subtle group-hover:text-blue group-hover:translate-x-1 transition-all"
              style={{ fontSize: '0.9rem' }}
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
