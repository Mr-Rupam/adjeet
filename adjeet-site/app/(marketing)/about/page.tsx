import Image from 'next/image'
<<<<<<< HEAD
import Link from 'next/link'
import type { Metadata } from 'next'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { COVERAGE_AREAS, FOUNDED_YEAR } from '@/lib/coverage'
import styles from './About.module.css'

export const metadata: Metadata = {
  title: 'About AD JEET: A Signmaking Story Since 1990',
  description: 'Founded by Ranjit Das at 20, AD JEET grew from one room in his flat to its own workshop in Siliguri. 35+ years of quality and consistency.',
  alternates: { canonical: `${siteConfig.url}/about` },
}
const breadcrumb = buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }])
const JOURNEY = [
  { marker: String(FOUNDED_YEAR), title: 'One room. A beginning.', body: 'At 20, Ranjit Das started AD JEET in a small room in his own flat.' },
  { marker: 'The next steps', title: 'Three rented offices.', body: 'As the business grew, the work moved through three rented office spaces.' },
  { marker: 'A place of our own', title: 'The first owned office.', body: 'Ranjit purchased his first office, giving the business a place of its own.' },
  { marker: 'Today', title: 'Our own workshop.', body: 'He went on to build his own workshop. AD JEET is still growing, with the same focus on the quality of every job.' },
]
=======
import type { Metadata } from 'next'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { COVERAGE_AREAS, FOUNDED_YEAR } from '@/lib/coverage'

export const metadata: Metadata = {
  title: 'About AD JEET: North Bengal Signage Since 1990',
  description: 'AD JEET has made signage, print and outdoor branding from Siliguri since 1990.',
  alternates: { canonical: `${siteConfig.url}/about` },
}

const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
])

const WORK_IMAGES = [
  { src: '/Ambuja_cement_ACP-LED.png', alt: 'ACP and LED signage for Ambuja Cement fabricated by AD JEET' },
  { src: '/SRMB_vechile.png', alt: 'SRMB vehicle branding wrap by AD JEET' },
  { src: '/airtel.png', alt: 'Airtel glow sign board installation by AD JEET' },
]

>>>>>>> origin/main
export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
<<<<<<< HEAD
      <section className={styles.intro} aria-labelledby="about-heading">
        <div className={styles.introCopy}>
          <p className="spec text-signal">Siliguri · Since {FOUNDED_YEAR}</p>
          <h1 id="about-heading">From one room<br />to our own<br /><span>workshop.</span></h1>
          <p>Ranjit Das was 20 when he started AD JEET. More than 35 years later, the space has changed. The belief in doing good work has stayed.</p>
          <a href="#our-story" className={styles.storyLink}>Follow our story <span aria-hidden="true">↓</span></a>
        </div>
        <figure className={styles.workshop}>
          <div><Image src="/hero/workshop/day.webp" alt="The AD JEET workshop in Siliguri today" fill priority sizes="(max-width: 767px) 100vw, 55vw" className="object-cover" /></div>
          <figcaption>The workshop today. Siliguri, North Bengal.</figcaption>
        </figure>
      </section>
      <section id="our-story" className={styles.story} aria-labelledby="story-heading">
        <div className={styles.sectionHeading}>
          <p className="spec text-signal">Built over 35+ years</p>
          <h2 id="story-heading">A little more room.<br />The same ambition.</h2>
        </div>
        <ol className={styles.journey}>
          {JOURNEY.map(step => <li key={step.marker}><p className="spec text-signal">{step.marker}</p><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}
        </ol>
      </section>
      <section className={styles.trust} aria-labelledby="trust-heading">
        <p className="spec">What keeps a client coming back</p>
        <h2 id="trust-heading">Quality, every time.<br />Trust, over time.</h2>
        <div className={styles.trustCopy}>
          <p>Our client history includes Fortune 500 companies. What matters most to us is the trust that continues beyond the first project.</p>
          <p>That trust rests on the quality of the work and the consistency we bring to it. It is how we have grown, and how we intend to keep growing.</p>
          <Link href="/portfolio" className="cta cta--md cta--yellow">See our work <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <section className={styles.coverage} aria-labelledby="coverage-heading">
        <div className={styles.sectionHeading}>
          <p className="spec text-signal">Where we work</p>
          <h2 id="coverage-heading">Rooted in Siliguri.<br />Across North Bengal.</h2>
          <p>From the hills to the Dooars and south to Malda, our work reaches businesses across the region.</p>
          <ul>{COVERAGE_AREAS.map(area => <li key={area.name}>{area.name}</li>)}</ul>
=======

      <PageMasthead
        meta={[`Since ${FOUNDED_YEAR}`, 'Siliguri', 'North Bengal']}
        title={<>A name earns its<br /><span className="text-signal">place in the street.</span></>}
        lead="AD JEET has worked from Siliguri since 1990. The work is simple to describe: make the business visible where people actually move."
      />

      <section className="border-b border-rule bg-paper">
        <div className="mx-auto grid max-w-content gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:py-24">
          <div>
            <p className="spec text-signal">The point of the work</p>
            <h2 className="display mt-3 text-ink" data-reveal-text style={{ fontSize: 'var(--text-display-2)' }}>
              A sign should make the next look easier.
            </h2>
          </div>
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink-muted" data-site-reveal="body">
            <p>A shopfront, a vehicle, an event entrance or a roadside surface all ask the same question: will the right person notice this when they pass?</p>
            <p>That question shapes the size, material, light and placement. It is why the first useful thing to share is usually a photo of the site.</p>
            <p>From there, AD JEET helps turn an idea into a physical piece of work that belongs to the street around it.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-paper-elevated">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="spec text-signal">Seen in the wild</p>
              <h2 className="display mt-3 text-ink" data-reveal-text style={{ fontSize: 'var(--text-display-2)' }}>Work is the clearest introduction.</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3 md:gap-6">
            {WORK_IMAGES.map((image, index) => (
              <figure key={image.src} className={index === 1 ? 'sm:mt-10' : ''} data-site-reveal="media">
                <div className="relative aspect-[4/5] overflow-hidden bg-night">
                  <Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) calc(100vw - 40px), 30vw" className="object-cover" />
                </div>
                <figcaption className="spec mt-3 text-ink-subtle">Documented project photograph</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-paper">
        <div className="mx-auto grid max-w-content gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:py-24">
          <div>
            <p className="spec text-signal">The route out</p>
            <h2 className="display mt-3 text-ink" data-reveal-text style={{ fontSize: 'var(--text-display-2)' }}>Siliguri is the base.<br />North Bengal is the route.</h2>
          </div>
          <ul className="m-0 grid list-none grid-cols-2 border-t border-rule p-0 sm:grid-cols-3">
            {COVERAGE_AREAS.map(area => (
              <li key={area.name} className="min-h-14 border-b border-rule px-3 py-4 text-sm text-ink-muted">
                {area.name}
              </li>
            ))}
          </ul>
>>>>>>> origin/main
        </div>
        <figure className={styles.map}>
          <a href="/images/north-bengal-coverage.svg" target="_blank" rel="noopener noreferrer" aria-label="Open the coverage map at full size"><Image src="/images/north-bengal-coverage.svg" alt="North Bengal coverage map with Siliguri as the base and a soft highlight reaching Darjeeling, Kalimpong, Jalpaiguri, the Dooars, Alipurduar, Cooch Behar, North and South Dinajpur, and Malda" width={900} height={1000} sizes="(max-width: 767px) 100vw, 58vw" /></a>
          <figcaption>Coverage shown approximately; the fade is not a fixed service boundary.</figcaption>
        </figure>
      </section>
<<<<<<< HEAD
=======

>>>>>>> origin/main
      <CommissionCTA />
    </>
  )
}
