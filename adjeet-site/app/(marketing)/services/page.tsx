import { buildPageMetadata } from '@/lib/seo'
import Image from 'next/image'
import { PageMasthead } from '@/components/street/PageMasthead'
import { ServicesBoard } from '@/components/street/ServicesBoard'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import styles from './Services.module.css'

export const metadata = buildPageMetadata({
  title: "Sign Board, Signage & Printing Services in Siliguri",
  description: "All 10 AD JEET services: glow sign boards, ACP and 3D LED letters, flex and hoarding printing, vehicle branding, wall painting and more across North Bengal.",
  path: "/services",
})

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
            Signage & printing.
            <br />
            <span className="text-signal">Made in Siliguri.</span>
          </>
        }
        lead="Ten ways to put your business in view. From a single shopfront to a campaign across North Bengal."
      />

      <ServicesBoard />

      {/* Process: brief to street */}
      <section className="service-process">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
          <div className={styles.processIntro}>
            <p className="spec text-signal">The making / From brief to site</p>
            <h2 className="display mt-3 text-ink" style={{ fontSize: 'var(--text-display-2)' }} data-site-reveal="title">
              From place to presence.
            </h2>
            <p>Materials, print and finish meet at the bench before a sign reaches its site.</p>
          </div>

          <figure className={styles.materialFigure} data-site-reveal="media">
            <div className={styles.materialImage}>
              <Image
                src="/images/services/fabrication-vinyl-acp-study.webp"
                alt="Material visualisation of hands applying printed vinyl to an aluminium composite panel"
                fill
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) calc(100vw - 64px), 1216px"
              />
              <span className={styles.imageNote} aria-hidden="true">Print / vinyl / ACP</span>
            </div>
            <figcaption>Material visualisation. Illustrative fabrication scene, not a documented AD JEET project.</figcaption>
          </figure>

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
