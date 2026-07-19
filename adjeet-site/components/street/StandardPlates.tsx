/**
 * The standard — four commitments, mounted as fabricated plates.
 */
const STANDARDS = [
  {
    n: '01',
    title: 'In-house everything',
    body: 'We never outsource fabrication or installation. Every cut, weld, and wire is done by our own team at Patiram Jote — full accountability from brief to final fixing.',
  },
  {
    n: '02',
    title: 'Monsoon-proven builds',
    body: "North Bengal gets 3,000 mm of rain a year. Sealed enclosures, stainless fixings, IP65-rated LED drivers — built for humidity and Nor'westers.",
  },
  {
    n: '03',
    title: 'One-year warranty',
    body: 'Every installation carries a full one-year warranty on LED components and workmanship — driver replacements, resealing, and electrical faults included.',
  },
  {
    n: '04',
    title: 'Same-day site visit',
    body: 'In Siliguri we survey the same day. District projects are coordinated within 24 hours — and quoted accurately before any work begins.',
  },
]

export function StandardPlates() {
  return (
    <section className="border-b-2 border-ink bg-paper-elevated">
      <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
        <div className="mb-10 md:mb-14">
          <p className="spec text-signal">The standard</p>
          <h2 className="display mt-3 max-w-3xl text-ink" style={{ fontSize: 'var(--text-display-1)' }}>
            Why signs outlive
            <br />
            their warranty here.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {STANDARDS.map(s => (
            <article key={s.n} className="plate plate-hover p-6 md:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="display m-0 text-2xl text-ink md:text-3xl">{s.title}</h3>
                <span aria-hidden="true" className="spec shrink-0 text-signal">
                  STD-{s.n}
                </span>
              </div>
              <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-ink-muted">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
