'use client'

import { CountUp } from '@/components/motion/CountUp'
import { FadeIn } from '@/components/motion/FadeIn'

const STATS = [
  { value: 500, suffix: '+', label: 'Projects completed' },
  { value: 10, suffix: '+', label: 'Years in North Bengal' },
  { value: 12, suffix: '', label: 'Districts covered' },
  { value: 200, suffix: '+', label: 'Brand clients' },
] as const

const TESTIMONIAL = {
  quote:
    'AD-JEET transformed our hospital frontage. From survey to installation in six days — no delays, no excuses. That kind of reliability is rare in North Bengal.',
  author: 'Dr. R. Sharma',
  detail: 'Siliguri',
}

export function ByTheNumbers() {
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
          № 04 — By the Numbers
        </span>
      </div>

      <div className="mx-auto max-w-content px-6 py-12 md:py-20 grid md:grid-cols-2 gap-12 md:gap-20 items-start">

        {/* Stats */}
        <FadeIn>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-10">
            {STATS.map(stat => (
              <div key={stat.label}>
                <dd
                  className="text-ink"
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    marginBottom: '0.4rem',
                  }}
                >
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </dd>
                <dt
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10.5px',
                    letterSpacing: '0.1em',
                    color: 'var(--ink-subtle)',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </dt>
                <div
                  style={{
                    width: '24px',
                    height: '1px',
                    background: 'var(--ochre)',
                    marginTop: '0.6rem',
                  }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </dl>
        </FadeIn>

        {/* Pull quote */}
        <FadeIn delay={0.15}>
          <blockquote>
            <div
              aria-hidden="true"
              className="mb-4"
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: '4rem',
                lineHeight: 0.8,
                color: 'var(--ochre)',
                fontWeight: 700,
              }}
            >
              &ldquo;
            </div>
            <p
              className="text-ink"
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(1.0625rem, 2.2vw, 1.3125rem)',
                fontStyle: 'italic',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              {TESTIMONIAL.quote}
            </p>
            <footer>
              <cite
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  color: 'var(--ink-subtle)',
                  textTransform: 'uppercase',
                  fontStyle: 'normal',
                }}
              >
                — {TESTIMONIAL.author}
                <span style={{ marginLeft: '0.75rem', color: 'var(--rule)' }}>·</span>
                <span style={{ marginLeft: '0.75rem' }}>{TESTIMONIAL.detail}</span>
              </cite>
            </footer>
          </blockquote>
        </FadeIn>
      </div>
    </section>
  )
}
