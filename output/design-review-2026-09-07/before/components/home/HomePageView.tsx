import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, MapPin } from 'lucide-react'
import { COVERAGE_AREAS, FOUNDED_YEAR } from '@/lib/coverage'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { HomeMotion } from '@/components/motion/HomeMotion'
import { HeroScene } from './HeroScene'
import { ProjectGallery } from './ProjectGallery'
import styles from './Home.module.css'

const SERVICE_GROUPS = [
  {
    id: 'storefront',
    label: '01',
    title: 'Your storefront',
    body: 'Glow signs, ACP and LED faces, and window graphics that make the first look count.',
    href: '/services#storefront',
    mark: 'frontage',
  },
  {
    id: 'campaign',
    label: '02',
    title: 'Your next campaign',
    body: 'Flex, wall, roadside and vehicle work that carries a message beyond one address.',
    href: '/services#campaign',
    mark: 'campaign',
  },
  {
    id: 'space-event',
    label: '03',
    title: 'Your space or event',
    body: 'In-shop branding, displays and event work when every surface has a job to do.',
    href: '/services#space-event',
    mark: 'space',
  },
] as const

const PROCESS = [
  { number: '01', title: 'Size it.', body: 'Share a photo, a rough dimension, or the site. We begin with the place.' },
  { number: '02', title: 'Make it.', body: 'Fabrication, print, finishing and wiring come together in the workshop.' },
  { number: '03', title: 'Fit it.', body: 'The team brings it to site and installs it where it needs to work.' },
]

function GroupMark({ kind }: { kind: (typeof SERVICE_GROUPS)[number]['mark'] }) {
  if (kind === 'frontage') {
    return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 28h44v26H10zM16 28V16h32v12M20 38h8m8 0h8M20 46h24" /></svg>
  }
  if (kind === 'campaign') {
    return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 17h28v24H14zM42 25h8l-8 8M20 47h24M32 41v6" /></svg>
  }
  return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 18h40v28H12zM20 28h24M20 36h16M46 18v28" /></svg>
}

export function HomePageView() {
  return (
    <div className={styles.home} data-home-page>
      <HomeMotion />
      <section id="hero-section" className={styles.hero} aria-labelledby="home-heading">
        <HeroScene />
        <div className={styles.heroStage} data-hero-stage aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.heroMeta} data-hero-meta><span /> Siliguri · Since {FOUNDED_YEAR}</p>
          <h1 id="home-heading" data-hero-title>Made to<br /><span>be seen.</span></h1>
          <p className={styles.heroLead} data-hero-lead>Signage, print &amp; outdoor branding. Designed. Fabricated. Installed.</p>
          <div className={styles.heroActions} data-hero-actions>
            <QuoteCTA source="hero" tone="yellow" label="WhatsApp your project" />
            <a href="#selected-work" className={styles.heroTextLink}><ArrowDown size={17} aria-hidden="true" /> See what&apos;s out there</a>
          </div>
        </div>
        <p className={styles.heroCaption} data-hero-caption>AD JEET workshop, Siliguri.</p>
      </section>

      <ProjectGallery />

      <section id="services" className={styles.services} aria-labelledby="services-heading">
        <div className={styles.sectionIntro} data-home-reveal>
          <div>
            <p className={styles.kicker}>What we make</p>
            <h2 id="services-heading">Choose your<br />canvas.</h2>
          </div>
          <p>One workshop, ten ways to put a name where people will notice it.</p>
        </div>
        <div className={styles.serviceGroups}>
          {SERVICE_GROUPS.map(group => (
            <Link href={group.href} key={group.id} className={styles.serviceGroup} data-home-reveal>
              <div className={styles.serviceMark}><GroupMark kind={group.mark} /></div>
              <span className={styles.groupIndex}>{group.label}</span>
              <div>
                <h3>{group.title}</h3>
                <p>{group.body}</p>
              </div>
              <ArrowUpRight size={21} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <Link href="/services" className={styles.textLink}>All 10 services <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>

      <section className={styles.craft} aria-labelledby="craft-heading">
        <div className={styles.craftMedia} data-home-reveal>
          <Image src="/images/home/materials.webp" alt="Material visualization of acrylic, aluminium, vinyl and illuminated sign components" fill sizes="(max-width: 767px) 100vw, 52vw" className={styles.coverImage} />
          <span>Material visualization</span>
        </div>
        <div className={styles.craftCopy} data-home-reveal>
          <p className={styles.kicker}>Built from the inside out</p>
          <h2 id="craft-heading">The details hold<br />the light.</h2>
          <ol>
            {PROCESS.map(step => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div><h3>{step.title}</h3><p>{step.body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.coverage} aria-labelledby="coverage-heading">
        <div className={styles.coverageImage} data-home-reveal>
          <Image src="/Acc.png" alt="An ACC roadside sign installed by AD JEET" fill sizes="(max-width: 767px) 100vw, 52vw" className={styles.coverImage} />
        </div>
        <div className={styles.coverageCopy} data-home-reveal>
          <p className={styles.kicker}>From city streets to hill roads</p>
          <h2 id="coverage-heading">Out where a good<br />sign goes far.</h2>
          <p>Based in Siliguri, working across North Bengal. Tell us where the work is and we&apos;ll start from there.</p>
          <ul aria-label="Areas we serve">
            {COVERAGE_AREAS.map(area => <li key={area.name}>{area.name}{'hq' in area && area.hq ? <span>Siliguri base</span> : null}</li>)}
          </ul>
          <Link href="/contact" className={styles.textLink}>Tell us your location <MapPin size={18} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.enquiry} aria-labelledby="enquiry-heading">
        <div data-home-reveal>
          <p className={styles.enquiryKicker}>Start with a photo</p>
          <h2 id="enquiry-heading">What are we putting<br />your name on?</h2>
        </div>
        <div className={styles.enquiryBody} data-home-reveal>
          <p>Send a photo of your space. Tell us where it is. Let&apos;s start there.</p>
          <QuoteCTA source="home-enquiry" tone="yellow" label="WhatsApp your project" />
          <Link href="/contact" className={styles.enquiryLink}>Or send a project brief <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  )
}
