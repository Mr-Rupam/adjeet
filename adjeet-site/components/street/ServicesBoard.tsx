import Link from 'next/link'
import { services } from '@/content/services'

/**
 * The service board: every trade we run, numbered like a workshop
 * rate card. Whole row is a link; hover inverts it like a lit switchboard.
 */
export function ServicesBoard() {
  return (
    <section className="border-b-2 border-ink bg-paper" id="services">
      <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
          <div>
            <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-1)' }}>
              Ten trades.
              <br />
              One workshop.
            </h2>
          </div>
          <p className="max-w-[36ch] text-sm leading-relaxed text-ink-muted">
            Fabrication, printing, wiring, painting, and installation, all
            in-house at Patiram Jote. Pick a trade to see materials, sizes, and
            turnaround.
          </p>
        </div>

        <ol className="m-0 list-none border-t-2 border-ink p-0">
          {services.map((s, i) => (
            <li key={s.slug} className="border-b-2 border-ink">
              <Link
                href={`/services/${s.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 px-2 py-5 transition-colors hover:bg-ink md:grid-cols-[5rem_1fr_14rem_auto] md:gap-x-8 md:px-4"
              >
                <span
                  aria-hidden="true"
                  className="spec text-ink-subtle transition-colors group-hover:text-signal"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className="min-w-0">
                  <span className="display block text-2xl leading-none text-ink transition-colors group-hover:text-paper md:text-4xl">
                    {s.name}
                  </span>
                  <span className="mt-1 block text-xs text-ink-subtle transition-colors group-hover:text-paper/60 md:text-sm">
                    {s.tagline}
                  </span>
                </span>

                <span className="spec hidden text-ink-subtle transition-colors group-hover:text-paper/70 md:block">
                  {s.turnaround}
                </span>

                <span
                  aria-hidden="true"
                  className="text-xl text-ink-subtle transition-all group-hover:translate-x-1 group-hover:text-signal"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
