import type { Metadata } from 'next'
import { PageMasthead } from '@/components/street/PageMasthead'
import { ServicesBoard } from '@/components/street/ServicesBoard'
import { CommissionCTA } from '@/components/street/CommissionCTA'

export const metadata: Metadata = {
  title: 'Signage & Outdoor Advertising Services',
  description:
    'From glow sign boards and ACP LED signage to flex printing, vehicle branding, and events — AD JEET delivers quality signage across North Bengal.',
  alternates: { canonical: 'https://adjeet.in/services' },
}

const PROCESS = [
  {
    n: '01',
    title: 'Survey',
    body: 'We visit your site, measure the substrate, and check power, visibility, and municipal requirements. Same-day in Siliguri.',
  },
  {
    n: '02',
    title: 'Design',
    body: 'A compliant mockup matched to your brand guidelines and the location. Revisions until you approve.',
  },
  {
    n: '03',
    title: 'Fabricate',
    body: 'Metal cutting, acrylic routing, LED wiring, and paint — every step at our Patiram Jote workshop. No subcontracting.',
  },
  {
    n: '04',
    title: 'Install',
    body: 'Our own crew, proper scaffolding, sealed wiring. One-year warranty on LED components and workmanship.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <PageMasthead
        eyebrow="Services"
        meta={['10 trades', 'One workshop', 'Est. 1990']}
        title={
          <>
            Everything a street
            <br />
            needs to <span className="glow-signal text-signal">say your name.</span>
          </>
        }
        lead="Ten trades under one roof — surveyed, fabricated, wired, painted, and installed by the same team that answers your WhatsApp."
      />

      <ServicesBoard />

      {/* Process — brief to street */}
      <section className="border-b-2 border-ink bg-paper-elevated">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
          <div className="mb-10 md:mb-14">
            <p className="spec text-signal">How a sign happens</p>
            <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
              Brief to street in four moves.
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
