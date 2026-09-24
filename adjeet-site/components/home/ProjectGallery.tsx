import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getPhotoById } from '@/content/gallery'
import styles from './Home.module.css'

const SELECTED_WORK = [
  { id: 'captain-tmt-bar-078', label: 'Wall painting' },
  { id: 'supreme-pipe-085', label: 'Durga Puja gate' },
  { id: 'acc-102', label: 'Shop boards' },
] as const

export function ProjectGallery() {
  const projects = SELECTED_WORK.map(project => {
    const photo = getPhotoById(project.id)
    return { ...project, client: photo.client, photo }
  })

  return (
    <section id="selected-work" className={styles.work} aria-labelledby="work-heading" data-home-section>
      <div className={styles.sectionIntro} data-home-reveal>
        <div>
          <p className={styles.kicker}>01 / Selected work</p>
            <h2 id="work-heading" data-home-title>You&apos;ve probably<br /><span>seen our work.</span></h2>
        </div>
        <p>Real installations from the routes our team works every day.</p>
      </div>

      <div className={styles.workGrid}>
        {projects.map((project, index) => (
          <Link href={`/portfolio?service=${project.photo.service}`} key={project.id} className={styles.workCard} aria-label={`${project.photo.alt}. Explore all work.`} data-home-card>
            <figure>
              <div className={styles.workImage} data-home-image={index === 0 ? 'shutter' : ''} data-light-surface>
                <Image
                  src={project.photo.src}
                  alt={project.photo.alt}
                  fill
                  sizes={index === 0 ? '(max-width: 767px) calc(100vw - 40px), 62vw' : '(max-width: 767px) calc(100vw - 40px), 28vw'}
                  className={styles.coverImage}
                />
              </div>
              <figcaption data-home-caption>
                <span><strong>{project.client}</strong><small>{project.label} / North Bengal</small></span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </figcaption>
            </figure>
          </Link>
        ))}
      </div>

      <Link href="/portfolio" className={styles.textLink}>Explore our work <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </section>
  )
}
