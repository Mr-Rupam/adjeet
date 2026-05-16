import { SectionLabel } from '@/components/ui/SectionLabel'

const STANDARDS = [
  {
    n: '01',
    title: 'In-house workshop',
    body: 'Every sign is fabricated, printed, and installed by our own team — no subcontracting, full accountability from brief to final fixing.',
  },
  {
    n: '02',
    title: 'Monsoon-proven builds',
    body: "Welded, sealed, and wired for North Bengal's annual deluge. Our hardware specs account for humidity, Nor'westers, and wide temperature swings.",
  },
  {
    n: '03',
    title: 'One-year warranty',
    body: 'All LED components and fabrication workmanship are covered for twelve months — driver replacements, resealing, electrical faults included.',
  },
  {
    n: '04',
    title: 'Same-day site survey',
    body: 'We visit within 24 hours of your inquiry to measure, assess substrate, and quote accurately. No surprises on installation day.',
  },
]

export function TheStandard() {
  return (
    <section style={{ borderBottom: '1px solid var(--rule)' }}>
      {/* Section label bar */}
      <div
        className="mx-auto max-w-content px-6 py-4"
        style={{ borderBottom: '1px solid var(--rule)' }}
      >
        <SectionLabel>№ 02 — Our Standard</SectionLabel>
      </div>

      {/* Principles grid */}
      <div className="mx-auto max-w-content px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0">
          {STANDARDS.map((s, i) => (
            <div
              key={s.n}
              className="py-8"
              style={{
                borderBottom: i < 2 ? '1px solid var(--rule)' : 'none',
              }}
            >
              {/* Big number */}
              <div
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 'clamp(3rem, 7vw, 5rem)',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: 'var(--rule)',
                  marginBottom: '1rem',
                  userSelect: 'none',
                }}
                aria-hidden="true"
              >
                {s.n}
              </div>

              {/* Title */}
              <h3
                className="text-ink"
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  marginBottom: '0.625rem',
                }}
              >
                {s.title}
              </h3>

              {/* Body */}
              <p
                className="text-ink-muted"
                style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  maxWidth: '38ch',
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
