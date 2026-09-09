import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import styles from './Home.module.css'

const PROCESS_STEPS = [
  { number: '01', title: 'Show us the space.', body: 'A site photo, your location and rough dimensions give us a place to start.' },
  { number: '02', title: 'Work out the details.', body: 'We help shape the artwork, size, materials and lighting around your brief.' },
  { number: '03', title: 'Make it. Install it.', body: 'Print, fabrication and finishing come together before the work goes to site.' },
] as const

/**
 * This is deliberately static markup. The illustration and every process step
 * remain readable while the motion layer is unavailable or reduced.
 */
export function ProcessStory() {
  return (
    <section id="how-it-works" className={styles.process} aria-labelledby="process-heading">
      <div className={styles.sectionIntro}>
        <div>
          <p className={styles.kicker}>How it comes together</p>
          <h2 id="process-heading" data-reveal-text>From idea<br />to installation.</h2>
        </div>
        <p>You don&apos;t need a finished brief. Start with the space and what you want people to see.</p>
      </div>
      <div className={styles.processLayout}>
        <figure className={styles.processMedia}>
          <div className={styles.processMediaFrame} data-reveal-image>
            <div className={styles.processMediaInner} data-motion-media>
              <Image
                src="/images/home/idea-to-installation.webp"
                alt="Illustration of a sign maker checking a metal letter beside an acrylic face, LEDs and a storefront sketch"
                fill
                sizes="(max-width: 1023px) calc(100vw - 40px), (max-width: 1320px) 50vw, 640px"
                className={styles.coverImage}
              />
            </div>
          </div>
          <figcaption>Workshop illustration</figcaption>
        </figure>
        <div className={styles.processCopy} data-home-reveal>
          <ol>
            {PROCESS_STEPS.map(step => (
              <li key={step.number}>
                <span aria-hidden="true">{step.number}</span>
                <div><h3>{step.title}</h3><p>{step.body}</p></div>
              </li>
            ))}
          </ol>
          <Link href="/contact" className={styles.textLink}>Start with your space <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  )
}
