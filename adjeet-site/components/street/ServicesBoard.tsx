import Link from 'next/link'
import { services, type ServiceSlug } from '@/content/services'

const GROUPS: Array<{ id: string; index: string; title: string; note: string; slugs: ServiceSlug[] }> = [
  {
    id: 'storefront',
    index: '01',
    title: 'Your storefront',
    note: 'The face people meet first.',
    slugs: ['glow-sign-boards', 'acp-led-signage', 'one-way-vision'],
  },
  {
    id: 'campaign',
    index: '02',
    title: 'Your next campaign',
    note: 'Work that travels through the street.',
    slugs: ['flex-printing', 'vehicle-branding', 'wall-painting', 'f-pole-installation'],
  },
  {
    id: 'space-event',
    index: '03',
    title: 'Your space or event',
    note: 'Every surface becomes part of the message.',
    slugs: ['in-shop-branding', 'events-and-puja', 'product-display'],
  },
]

export function ServicesBoard() {
  return (
    <section className="border-b border-rule bg-paper" id="services">
      <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="spec text-signal">All ten services</p>
          <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-1)' }}>
            Choose the surface.<br />We&apos;ll make it work.
          </h2>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-ink-muted">
            The service list is organised by where your name needs to show up. Every row leads to its actual service page.
          </p>
        </div>

        <div className="mt-12 grid gap-12 md:mt-16 md:gap-16">
          {GROUPS.map(group => {
            const groupServices = group.slugs.map(slug => services.find(service => service.slug === slug)).filter(Boolean)
            return (
              <section id={group.id} key={group.id} className="scroll-mt-28">
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="display flex items-baseline gap-3 text-3xl text-ink md:text-4xl">
                    <span className="spec text-signal">{group.index}</span>{group.title}
                  </h3>
                  <p className="text-sm text-ink-muted">{group.note}</p>
                </div>
                <ol className="m-0 list-none border-t border-rule p-0">
                  {groupServices.map((service, index) => service && (
                    <li key={service.slug} className="border-b border-rule">
                      <Link href={`/services/${service.slug}`} className="group grid min-h-20 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-4 transition-colors hover:text-signal md:grid-cols-[4rem_minmax(0,1fr)_14rem_auto] md:gap-6 md:px-3">
                        <span className="spec text-ink-subtle">{String(index + 1).padStart(2, '0')}</span>
                        <span className="min-w-0">
                          <span className="display block text-2xl text-ink transition-colors group-hover:text-signal md:text-3xl">{service.name}</span>
                          <span className="mt-1 block text-sm text-ink-muted">{service.tagline}</span>
                        </span>
                        <span className="spec hidden text-ink-subtle md:block">{service.turnaround}</span>
                        <span aria-hidden="true" className="text-xl text-ink-subtle transition-transform group-hover:translate-x-1 group-hover:text-signal">↗</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
