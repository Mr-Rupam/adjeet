import { defaultWhatsAppUrl } from '@/lib/whatsapp'

const DISTRICTS = [
  { name: 'Siliguri', hq: true },
  { name: 'Darjeeling' },
  { name: 'Jalpaiguri' },
  { name: 'Cooch Behar' },
  { name: 'Alipurduar' },
  { name: 'Kalimpong' },
  { name: 'Malda' },
  { name: 'North Dinajpur' },
  { name: 'South Dinajpur' },
  { name: 'The Dooars' },
]

/**
 * Coverage — the route board. Where the installation vans go.
 */
export function CoverageBoard() {
  const waUrl = defaultWhatsAppUrl()

  return (
    <section className="border-b-2 border-ink bg-paper">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="spec text-signal">Coverage</p>
          <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-1)' }}>
            From the hills
            <br />
            to the plains.
          </h2>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-ink-muted">
            Darjeeling switchbacks to Malda highways — our vans carry
            scaffolding, generators, and every tool the job needs. If your town
            isn&apos;t listed, ask. We probably go there.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="spec mt-8 inline-flex items-center gap-2 border-2 border-ink px-5 py-3.5 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Ask about your area →
          </a>
        </div>

        <ul className="m-0 list-none self-center border-t-2 border-ink p-0">
          {DISTRICTS.map((d, i) => (
            <li
              key={d.name}
              className="flex items-baseline justify-between gap-4 border-b-2 border-ink py-3"
            >
              <span className="flex items-baseline gap-4 min-w-0">
                <span aria-hidden="true" className="spec w-10 shrink-0 text-ink-subtle">
                  R-{String(i + 1).padStart(2, '0')}
                </span>
                <span className="display truncate text-2xl text-ink md:text-3xl">{d.name}</span>
              </span>
              {d.hq ? (
                <span className="spec shrink-0 border-2 border-signal bg-signal/10 px-2 py-0.5 text-signal">
                  HQ + Workshop
                </span>
              ) : (
                <span aria-hidden="true" className="spec shrink-0 text-ink-subtle">
                  On route
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
