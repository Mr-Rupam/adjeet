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
      <section className="border-b-2 border-ink bg-paper-elevated">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
          <div className="mb-10 md:mb-14">
            <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
              From place to presence.
            </h2>
          </div>

          <ol className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PROCESS.map(step => (
              <li key={step.n} className="plate p-6">
                <span aria-hidden="true" className="display block text-5xl text-signal">
                  {step.n}
                </span>
                <h3 className="display mt-4 text-2xl text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CommissionCTA />
    </>
  )
}
