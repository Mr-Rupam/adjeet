import Link from 'next/link'
import { services } from '@/content/services'

export function ServicesCatalogue() {
  return (
    <section style={{ borderBottom: '1px solid var(--rule)' }}>
      {/* Section label */}
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
          № 02 — The Catalogue
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--ink-subtle)',
          }}
        >
          {services.length} services
        </span>
      </div>

      {/* Catalogue rows */}
      <div className="mx-auto max-w-content">
        {services.map((service, i) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group block px-6 py-10 md:py-12 hover:bg-paper-elevated transition-colors"
            style={{ borderBottom: '1px solid var(--rule)' }}
          >
            <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-start">
              {/* Number */}
              <div
                className="md:col-span-1 flex md:block items-baseline gap-3"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-subtle)',
                  textTransform: 'uppercase',
                  paddingTop: '8px',
                }}
              >
                <span>№ {String(i + 1).padStart(2, '0')}</span>
              </div>

              {/* Service name + tagline */}
              <div className="md:col-span-7">
                <h3
                  className="text-ink group-hover:text-blue transition-colors"
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 'clamp(1.625rem, 4.5vw, 3rem)',
                    fontWeight: 700,
                    lineHeight: 1.04,
                    letterSpacing: '-0.02em',
                    marginBottom: '0.625rem',
                  }}
                >
                  {service.name}
                </h3>
                <p
                  className="text-ink-muted"
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontStyle: 'italic',
                    fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
                    lineHeight: 1.5,
                    maxWidth: '40ch',
                  }}
                >
                  {service.tagline}
                </p>
              </div>

              {/* Specs column */}
              <div className="md:col-span-3 md:pl-4 flex flex-col gap-3">
                <SpecRow label="Materials" value={`${service.materials.length} types`} />
                <SpecRow label="Turnaround" value={service.turnaround.replace(/\s+/g, ' ')} />
                <SpecRow
                  label="Top spec"
                  value={service.materials[0]}
                />
              </div>

              {/* Arrow */}
              <div
                className="md:col-span-1 flex md:justify-end items-start text-ink-subtle group-hover:text-blue group-hover:translate-x-1 transition-all"
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: '1.5rem',
                  paddingTop: '4px',
                }}
                aria-hidden="true"
              >
                ↗
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--rule)',
        paddingTop: '0.5rem',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9.5px',
          letterSpacing: '0.12em',
          color: 'var(--ink-subtle)',
          textTransform: 'uppercase',
          marginBottom: '0.2rem',
        }}
      >
        {label}
      </div>
      <div
        className="text-ink"
        style={{
          fontFamily: 'var(--font-fraunces)',
          fontSize: '0.875rem',
          lineHeight: 1.3,
        }}
      >
        {value}
      </div>
    </div>
  )
}
