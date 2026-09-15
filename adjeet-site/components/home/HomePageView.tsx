import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { COVERAGE_AREAS, FOUNDED_YEAR } from '@/lib/coverage'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { HeroScene } from './HeroScene'
import { ProjectGallery } from './ProjectGallery'
import { ClientStreet } from '@/components/street/ClientStreet'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { homeFaqs } from '@/content/home-faqs'
import { services } from '@/content/services'
import styles from './Home.module.css'

const GROUPS = [
  { id: 'storefront', title: 'Your storefront', detail: 'Glow signs · ACP & LED · Window graphics', image: '/Ambuja_cement_ACP-LED.png', alt: 'Ambuja Cement storefront signage by AD JEET' },
  { id: 'campaign', title: 'Your next campaign', detail: 'Flex · Vehicle branding · Wall painting · F-poles', image: '/SRMB_vechile.png', alt: 'SRMB branding on a delivery vehicle' },
  { id: 'space-event', title: 'Your space or event', detail: 'In-shop branding · Events · Product displays', image: '/Gates.png', alt: 'Anchor by Panasonic branded entrance for Durga Puja by AD JEET' },
]
const PROCESS = [
  { title: 'Show us the space.', body: 'Send a site photo, the location and rough dimensions. A finished brief is optional.' },
  { title: 'Make a plan.', body: 'Work through artwork, materials, lighting and the right scale for your site.' },
  { title: 'Bring it to life.', body: 'Print, fabrication and finishing come together before the work goes to installation.' },
]

export function HomePageView() {
  return (
    <div className={styles.home} data-home-page>
      <section id="hero-section" className={styles.hero} aria-labelledby="home-heading">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><span className={styles.dot} /> Siliguri, North Bengal · Est. {FOUNDED_YEAR}</p>
          <h1 id="home-heading">Signage &amp; <br />outdoor advertising <br /><span>in Siliguri.</span></h1>
          <div className={styles.heroDescription}>
            <p className={styles.heroCategory}>From your shopfront to the streets of North Bengal.</p>
            <p>Glow sign boards, ACP &amp; 3D LED letters, flex printing and vehicle branding. Designed, fabricated and installed from our Siliguri workshop for North Bengal and Sikkim.</p>
          </div>
          <div className={styles.heroActions}>
            <QuoteCTA source="hero" label="WhatsApp your project" />
            <a href="#selected-work" className={styles.textLink}>Explore the work <ArrowDown size={18} aria-hidden="true" /></a>
          </div>
          <p className={styles.heroFoot}>From a shopfront to a street full of possibilities.</p>
        </div>
        <Link href="/portfolio?service=acp-led-signage" className={styles.heroProject} aria-label="Explore Ambuja Cement ACP and LED signage">
          <Image src="/Ambuja_cement_ACP-LED.png" alt="Ambuja Cement illuminated storefront signage by AD JEET" fill preload sizes="(max-width: 767px) 100vw, 54vw" className={styles.coverImage} />
          <span className={styles.projectTag}>Out in the world <ArrowUpRight size={19} aria-hidden="true" /></span>
          <div className={styles.heroProjectCaption}><span><strong>Ambuja Cement</strong><span>ACP &amp; LED signage</span></span><span className={styles.roundArrow}><ArrowUpRight aria-hidden="true" /></span></div>
        </Link>
      </section>
      <div className={styles.factStrip} aria-label="AD JEET at a glance">
        <span><strong>Since 1990</strong> A signmaking story</span>
        <span><strong>10 services</strong> One working team</span>
        <span><strong>North Bengal</strong> Based in Siliguri</span>
      </div>
      <ProjectGallery />
      <ClientStreet />
      <section id="services" className={styles.services} aria-labelledby="services-heading">
        <div className={styles.sectionIntro}>
          <div><p className={styles.kicker}>02 / What we make</p><h2 id="services-heading">Signage, print<br /><span>&amp; branding.</span></h2></div>
          <div><p>A new shopfront. A campaign on the move. An event that needs to feel like you. Start with where your name belongs.</p><Link href="/services" className={styles.textLink}>All 10 services <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
        <div className={styles.serviceGroups}>
          {GROUPS.map((group, index) => (
            <Link key={group.id} href={'/services#' + group.id} className={styles.serviceGroup}>
              <div className={styles.serviceImage}><Image src={group.image} alt={group.alt} fill sizes="(max-width: 767px) 100vw, 33vw" className={styles.coverImage} /><span>0{index + 1}</span></div>
              <div className={styles.serviceTitle}><h3>{group.title}</h3><ArrowUpRight size={24} aria-hidden="true" /></div><p>{group.detail}</p>
            </Link>
          ))}
        </div>
        <nav aria-label="Explore signage and advertising services" className={styles.serviceLinks}>
          {services.map(service => <Link href={'/services/' + service.slug} key={service.slug}>{service.name}<ArrowUpRight size={15} aria-hidden="true" /></Link>)}
        </nav>
      </section>
      <section className={styles.workshop} aria-labelledby="workshop-heading">
        <div className={styles.workshopMedia}><HeroScene /><span className={styles.workshopCaption}>AD JEET workshop, Siliguri. · Workshop visualisation</span></div>
        <div className={styles.workshopCopy}>
          <p className={styles.kicker}>03 / The people behind the signs</p>
          <h2 id="workshop-heading">A place to<br /><span>make it happen.</span></h2>
          <p>In 1990, Ranjit Das started AD JEET in one room. Today, our own workshop in Siliguri brings the work together, from the first drawing to the final fitting.</p>
          <Link href="/about" className={styles.textLink}>Meet AD JEET <ArrowUpRight size={18} aria-hidden="true" /></Link>
          <p className={styles.sceneNote}>Try the day / night switch in the navigation.</p>
        </div>
      </section>
      <section id="how-it-works" className={styles.process} aria-labelledby="process-heading">
        <div className={styles.sectionIntro}><div><p className={styles.kicker}>04 / Your idea, made real</p><h2 id="process-heading">From idea<br />to installation.</h2></div><p>You don&apos;t need to know the material names.<br />You just need a place to start.</p></div>
        <ol className={styles.processSteps}>{PROCESS.map((step, index) => <li key={step.title}><span className={styles.stepNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol>
      </section>
      <section className={styles.coverage} aria-labelledby="coverage-heading">
        <div className={styles.coverageCopy}><p className={styles.kicker}>05 / Local knowledge. Regional reach.</p><h2 id="coverage-heading">Made in Siliguri.<br /><span>Seen across<br />North Bengal.</span></h2><p>From hill roads to high streets, we help businesses put their name in the right place.</p><ul aria-label="Areas we serve">{COVERAGE_AREAS.map(area => <li key={area.name}>{area.name}</li>)}</ul><Link href="/contact" className={styles.textLink}>Tell us your location <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        <figure className={styles.coverageMap}><Image src="/images/north-bengal-coverage.svg" alt="Map of AD JEET's North Bengal coverage, based in Siliguri" width={900} height={1000} sizes="(max-width: 767px) 100vw, 45vw" /><figcaption>Approximate coverage. Tell us where your project is.</figcaption></figure>
      </section>
      <section className={styles.faq} aria-labelledby="home-faq-heading">
        <div className={styles.sectionIntro}><div><p className={styles.kicker}>06 / Before we start</p><h2 id="home-faq-heading">Your signage<br /><span>questions, answered.</span></h2></div><p>What we make, where we work and what to send for a quote.</p></div>
        <div className={styles.faqList}>{homeFaqs.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
        <Link href="/contact" className={styles.textLink}>Request a signage quote <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>
      <CommissionCTA />
    </div>
  )
}
