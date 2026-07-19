import type { ReactNode } from 'react'

/**
 * Street-style opener for inner pages: spec strip, giant hoarding title,
 * supporting copy, optional footer row (stats, CTAs).
 */
interface PageMastheadProps {
  eyebrow: string
  /** Right side of the spec strip — short mono facts. */
  meta?: string[]
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  /** Slightly smaller title for long names (service detail). */
  compact?: boolean
}

export function PageMasthead({ eyebrow, meta = [], title, lead, children, compact }: PageMastheadProps) {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-paper">
      <div aria-hidden="true" className="grid-mat pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-content px-5 pt-6 md:px-8">
        <div className="spec flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-3 text-ink-muted">
          <span>
            <span className="mr-2 inline-block h-2 w-2 bg-signal align-baseline" aria-hidden="true" />
            {eyebrow}
          </span>
          <span className="hidden gap-5 sm:flex">
            {meta.map(m => (
              <span key={m}>{m}</span>
            ))}
          </span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-content px-5 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14">
        <h1
          className="display m-0 text-ink"
          style={{ fontSize: compact ? 'clamp(2.75rem, 7.5vw, 7rem)' : 'var(--text-display-1)' }}
        >
          {title}
        </h1>
        {lead && (
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-ink-muted md:text-lg">
            {lead}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}
