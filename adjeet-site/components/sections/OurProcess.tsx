const STEPS = [
  {
    n: '01',
    when: 'Day 0',
    title: 'Inquiry',
    body: 'You send dimensions and a reference image via WhatsApp or our callback form. We respond within two business hours.',
  },
  {
    n: '02',
    when: 'Day 1',
    title: 'Site Survey',
    body: 'Our team visits the site to measure substrate, photograph the location, assess access, and confirm electrical availability.',
  },
  {
    n: '03',
    when: 'Day 2–3',
    title: 'Design & Quote',
    body: 'In-house designers produce a scaled mockup with material specs and a fixed quote. Revisions until you sign off.',
  },
  {
    n: '04',
    when: 'Day 4–7',
    title: 'Workshop Build',
    body: 'Cut, weld, print, wire, and finish at our Patiram Jote workshop. QC pass on lighting, fixings, and weatherproofing.',
  },
  {
    n: '05',
    when: 'Day 8',
    title: 'Installation',
    body: 'Crew on-site with hardware, scaffolding, and electrical kit. Sign live before we leave. One-year warranty starts.',
  },
]

export function OurProcess() {
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
          № 03 — How We Work
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--ink-subtle)',
          }}
        >
          Brief → Live in 8 days
        </span>
      </div>

      {/* Section heading */}
      <div className="mx-auto max-w-content px-6 pt-12 md:pt-20 pb-6">
        <h2
          className="text-ink"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            maxWidth: '14ch',
          }}
        >
          From the brief to a live sign in
          <span style={{ color: 'var(--ochre)' }}> eight days</span>.
        </h2>
      </div>

      {/* Process steps */}
      <div className="mx-auto max-w-content px-6 pb-16 md:pb-24">
        <div>
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="grid md:grid-cols-12 gap-4 md:gap-8 py-8 md:py-10"
              style={{
                borderTop: '1px solid var(--rule)',
                borderBottom: i === STEPS.length - 1 ? '1px solid var(--rule)' : 'none',
              }}
            >
              {/* Big step number */}
              <div className="md:col-span-2">
                <div
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                    fontWeight: 700,
                    lineHeight: 0.9,
                    color: 'var(--rule)',
                    letterSpacing: '-0.02em',
                  }}
                  aria-hidden="true"
                >
                  {step.n}
                </div>
              </div>

              {/* When */}
              <div className="md:col-span-2">
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10.5px',
                    letterSpacing: '0.14em',
                    color: 'var(--ochre)',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem',
                  }}
                >
                  When
                </div>
                <div
                  className="text-ink"
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                  }}
                >
                  {step.when}
                </div>
              </div>

              {/* Title */}
              <div className="md:col-span-3">
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10.5px',
                    letterSpacing: '0.14em',
                    color: 'var(--ink-subtle)',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem',
                  }}
                >
                  Step
                </div>
                <h3
                  className="text-ink"
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </h3>
              </div>

              {/* Body */}
              <div className="md:col-span-5">
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10.5px',
                    letterSpacing: '0.14em',
                    color: 'var(--ink-subtle)',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem',
                  }}
                >
                  Detail
                </div>
                <p
                  className="text-ink-muted"
                  style={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    maxWidth: '46ch',
                  }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
