import { CountUp } from '@/components/motion/CountUp'
import { FadeIn } from '@/components/motion/FadeIn'

const STATS = [
  { label: 'Projects', to: 500, suffix: '+' },
  { label: 'Years', to: 10, suffix: '' },
  { label: 'Districts', to: 12, suffix: '' },
  { label: 'Clients', to: 200, suffix: '+' },
] as const

export function ProofBlock() {
  return (
    <section className="bg-paper-elevated border-y border-rule py-16">
      <div className="mx-auto max-w-content px-6">
        <FadeIn>
          <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-12">
            Trusted across North Bengal
          </h2>
        </FadeIn>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(stat => (
            <div key={stat.label}>
              <dt className="order-2 mt-2 text-sm text-ink-muted">{stat.label}</dt>
              <dd className="order-1 text-4xl font-bold font-[var(--font-fraunces)] text-ink">
                <CountUp to={stat.to} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
