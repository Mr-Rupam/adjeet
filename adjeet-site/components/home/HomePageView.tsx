import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { FOUNDED_YEAR } from '@/lib/coverage'
import { CoverageMapProvider } from '@/components/coverage/CoverageMapContext'
import { CoveragePlaceList } from '@/components/coverage/CoveragePlaceList'
import { CoverageStage } from '@/components/coverage/CoverageStage'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { HeroScene } from './HeroScene'
import { ProjectGallery } from './ProjectGallery'
import { ProcessStory } from './ProcessStory'
import { HomeMotion } from '@/components/motion/HomeMotion'
import { ClientStreet } from '@/components/street/ClientStreet'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { homeFaqs } from '@/content/home-faqs'
import { services } from '@/content/services'
import { getPhotoById } from '@/content/gallery'
import styles from './Home.module.css'

const GROUPS = [
  { id: 'storefront', title: 'Your storefront', detail: 'Glow signs · ACP & LED · Window graphics', photo: getPhotoById('havells-015') },
  { id: 'campaign', title: 'Your next campaign', detail: 'Flex · Vehicle branding · Wall painting · F-poles', photo: getPhotoById('toptech-tmt-047') },
  { id: 'space-event', title: 'Your space or event', detail: 'In-shop branding · Events · Product displays', photo: getPhotoById('toptech-tmt-040') },
]
export function HomePageView() {
  return (
    <div className={styles.home} data-home-page>
      <HomeMotion />
      <section id="hero-section" className={styles.hero} aria-labelledby="home-heading">
        <div className={styles.heroCopy}>
          <p className={styles.kicker} data-hero-meta><span className={styles.dot} /> Siliguri, North Bengal · Est. {FOUNDED_YEAR}</p>
          <h1 id="home-heading" data-hero-title>Sign boards{' '}<br />that get you{' '}<br /><span>noticed.</span></h1>
          <div className={styles.heroDescription} data-hero-lead>
            <p>Glow signs, ACP &amp; LED letters, print and outdoor branding. Designed, fabricated and installed from our Siliguri workshop.</p>
          </div>
          <div className={styles.heroActions} data-hero-actions>
            <QuoteCTA source="hero" label="WhatsApp your project" tone="yellow" />
            <a href="#selected-work" className={styles.textLink} aria-label="Explore the work"><span>Explore the work</span><ArrowDown size={18} aria-hidden="true" /></a>
          </div>
        </div>
        <div className={styles.heroProject} data-light-surface>
          <Image src="/Ambuja_cement_ACP-LED.png" alt="Ambuja Cement illuminated storefront signage by AD JEET" fill preload sizes="(max-width: 1023px) 100vw, 54vw" className={styles.coverImage} data-hero-image />
          <span className={styles.heroShade} aria-hidden="true" />
          <span className={styles.projectTag}>Out in the world <ArrowUpRight size={19} aria-hidden="true" /></span>
          <Link href="/portfolio?service=acp-led-signage" className={styles.heroProjectCaption} aria-label="Explore Ambuja Cement ACP and LED signage" data-hero-caption><span><strong>Ambuja Cement</strong><span>ACP &amp; LED signage</span></span><span className={styles.roundArrow}><ArrowUpRight aria-hidden="true" /></span></Link>
        </div>
      </section>
      <div className={styles.factStrip} aria-label="AD JEET at a glance">
        <span data-home-fact><strong>Since 1990</strong> A signmaking story</span>
        <span data-home-fact><strong>10 services</strong> One working team</span>
        <span data-home-fact><strong>North Bengal</strong> Based in Siliguri</span>
      </div>
      <ProjectGallery />
      <ClientStreet />
      <section id="services" className={styles.services} aria-labelledby="services-heading" data-home-section>
        <div className={styles.sectionIntro}>
          <div><p className={styles.kicker}>02 / What we make</p><h2 id="services-heading" data-home-title>Signage, print<br /><span>&amp; branding.</span></h2></div>
          <div><p>A new shopfront. A campaign on the move. An event that needs to feel like you. Start with where your name belongs.</p><Link href="/services" className={styles.textLink}>All 10 services <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
        <div className={styles.serviceGroups}>
          {GROUPS.map((group, index) => (
            <Link key={group.id} href={'/services#' + group.id} className={styles.serviceGroup} data-home-service>
              <div className={styles.serviceImage} data-home-image data-light-surface><Image src={group.photo.src} alt={group.photo.alt} fill sizes="(max-width: 767px) 100vw, 33vw" className={styles.coverImage} /><span>0{index + 1}</span></div>
              <div className={styles.serviceTitle}><h3>{group.title}</h3><ArrowUpRight size={24} aria-hidden="true" /></div><p>{group.detail}</p>
            </Link>
          ))}
        </div>
        <nav aria-label="Explore signage and advertising services" className={styles.serviceLinks}>
          {services.map(service => <Link href={'/services/' + service.slug} key={service.slug}>{service.name}<ArrowUpRight size={15} aria-hidden="true" /></Link>)}
        </nav>
      </section>
      <section className={styles.workshop} aria-labelledby="workshop-heading">
        <div className={styles.workshopMedia} data-home-workshop-media><HeroScene /><span className={styles.workshopCaption}>AD JEET workshop, Siliguri. · Workshop visualisation</span></div>
        <div className={styles.workshopCopy} data-home-workshop-copy>
          <p className={styles.kicker}>03 / The people behind the signs</p>
          <h2 id="workshop-heading" data-home-title>A place to<br /><span>make it happen.</span></h2>
          <p>In 1990, Ranjit Das started AD JEET in one room. Today, our own workshop in Siliguri brings the work together, from the first drawing to the final fitting.</p>
          <Link href="/about" className={styles.textLink}>Meet AD JEET <ArrowUpRight size={18} aria-hidden="true" /></Link>
          <p className={styles.sceneNote}>Try the day / night switch in the navigation.</p>
        </div>
      </section>
      <ProcessStory />
      <section className={styles.coverage} aria-labelledby="coverage-heading">
        <CoverageMapProvider>
          <div className={styles.coverageCopy}>
            <p className={styles.kicker}>05 / Local knowledge. Regional reach.</p>
            <h2 id="coverage-heading" data-home-title>Made in Siliguri.<br /><span>Seen across<br />North Bengal.</span></h2>
            <p>From hill roads to high streets, we help businesses put their name in the right place. Pick your town to start a quote.</p>
            <CoveragePlaceList />
            <Link href="/contact" className={styles.textLink}>Tell us your location <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          <div className={styles.coverageMap} data-home-map>
            <CoverageStage caption="Coverage is approximate, not a fixed boundary." />
          </div>
        </CoverageMapProvider>
      </section>
      <section className={styles.faq} aria-labelledby="home-faq-heading" data-home-section>
        <div className={styles.sectionIntro}><div><p className={styles.kicker}>06 / Before we start</p><h2 id="home-faq-heading" data-home-title>Your signage<br /><span>questions, answered.</span></h2></div><p>What we make, where we work and what to send for a quote.</p></div>
        <div className={styles.faqList}>{homeFaqs.map(faq => <details key={faq.q} data-home-faq><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
        <Link href="/contact" className={styles.textLink}>Request a signage quote <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>
      <CommissionCTA />
    </div>
  )
}
