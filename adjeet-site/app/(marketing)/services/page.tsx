import type { Metadata } from 'next'
import { PageMasthead } from '@/components/street/PageMasthead'
import { ServicesBoard } from '@/components/street/ServicesBoard'
import { CommissionCTA } from '@/components/street/CommissionCTA'

export const metadata: Metadata = {
  title: 'Signage & Outdoor Advertising Services',
  description:
    'From glow sign boards and ACP LED signage to flex printing, vehicle branding, and events. AD JEET delivers quality signage across North Bengal.',
  alternates: { canonical: 'https://adjeet.in/services' },
}

const PROCESS = [
  {
    n: '01',
    title: 'Start with the site',
    body: 'A photo, a location, a rough size or a brand brief gives the project a place to begin.',
  },
  {
    n: '02',
    title: 'Plan the face',
    body: 'We work through materials, scale and visibility before the workshop starts making.',
  },
  {
    n: '03',
    title: 'Make it',
    body: 'Fabrication, print, finish and illumination meet in the same working process.',
  },
  {
    n: '04',
    title: 'Put it up',
    body: 'The project comes out to the site and gets fitted where people will see it.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <PageMasthead
        meta={['10 services', 'Siliguri', 'Since 1990']}
        title={
          <>
            Make the street
            <br />
            remember <span className="glow-signal text-signal">your name.</span>
          </>
        }
        lead="Start with the place, then choose the surface. The service list below helps you find the right conversation."
      />

      <ServicesBoard />

      {/* Process: brief to street */}
      <section className="border-b border-rule bg-paper-elevated">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
          <div className="mb-10 md:mb-14">
<<<<<<< HEAD
            <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
=======
            <p className="spec text-signal">A working sequence</p>
            <h2 className="display mt-3 text-ink" data-reveal-text style={{ fontSize: 'var(--text-display-2)' }}>
>>>>>>> origin/main
              From place to presence.
            </h2>
          </div>

          <ol className="m-0 list-none border-t border-rule p-0">
            {PROCESS.map(step => (
              <li key={step.n} className="grid gap-3 border-b border-rule py-6 sm:grid-cols-[5rem_minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-baseline sm:gap-6 md:py-8">
                <span aria-hidden="true" className="spec text-signal">{step.n}</span>
                <h3 className="display text-2xl text-ink md:text-3xl" data-reveal-text>{step.title}</h3>
                <p className="max-w-[42ch] text-base leading-relaxed text-ink-muted" data-site-reveal="body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CommissionCTA />
    </>
  )
}
