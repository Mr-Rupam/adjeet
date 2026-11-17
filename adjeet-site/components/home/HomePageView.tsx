import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { HomeFilm } from '@/components/film/HomeFilm'
import { homeFaqs } from '@/content/home-faqs'
import styles from './Home.module.css'

/**
 * The home page: the film (components/film/HomeFilm, the hero is its first
 * chapter), then the questions, on the theme's own ground with no scroll
 * effects. The questions are the ones in content/home-faqs.ts, which also
 * feed the page's FAQ structured data.
 */
export function HomePageView() {
  return (
    <div className={styles.home} data-home-page>
      <HomeFilm />
      <section id="questions" className={`${styles.faq} film-faq`} aria-labelledby="home-faq-heading">
        <div className={styles.faqIntro}>
          <h2 id="home-faq-heading">Before you<br /><span>send the photo.</span></h2>
          <p>What we make, where we work and what to send for a quote.</p>
          <Link href="/contact" className={styles.textLink}>Request a signage quote <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className={styles.faqList}>{homeFaqs.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
      </section>
    </div>
  )
}
