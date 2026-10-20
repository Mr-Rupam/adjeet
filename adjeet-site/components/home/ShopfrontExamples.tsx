import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { getPhotoById, photos } from '@/content/gallery'
import { photoReference } from '@/lib/project-reference'
import { projectWhatsAppUrl } from '@/lib/whatsapp'
import styles from './Home.module.css'

/**
 * Three finished shopfronts, chosen for a local shop owner (DESIGN.md records
 * the selection). Each line claims only what the gallery records: a place is
 * named only where the photo's record names one.
 */
const EXAMPLES = [
  { id: 'tanyamakeovers-154', title: 'Lit studio lettering', detail: 'Siliguri', sizes: '(max-width: 767px) 100vw, (max-width: 1320px) 92vw, 1240px' },
  { id: 'acc-125', title: 'ACP shopfront fascia', detail: 'Dalkhola', sizes: '(max-width: 767px) 100vw, 40vw' },
  { id: 'anchor-by-panasonic-112', title: 'Jai Maa Anjani Electricals', detail: 'Shop board', sizes: '(max-width: 767px) 100vw, 56vw' },
] as const

export function ShopfrontExamples() {
  const examples = EXAMPLES.map(example => {
    const photo = getPhotoById(example.id)
    return { ...example, photo, reference: photoReference(photo, `${example.title}, ${example.detail}`) }
  })

  return (
    <section id="selected-work" className={styles.work} aria-labelledby="work-heading" data-home-section>
      <div className={styles.workIntro}>
        <h2 id="work-heading" data-home-title>Finished shopfronts.<br /><span>Real jobs.</span></h2>
        <p>Photographed where they went up. See one you like? Send it to us on WhatsApp and we can help you choose one for your shop.</p>
      </div>

      <ol className={styles.workList}>
        {examples.map(example => (
          <li key={example.id} className={styles.workItem} data-home-card>
            <figure>
              <div className={styles.workImage} data-home-image="shutter" data-light-surface>
                <Image
                  src={example.photo.src}
                  alt={example.photo.alt}
                  fill
                  sizes={example.sizes}
                  className={styles.coverImage}
                />
              </div>
              <figcaption className={styles.fascia}>
                <span className={styles.fasciaName}>
                  <strong>{example.photo.client}</strong>
                  <span>{example.title} · {example.detail}</span>
                </span>
                <WhatsAppLink
                  href={projectWhatsAppUrl(example.reference)}
                  source={`home-example:${example.id}`}
                  className={styles.fasciaAsk}
                >
                  <WhatsAppIcon />
                  <span>Ask about a sign like this</span>
                  <span className="sr-only">: {example.photo.client}, {example.title}</span>
                </WhatsAppLink>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>

      <Link href="/portfolio" className={styles.textLinkLight}>See all {photos.length} project photographs <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </section>
  )
}
