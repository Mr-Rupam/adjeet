const COVERAGE = [
  {
    city: 'Siliguri',
    description: "Our base. North Bengal's commercial capital — busiest signage market in the region.",
    slug: 'siliguri',
  },
  {
    city: 'Jalpaiguri',
    description: 'Dooars gateway. Tea gardens, highway corridors, and growing retail districts.',
    slug: 'jalpaiguri',
  },
  {
    city: 'Cooch Behar',
    description: 'Royal city. Dense urban commercial zones and national highway frontage.',
    slug: 'cooch-behar',
  },
  {
    city: 'Darjeeling',
    description: 'Hill country. Altitude-rated fixings for monsoon and frost-cycle conditions.',
    slug: 'darjeeling',
  },
  {
    city: 'Malda',
    description: 'South Bengal reach. FMCG wall campaigns and rural market hoarding runs.',
    slug: 'malda',
  },
]

export function WhereWeWork() {
  return (
    <section style={{ borderBottom: '1px solid var(--rule)' }}>
      {/* Section label bar */}
      <div
        className="mx-auto max-w-content px-6 py-4"
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
          № 05 — Where We Work
        </span>
      </div>

      {/* Coverage rows */}
      <div className="mx-auto max-w-content">
        {COVERAGE.map((item, i) => (
          <div
            key={item.city}
            className="group px-6 py-6 md:py-7 flex flex-col sm:flex-row sm:items-baseline sm:gap-8"
            style={{ borderBottom: i < COVERAGE.length - 1 ? '1px solid var(--rule)' : 'none' }}
          >
            {/* City name */}
            <div className="sm:w-48 flex-shrink-0 mb-2 sm:mb-0 flex items-baseline gap-3">
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: 'var(--ink-subtle)',
                  textTransform: 'uppercase',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className="text-ink"
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 'clamp(1.0625rem, 2.2vw, 1.3125rem)',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {item.city}
              </span>
            </div>

            {/* Description */}
            <p
              className="text-ink-muted flex-1"
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                maxWidth: '50ch',
              }}
            >
              {item.description}
            </p>

          </div>
        ))}
      </div>
    </section>
  )
}
