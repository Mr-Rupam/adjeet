import { FadeIn } from '@/components/motion/FadeIn'

const CAPABILITIES = [
  {
    label: 'Illuminated',
    description: 'Glow signs & LED',
    icon: '💡',
  },
  {
    label: 'Structural',
    description: 'F-poles & ACP',
    icon: '🏗️',
  },
  {
    label: 'Print',
    description: 'Flex & vinyl',
    icon: '🖨️',
  },
  {
    label: 'Branding',
    description: 'Vehicles & in-shop',
    icon: '🎨',
  },
  {
    label: 'Events',
    description: 'Puja & stage',
    icon: '✨',
  },
]

export function TrustBand() {
  return (
    <section className="bg-paper-elevated border-t border-rule py-12">
      <div className="mx-auto max-w-content px-6">
        <FadeIn>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-8">
            What we do
          </p>
        </FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
          {CAPABILITIES.map(cap => (
            <FadeIn key={cap.label}>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl" aria-hidden="true">{cap.icon}</span>
                <p className="text-sm font-semibold text-ink">{cap.label}</p>
                <p className="text-xs text-ink-muted">{cap.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
