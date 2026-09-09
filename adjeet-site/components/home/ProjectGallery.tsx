import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { photos } from '@/content/gallery'
import styles from './Home.module.css'

const SELECTED_WORK = [
  { id: 'acp-ambuja', label: 'ACP & LED signage' },
  { id: 'vb-srmb', label: 'Vehicle branding' },
  { id: 'gs-acc', label: 'Glow sign board' },
] as const

export function ProjectGallery() {
  const projects = SELECTED_WORK.map(project => {
    const photo = photos.find(candidate => candidate.id === project.id)
    if (!photo) throw new Error(`Missing selected work photo: ${project.id}`)
    return { ...project, photo }
  })

  return (
    <section id="selected-work" className={styles.work} aria-labelledby="work-heading">
      <div className={styles.sectionIntro} data-home-reveal>
        <div>
          <p className={styles.kicker}>Selected work</p>
          <h2 id="work-heading">You&apos;ve probably<br />seen our work.</h2>
        </div>
        <p>Real installations from the routes our team works every day.</p>
      </div>

      <div className={styles.workGrid}>
        {projects.map((project, index) => (
          <Link href="/portfolio" key={project.id} className={`${styles.workCard} ${index === 0 ? styles.workCardLead : ''}`} data-home-reveal aria-label={`${project.photo.alt}. Explore all work.`}>
            <figure>
              <div className={styles.workImage}>
                <Image
                  src={project.photo.src}
                  alt={project.photo.alt}
                  fill
                  sizes={index === 0 ? '(max-width: 767px) calc(100vw - 40px), 62vw' : '(max-width: 767px) calc(100vw - 40px), 28vw'}
                  className={styles.coverImage}
                />
              </div>
              <figcaption>
                <span>{project.label}</span>
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
