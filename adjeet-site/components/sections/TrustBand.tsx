import { FadeIn } from '@/components/motion/FadeIn'

const TAGS = ['Illuminated', 'Structural', 'Print', 'Branding', 'Events']

export function TrustBand() {
  return (
    <section className="bg-paper-elevated border-t border-rule py-10">
      <div className="mx-auto max-w-content px-6">
        <FadeIn>
          <p className="text-center text-sm text-ink-subtle tracking-wide">
            {TAGS.map((tag, i) => (
              <span key={tag}>
                {tag}
                {i < TAGS.length - 1 && (
                  <span className="mx-3 text-rule" aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
