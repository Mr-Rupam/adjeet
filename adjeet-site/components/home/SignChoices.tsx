import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import { COMPARED_BOARDS, COMPARISON_COLUMNS } from '@/content/sign-comparison'
import { getPhotoById } from '@/content/gallery'
import { getServiceBySlug, services } from '@/content/services'
import styles from './Home.module.css'

/**
 * The two signs most shopfront enquiries choose between. The facts are the
 * same records the full comparison table on /services reads, so the homepage
 * cannot drift from it; each choice is shown on a photographed job.
 */
const CHOICES = [
  { slug: 'glow-sign-boards', photo: 'havells-015' },
  { slug: 'acp-led-signage', photo: 'supreme-pipe-064' },
] as const

/** How it is lit, what it is made of, who it suits. The lead time stays on the service pages with its caveats. */
const FACT_COUNT = 3

export function SignChoices() {
  const choices = CHOICES.map(choice => {
    const board = COMPARED_BOARDS.find(item => item.slug === choice.slug)
    if (!board) throw new Error(`SignChoices: no comparison record for ${choice.slug}`)
    return { ...choice, board, photo: getPhotoById(choice.photo), service: getServiceBySlug(choice.slug) }
  })

  return (
    <section id="services" className={styles.choices} aria-labelledby="choices-heading" data-home-section>
      <div className={styles.choicesIntro}>
        <h2 id="choices-heading" data-home-title>Glow sign board<br /><span>or LED letters?</span></h2>
        <p>The two signs most shops choose between. Not sure which suits yours? Send a photo of the frontage and we will suggest options for the space.</p>
      </div>

      <div className={styles.choiceGrid}>
        {choices.map((choice, index) => (
          <article key={choice.slug} className={styles.choice} aria-labelledby={`choice-${choice.slug}`}>
            {index === 1 && <span className={styles.choiceOr} aria-hidden="true">or</span>}
            <figure className={styles.choiceMedia}>
              <div className={styles.choiceImage} data-home-image="shutter">
                <Image src={choice.photo.src} alt={choice.photo.alt} fill sizes="(max-width: 767px) 100vw, 44vw" className={styles.coverImage} />
              </div>
              <figcaption>{choice.photo.client}{choice.photo.location && <>, {choice.photo.location}</>}</figcaption>
            </figure>
            <h3 id={`choice-${choice.slug}`}>{choice.board.name}</h3>
            <dl className={styles.choiceFacts}>
              {COMPARISON_COLUMNS.slice(0, FACT_COUNT).map((column, factIndex) => (
                <div key={column}>
                  <dt>{column}</dt>
                  <dd>{choice.board.cells[factIndex]}</dd>
                </div>
              ))}
            </dl>
            <Link href={'/services/' + choice.slug} className={styles.textLink}>{choice.service?.name} <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </article>
        ))}
      </div>

      <nav className={styles.moreTrades} aria-label="More from the workshop">
        <p>Also from the workshop</p>
        <Link href="/services/flex-printing">Flex boards and banners <ArrowUpRight size={15} aria-hidden="true" /></Link>
        <Link href="/services/vehicle-branding">Vehicle branding <ArrowUpRight size={15} aria-hidden="true" /></Link>
        <Link href="/services#storefront">Every shopfront option <ArrowUpRight size={15} aria-hidden="true" /></Link>
        <Link href="/services">All {services.length} services <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </nav>
    </section>
  )
}
