import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import styles from './Home.module.css'

/**
 * What to send, how the price is worked out, and who makes the sign. Every
 * sentence restates guidance the site already publishes (the home FAQs and
 * the sign comparison), so no step promises a time or a price.
 */
const PROCESS_STEPS = [
  {
    title: 'Send a photo of your shop.',
    body: 'Add your town, a rough size and when you need it. Not sure of the size? Send the photo anyway.',
  },
  {
    title: 'Choose the sign. Get the quote.',
    body: 'We work through the artwork, material, size and lighting with you. Most boards are quoted by area in square feet, then adjusted for the material, lighting, artwork, quantity and installation access.',
  },
  {
    title: 'We make it. We fit it.',
    body: 'Fabrication and printing happen at our Siliguri workshop, then installation is coordinated for the agreed site and scope.',
  },
] as const

export function ProcessStory() {
  return (
    <section id="how-it-works" className={styles.process} aria-labelledby="process-heading">
      <div className={styles.processInner}>
        <h2 id="process-heading" className={styles.processHeading} data-home-title>From a photo<br />of your shop<br /><span>to a fitted sign.</span></h2>
        <div className={styles.processLayout}>
          <figure className={styles.processMedia}>
            <div className={styles.processMediaFrame} data-home-image="shutter">
              <Image
                src="/images/workshop/workshop-gate.webp"
                alt="The AD JEET workshop gate in Siliguri, with the company sign on the front wall"
                fill
                sizes="(max-width: 1023px) 100vw, 46vw"
                className={styles.coverImage}
              />
            </div>
            <figcaption>The AD JEET workshop, Siliguri. Site photograph.</figcaption>
          </figure>
          <div className={styles.processCopy}>
            <ol data-home-process>
              {PROCESS_STEPS.map((step, index) => (
                <li key={step.title} data-home-step>
                  <span aria-hidden="true">{index + 1}</span>
                  <div><h3>{step.title}</h3><p>{step.body}</p></div>
                </li>
              ))}
            </ol>
            <div className={styles.processActions}>
              <QuoteCTA source="home-process" label="Send a photo on WhatsApp" tone="yellow" />
              <Link href="/contact" className={styles.textLinkLight}>Or send a project brief <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
