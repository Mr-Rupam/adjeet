export function ServicesManifesto() {
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
          № 01 — Manifesto
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--ink-subtle)',
          }}
        >
          Est. 1990 · Siliguri
        </span>
      </div>

      {/* The statement */}
      <div className="mx-auto max-w-content px-6 py-16 md:py-28">
        <div className="grid md:grid-cols-12 gap-8 items-end">
          {/* Big headline */}
          <h2
            className="md:col-span-9 text-ink"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(2.25rem, 7.5vw, 5.5rem)',
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
            }}
          >
            Ten ways to
            <br />
            make your brand
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>impossible</span>
            <br />
            to miss.
          </h2>

          {/* Right column: signature stat */}
          <div className="md:col-span-3 md:text-right">
            <div
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 700,
                lineHeight: 1,
                color: 'var(--ochre)',
                letterSpacing: '-0.02em',
              }}
            >
              500+
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                letterSpacing: '0.12em',
                color: 'var(--ink-subtle)',
                textTransform: 'uppercase',
                marginTop: '0.5rem',
              }}
            >
              Installations<br />across N. Bengal
            </div>
          </div>
        </div>

        {/* Body copy */}
        <div className="mt-12 md:mt-20 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10.5px',
                letterSpacing: '0.12em',
                color: 'var(--ink-subtle)',
                textTransform: 'uppercase',
              }}
            >
              The brief —
            </div>
          </div>
          <p
            className="md:col-span-7 text-ink-muted"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(1.0625rem, 1.8vw, 1.375rem)',
              lineHeight: 1.55,
              maxWidth: '50ch',
            }}
          >
            Glow, paint, print, weld, wrap. Every sign is fabricated and installed
            by our own crew — no subcontracting, no surprises on the install day,
            and a one-year warranty on every piece of LED hardware that leaves
            our workshop.
          </p>
        </div>
      </div>
    </section>
  )
}
