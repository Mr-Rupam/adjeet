import Link from 'next/link'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { FOUNDED_YEAR } from '@/lib/coverage'
import { CoverageMapProvider } from '@/components/coverage/CoverageMapContext'
import { CoveragePlaceList } from '@/components/coverage/CoveragePlaceList'
import { CoverageStage } from '@/components/coverage/CoverageStage'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { HeroSlides, type HeroSlide } from './HeroSlides'
import { ShopfrontExamples } from './ShopfrontExamples'
import { SignChoices } from './SignChoices'
import { ProcessStory } from './ProcessStory'
import { HomeMotion } from '@/components/motion/HomeMotion'
import { ClientStreet } from '@/components/street/ClientStreet'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { homeFaqs } from '@/content/home-faqs'
import { getPhotoById } from '@/content/gallery'
import { getServiceBySlug } from '@/content/services'
import styles from './Home.module.css'

/** The four trades most enquiries are about, named and linked from the hero. */
const MAIN_TRADES = ['glow-sign-boards', 'acp-led-signage', 'flex-printing', 'vehicle-branding'] as const

// Every slide is a shopfront, and none repeats a photo used further down the
// page. The place shown is only ever the one the gallery records.
const heroSlide = (id: string, phoneFocus?: string): HeroSlide => {
  const photo = getPhotoById(id)
  return {
    src: photo.src,
    alt: photo.alt,
    client: photo.client,
    label: getServiceBySlug(photo.service)?.name ?? '',
    location: photo.location,
    href: '/portfolio?service=' + photo.service,
    phoneFocus,
  }
}
const HERO_SLIDES: HeroSlide[] = [
  heroSlide('ambuja-cement-126'),
  heroSlide('astral-pipe-129'),
  heroSlide('sd-lion-tmt-139'),
  heroSlide('acc-124'),
]

export function HomePageView() {
  return (
    <div className={styles.home} data-home-page>
      <HomeMotion />
      <section id="hero-section" className={styles.hero} aria-labelledby="home-heading">
        <div className={styles.heroCopy}>
          <h1 id="home-heading" data-hero-title>Sign boards{' '}<br />that get you{' '}<br /><span>noticed.</span></h1>
          <p className={styles.heroLead} data-hero-lead>
            <strong>Sign board makers in Siliguri, since {FOUNDED_YEAR}.</strong>{' '}
            Shopfront signs designed, made and installed from our own workshop. Send a photo of your shop to start.
          </p>
          <div className={styles.heroActions} data-hero-actions>
            <QuoteCTA source="hero" label="WhatsApp your project" tone="yellow" />
            <a href="#selected-work" className={styles.textLink} aria-label="See finished shopfronts"><span>See finished shopfronts</span><ArrowDown size={18} aria-hidden="true" /></a>
          </div>
          <nav className={styles.heroTrades} aria-label="Main trades">
            {MAIN_TRADES.map(slug => (
              <Link key={slug} href={'/services/' + slug}>{getServiceBySlug(slug)?.name}</Link>
            ))}
          </nav>
        </div>
        <HeroSlides slides={HERO_SLIDES} />
      </section>
      <ShopfrontExamples />
      <ClientStreet />
      <SignChoices />
      <ProcessStory />
      <section id="areas" className={styles.coverage} aria-labelledby="coverage-heading">
        <CoverageMapProvider>
          <div className={styles.coverageCopy}>
            <h2 id="coverage-heading" data-home-title>Made in Siliguri.<br /><span>Seen across<br />North Bengal.</span></h2>
            <p>From hill roads to high streets, we help businesses put their name in the right place. Pick your town to start a quote.</p>
            <CoveragePlaceList />
            <Link href="/areas" className={styles.textLink}>Every area we serve <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          <div className={styles.coverageMap} data-home-map>
            <CoverageStage caption="Coverage is approximate, not a fixed boundary." />
          </div>
        </CoverageMapProvider>
      </section>
      <section className={styles.faq} aria-labelledby="home-faq-heading" data-home-section>
        <div className={styles.faqIntro}>
          <h2 id="home-faq-heading" data-home-title>Before you<br /><span>send the photo.</span></h2>
          <p>What we make, where we work and what to send for a quote.</p>
          <Link href="/contact" className={styles.textLink}>Request a signage quote <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className={styles.faqList}>{homeFaqs.map(faq => <details key={faq.q} data-home-faq><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
      </section>
      <CommissionCTA />
    </div>
  )
}
