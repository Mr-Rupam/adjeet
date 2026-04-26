const CATEGORIES = [
  {
    n: 'A',
    name: 'Panels & Substrate',
    items: ['ACP (Alucobond)', 'ACP (Domestic)', 'Acrylic sheet', 'Foam board 5/10mm', 'PVC backing'],
  },
  {
    n: 'B',
    name: 'Structure & Mounting',
    items: ['MS hollow section', 'GI pipe', 'RCC foundation', 'Aluminium extrusion', 'Stainless fixings'],
  },
  {
    n: 'C',
    name: 'Lighting',
    items: ['SMD LED strip', 'LED modules', 'LED pixel strip', 'LED floodlight', 'Branded drivers'],
  },
  {
    n: 'D',
    name: 'Print Media',
    items: ['Frontlit flex 280gsm', 'Blockout flex 440gsm', 'One-way 50/50 vinyl', 'Cast wrap film', 'Calendered vinyl'],
  },
  {
    n: 'E',
    name: 'Finishing',
    items: ['Powder coat', 'Exterior enamel', 'Weather-shield emulsion', 'UV laminate', 'Stencil film'],
  },
  {
    n: 'F',
    name: 'Inks & Surface',
    items: ['Solvent ink', 'UV-print ink', 'Cut vinyl lettering', 'Window film', 'Primer'],
  },
]

export function MaterialsLibrary() {
  return (
    <section
      className="section-inverse"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Section label */}
      <div
        className="mx-auto max-w-content px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
          }}
        >
          № 04 — Materials Library
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          {CATEGORIES.reduce((acc, c) => acc + c.items.length, 0)} items · 6 categories
        </span>
      </div>

      {/* Heading */}
      <div className="mx-auto max-w-content px-6 pt-16 md:pt-24 pb-10">
        <h2
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            maxWidth: '14ch',
          }}
        >
          Stocked, sourced, and{' '}
          <span style={{ color: 'var(--ochre)', fontStyle: 'italic', fontWeight: 400 }}>
            specified
          </span>{' '}
          for North Bengal.
        </h2>
        <p
          className="mt-6"
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.9375rem',
            lineHeight: 1.65,
            maxWidth: '50ch',
          }}
        >
          Every material we work with — graded for monsoon humidity, hill-station
          temperature swings, and the dust-and-sun cycle of the plains.
        </p>
      </div>

      {/* Materials grid */}
      <div className="mx-auto max-w-content px-6 pb-20 md:pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.n}
              className="py-8"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {/* Category badge */}
              <div className="flex items-baseline gap-3 mb-5">
                <span
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--ochre)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                  aria-hidden="true"
                >
                  {cat.n}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }}
                >
                  {cat.name}
                </h3>
              </div>

              {/* Items */}
              <ul className="list-none p-0 m-0 space-y-2">
                {cat.items.map(item => (
                  <li
                    key={item}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11.5px',
                      letterSpacing: '0.04em',
                      color: 'rgba(255,255,255,0.65)',
                      lineHeight: 1.5,
                      padding: '0.4rem 0',
                      borderBottom: '1px dashed rgba(255,255,255,0.08)',
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
