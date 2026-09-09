<<<<<<< HEAD
=======
'use client'

import { useState } from 'react'
>>>>>>> origin/main
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { photos } from '@/content/gallery'
<<<<<<< HEAD
import styles from './Home.module.css'

const SELECTED_WORK = [
  { id: 'acp-ambuja', label: 'ACP & LED signage' },
  { id: 'vb-srmb', label: 'Vehicle branding' },
  { id: 'gs-acc', label: 'Glow sign board' },
] as const

export function ProjectGallery() {
=======
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import styles from './Home.module.css'

const SELECTED_WORK = [
  { id: 'acp-ambuja', label: 'ACP & LED signage', aspectRatio: '1024 / 1024' },
  { id: 'vb-srmb', label: 'Vehicle branding', aspectRatio: '1184 / 864' },
  { id: 'gs-acc', label: 'Glow sign board', aspectRatio: '1344 / 768' },
] as const

export function ProjectGallery() {
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
>>>>>>> origin/main
  const projects = SELECTED_WORK.map(project => {
    const photo = photos.find(candidate => candidate.id === project.id)
    if (!photo) throw new Error(`Missing selected work photo: ${project.id}`)
    return { ...project, photo }
  })
<<<<<<< HEAD

  return (
    <section id="selected-work" className={styles.work} aria-labelledby="work-heading">
      <div className={styles.sectionIntro} data-home-reveal>
        <div>
          <p className={styles.kicker}>Selected work</p>
          <h2 id="work-heading">You&apos;ve probably<br />seen our work.</h2>
=======
  const lightboxPhotos: LightboxPhoto[] = projects.map(project => project.photo)

  function openProject(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <section id="selected-work" className={styles.work} aria-labelledby="work-heading">
      <div className={styles.sectionIntro}>
        <div>
          <p className={styles.kicker}>Selected work</p>
          <h2 id="work-heading" data-reveal-text>You&apos;ve probably<br />seen our work.</h2>
>>>>>>> origin/main
        </div>
        <p>Real installations from the routes our team works every day.</p>
      </div>

      <div className={styles.workGrid}>
        {projects.map((project, index) => (
<<<<<<< HEAD
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
=======
          <button type="button" key={project.id} className={`${styles.workCard} ${index === 0 ? styles.workCardLead : ''}`} data-featured-project={index === 0 ? 'true' : undefined} onClick={() => openProject(index)} aria-label={`View: ${project.photo.alt}`}>
            <figure>
              <div className={styles.workImage} data-reveal-image style={{ aspectRatio: project.aspectRatio }}>
                <div className={styles.workMedia} data-motion-media>
                  <Image
                    src={project.photo.src}
                    alt={project.photo.alt}
                    fill
                    sizes={index === 0 ? '(max-width: 767px) calc(100vw - 40px), 62vw' : '(max-width: 767px) calc(100vw - 40px), 28vw'}
                    className={styles.coverImage}
                  />
                </div>
>>>>>>> origin/main
              </div>
              <figcaption>
                <span>{project.label}</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </figcaption>
            </figure>
<<<<<<< HEAD
          </Link>
=======
          </button>
>>>>>>> origin/main
        ))}
      </div>

      <Link href="/portfolio" className={styles.textLink}>Explore our work <ArrowUpRight size={18} aria-hidden="true" /></Link>
<<<<<<< HEAD
=======
      {lightboxOpen && <Lightbox photos={lightboxPhotos} initialIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
>>>>>>> origin/main
    </section>
  )
}
