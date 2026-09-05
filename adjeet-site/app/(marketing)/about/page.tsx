import type { Metadata } from 'next'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { StandardPlates } from '@/components/street/StandardPlates'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { DISTRICTS_SERVED, FOUNDED_YEAR, YEARS_ACTIVE } from '@/lib/coverage'

export const metadata: Metadata = {
  title: 'About AD JEET: North Bengal Signage Since 1990',
  description:
    'AD JEET has been fabricating and installing signage across North Bengal since 1990. Learn our story, our team, and the districts we serve.',
  alternates: { canonical: `${siteConfig.url}/about` },
}

const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
])

const MILESTONES = [
  { year: '1990', title: 'The beginning', desc: 'Jeet Kumar Sarkar opens a small fabrication workshop in Siliguri, starting with hand-painted boards and basic neon.' },
  { year: '1998', title: 'Expansion', desc: 'Flex printing and vehicle branding added. First jobs in Jalpaiguri and Cooch Behar.' },
  { year: '2005', title: 'The workshop', desc: 'The dedicated Patiram Jote facility opens, giving full control over every stage of production.' },
  { year: '2012', title: 'LED revolution', desc: 'SMD LED adopted across the board. 60–70% less power, 50,000-hour lifespan.' },
  { year: '2018', title: `${DISTRICTS_SERVED} districts`, desc: 'Coverage stretches from the Darjeeling hills to the Malda plains.' },
  { year: '2024', title: 'New generation', desc: '500+ installations done. The second Sarkar generation carries the craft forward.' },
]

const STORY: { text: string; highlight?: string; highlightLabel?: string }[] = [
  {
    text: 'AD JEET was founded in 1990 by Jeet Kumar Sarkar in Siliguri, West Bengal. Starting with hand-painted boards and basic neon installations, the company grew alongside North Bengal\'s commercial expansion, from the early malls on Sevoke Road to the industrial zones near Bagdogra and the tea estates of Darjeeling.',
  },
  {
    highlight: '3,000+',
    highlightLabel: 'individual signs fabricated since 1990',
    text: 'Over three and a half decades we have installed signage for pharmacies, hospitals, showrooms, telecom outlets, restaurants, logistics companies, and government departments. Clients range from solo proprietors opening their first shop to regional chains expanding across five districts.',
  },
  {
    text: 'In 2005 we opened our dedicated fabrication workshop at Patiram Jote, outside Siliguri, giving us full control over quality at every stage, from metal cutting and acrylic routing to LED wiring and final paint finish.',
  },
  {
    highlight: '60–70%',
    highlightLabel: 'less power consumption with LED',
    text: 'We adopted LED illumination in 2012. Modern SMD LEDs consume dramatically less power, last 30,000–50,000 hours, and light evenly. Combined with weatherproofed enclosures, our signs routinely outlast their five-year maintenance agreements.',
  },
  {
    text: 'Today AD JEET is run by the second generation of the Sarkar family, with the same rule that built the reputation: we do not outsource fabrication or installation. Every project is handled by our own team.',
  },
]

const WORKSHOP_SPECS = [
  { val: '4,000 sq ft', label: 'Workshop area' },
  { val: '6 days/week', label: 'Operating schedule' },
  { val: '3 vehicles', label: 'Installation fleet' },
  { val: '15+ skilled workers', label: 'Our team' },
]

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }}
      />

      <PageMasthead
        eyebrow="Company profile"
        meta={[`Est. ${FOUNDED_YEAR}`, 'Siliguri, WB', '2 generations']}
        title={
          <>
            {YEARS_ACTIVE} years of putting
            <br />
            names <span className="glow-signal text-signal">in lights.</span>
          </>
        }
        lead={`From a one-man workshop in ${FOUNDED_YEAR} to North Bengal's most trusted signage company, with 500+ installations, ${DISTRICTS_SERVED} districts, two generations of the same family craft.`}
      >
        <dl className="m-0 flex flex-wrap gap-6 md:gap-10">
          {[
            { v: '1990', k: 'Founded' },
            { v: '500+', k: 'Installations' },
            { v: '12', k: 'Districts' },
            { v: '1 yr', k: 'Warranty' },
          ].map(s => (
            <div key={s.k} className="flex flex-col border-l-2 border-ink pl-4">
              <dt className="spec order-2 text-ink-subtle">{s.k}</dt>
              <dd className="display order-1 m-0 text-4xl text-ink">{s.v}</dd>
            </div>
          ))}
        </dl>
      </PageMasthead>

      {/* The story */}
      <section className="border-b-2 border-ink bg-paper">
        <div className="mx-auto grid max-w-content gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
            <p className="spec text-signal">The story</p>
            <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
              A workshop.
              <br />
              A craft.
              <br />
              A family.
            </h2>
          </div>

          <div className="lg:col-span-3">
            {STORY.map((block, i) => (
              <div key={i}>
                {block.highlight && (
                  <div className="mb-3 flex items-end gap-3">
                    <span className="display text-5xl text-signal">{block.highlight}</span>
                    <span className="spec pb-1 text-ink-subtle">{block.highlightLabel}</span>
                  </div>
                )}
                <p className="text-[15px] leading-relaxed text-ink-muted">{block.text}</p>
                {i < STORY.length - 1 && <div className="my-8 h-0.5 w-10 bg-ink" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones: the route board */}
      <section className="border-b-2 border-ink bg-paper-elevated">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
          <p className="spec text-signal">Milestones</p>
          <h2 className="display mt-3 mb-10 text-ink md:mb-14" style={{ fontSize: 'var(--text-display-2)' }}>
            The years that built the name.
          </h2>

          <ol className="m-0 list-none border-t-2 border-ink p-0">
            {MILESTONES.map(m => (
              <li
                key={m.year}
                className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-b-2 border-ink py-5 md:grid-cols-[10rem_16rem_1fr] md:gap-x-10"
              >
                <span className="display text-4xl text-signal md:text-5xl">{m.year}</span>
                <h3 className="display m-0 text-xl text-ink md:text-2xl">{m.title}</h3>
                <p className="col-span-2 mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-muted md:col-span-1 md:mt-0">
                  {m.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The workshop */}
      <section className="border-b-2 border-ink bg-paper">
        <div className="mx-auto grid max-w-content gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="spec text-signal">Patiram Jote</p>
            <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
              Where signs
              <br />
              come to life.
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-muted">
              <p>
                Our 4,000 sq ft fabrication facility is where every AD JEET sign is
                born. Metal cutting, CNC routing, acrylic bending, LED wiring,
                painting. Everything under one roof.
              </p>
              <p>
                The workshop runs six days a week with a dedicated quality
                inspection station, and a fleet of installation vehicles equipped
                with scaffolding, generators, and wiring tools.
              </p>
            </div>

            <dl className="m-0 mt-8 border-t-2 border-ink">
              {WORKSHOP_SPECS.map(spec => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 border-b-2 border-ink py-3">
                  <dt className="spec text-ink-subtle">{spec.label}</dt>
                  <dd className="display m-0 text-xl text-ink">{spec.val}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Process panels */}
          <div className="grid grid-cols-2 gap-4 self-center md:gap-6">
            {[
              { label: 'ST-01 Metal', sub: 'Cutting & welding', night: true },
              { label: 'ST-02 LED', sub: 'Wiring & testing', night: false },
              { label: 'ST-03 Acrylic', sub: 'Routing & bending', night: false },
              { label: 'ST-04 Paint', sub: 'Finish & QC', night: true },
            ].map((panel, i) => (
              <div
                key={panel.label}
                className={`flex aspect-square flex-col justify-between border-2 border-ink p-5 ${
                  panel.night ? 'bg-night' : 'bg-paper-elevated'
                } ${i === 1 ? 'mt-8' : i === 2 ? '-mt-4' : ''}`}
              >
                <span className={`spec ${panel.night ? 'text-signal-hot' : 'text-signal'}`}>
                  {panel.label}
                </span>
                <span className={`display text-xl ${panel.night ? 'text-night-ink' : 'text-ink'}`}>
                  {panel.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StandardPlates />
      <CommissionCTA />
    </>
  )
}
