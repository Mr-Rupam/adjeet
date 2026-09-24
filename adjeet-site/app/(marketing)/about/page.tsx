import { buildPageMetadata } from '@/lib/seo'
import Image from 'next/image'
import Link from 'next/link'
import { buildBreadcrumbJsonLd, buildFounderJsonLd, buildWebPageJsonLd, jsonLdString } from '@/lib/seo'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { FOUNDED_YEAR } from '@/lib/coverage'
import { CoverageMapProvider } from '@/components/coverage/CoverageMapContext'
import { CoveragePlaceList } from '@/components/coverage/CoveragePlaceList'
import { CoverageStage } from '@/components/coverage/CoverageStage'
import { clientSlug, getPhotoById } from '@/content/gallery'
import styles from './About.module.css'

const PAGE = {
  title: "About Our Siliguri Signage Workshop",
  description: "Founded by Ranjit Das in 1990, AD JEET grew from one room to its own workshop in Siliguri. Meet the business behind our North Bengal signage work.",
  path: "/about",
}
export const metadata = buildPageMetadata(PAGE)
const webPage = buildWebPageJsonLd({ ...PAGE, type: 'AboutPage' })
const founder = buildFounderJsonLd()
const breadcrumb = buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }])
const JOURNEY = [
  { marker: String(FOUNDED_YEAR), title: 'One room. A beginning.', body: 'At 20, Ranjit Das started AD JEET in a small room in his own flat.' },
  { marker: 'The next steps', title: 'Three rented offices.', body: 'As the business grew, the work moved through three rented office spaces.' },
  { marker: 'A place of our own', title: 'The first owned office.', body: 'Ranjit purchased his first office, giving the business a place of its own.' },
  { marker: 'Today', title: 'Our own workshop.', body: 'He went on to build his own workshop. AD JEET is still growing, with the same focus on the quality of every job.' },
]
// National brands, photographed where the work went up.
const CLIENT_WORK = ['airtel-008', 'star-cement-022', 'supreme-pipe-069', 'emami-089'].map(getPhotoById)

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(founder) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
      <section className={styles.intro} aria-labelledby="about-heading">
        <div className={styles.introCopy}>
          <p className="spec text-signal">Siliguri · Since {FOUNDED_YEAR}</p>
          <h1 id="about-heading" data-site-reveal="title">AD JEET. <br />A Siliguri workshop, <br /><span>since 1990.</span></h1>
          <p>Ranjit Das was 20 when he started AD JEET. More than 35 years later, the space has changed. The belief in doing good work has stayed.</p>
          <a href="#our-story" className={styles.storyLink}>Follow our story <span aria-hidden="true">↓</span></a>
        </div>
        <figure className={styles.workshop} data-site-reveal="media">
          <div><Image src="/hero/workshop/day.webp" alt="Visualisation of the AD JEET workshop in Siliguri" fill priority sizes="(max-width: 767px) 100vw, 55vw" className="object-cover" /></div>
          <figcaption>Workshop visualisation. Siliguri, North Bengal.</figcaption>
        </figure>
      </section>
      <section id="our-story" className={styles.story} aria-labelledby="story-heading">
        <div className={styles.sectionHeading}>
          <p className="spec text-signal">Built over 35+ years</p>
          <h2 id="story-heading" data-site-reveal="title">A little more room.<br />The same ambition.</h2>
        </div>
        <ol className={styles.journey}>
          {JOURNEY.map(step => <li key={step.marker} data-site-reveal><p className="spec text-signal">{step.marker}</p><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}
        </ol>
      </section>
      <section className={styles.trust} aria-labelledby="trust-heading">
        <p className="spec">What keeps a client coming back</p>
        <h2 id="trust-heading" data-site-reveal="title">Quality, every time.<br />Trust, over time.</h2>
        <div className={styles.trustCopy}>
          <p>Our client history includes Fortune 500 companies. What matters most to us is the trust that continues beyond the first project.</p>
          <p>That trust rests on the quality of the work and the consistency we bring to it. It is how we have grown, and how we intend to keep growing.</p>
          <Link href="/portfolio" className="cta cta--md cta--yellow">See our work <span aria-hidden="true">↗</span></Link>
        </div>
        <ul className={styles.clientWork} aria-label="Work for national brands">
          {CLIENT_WORK.map(photo => (
            <li key={photo.id}>
              <Link href={'/portfolio?client=' + clientSlug(photo.client)}>
                <span className={styles.clientWorkImage}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 50vw, 25vw" className="object-cover" /></span>
                <span className={styles.clientWorkName}>{photo.client}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.coverage} aria-labelledby="coverage-heading">
        <CoverageMapProvider>
          <div className={styles.sectionHeading}>
            <p className="spec text-signal">Where we work</p>
            <h2 id="coverage-heading" data-site-reveal="title">Rooted in Siliguri.<br />Across North Bengal.</h2>
            <p>From the hills to the Dooars and south to Malda, our work reaches businesses across the region. Pick your town to see how far we travel to reach it.</p>
            <CoveragePlaceList />
          </div>
          <div className={styles.map}>
            <CoverageStage caption="Coverage shown approximately; the reach is not a fixed service boundary." />
          </div>
        </CoverageMapProvider>
      </section>
      <CommissionCTA />
    </>
  )
}
