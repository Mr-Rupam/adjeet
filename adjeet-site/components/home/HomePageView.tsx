import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { CoverageMapProvider } from '@/components/coverage/CoverageMapContext'
import { CoveragePlaceList } from '@/components/coverage/CoveragePlaceList'
import { CoverageStage } from '@/components/coverage/CoverageStage'
import { HomeHero } from './HomeHero'
import { ShopfrontExamples } from './ShopfrontExamples'
import { SignChoices } from './SignChoices'
import { ProcessStory } from './ProcessStory'
import { HomeMotion } from '@/components/motion/HomeMotion'
import { ClientStreet } from '@/components/street/ClientStreet'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { BrandTeamsLink } from '@/components/sections/BrandTeamsLink'
import { homeFaqs } from '@/content/home-faqs'
import styles from './Home.module.css'

export function HomePageView() {
  return (
    <div className={styles.home} data-home-page>
      <HomeMotion />
      <HomeHero />
      <ShopfrontExamples />
      <ClientStreet />
      <BrandTeamsLink />
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
