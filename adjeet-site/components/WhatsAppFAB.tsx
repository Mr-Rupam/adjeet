'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

type FilmState = { path: string; playing: boolean; hidden: boolean }

/** Where the home film is, read from what its engine writes on <html> (components/film/story.ts). */
function readFilm(path: string): FilmState {
  const root = document.documentElement
  const chapter = root.getAttribute('data-film-ch')
  const playing = root.classList.contains('story') && chapter !== null && chapter !== 'after'
  // Off in the hero and the finale (they hold their own gold action), in the
  // proof (its photographs' captions run to the screen's edge, and its ledger
  // has its own gold action), during a light handoff, and while a chapter's
  // own gold action is on screen.
  const hidden = chapter === 'hero' || chapter === 'finale' || chapter === 'proof' || !root.classList.contains('settled') || root.classList.contains('has-cta')
  return { path, playing, hidden }
}

/**
 * A single mobile enquiry dock. It appears only after the home hero leaves
 * view and stays off the contact page, where the form and direct methods are
 * already in reach. This avoids competing mobile floating actions.
 *
 * While the home film plays it is a small square in the bottom right corner,
 * which every chapter leaves clear, and it follows the film rather than the
 * page's actions: hidden in the hero, the proof and the finale, during a light handoff,
 * and whenever a chapter's own gold action is on screen. After the film it is
 * the usual dock again.
 */
export function WhatsAppFAB() {
  const pathname = usePathname()
  const [heroState, setHeroState] = useState({ path: '/', isVisible: true })
  const [enquiryState, setEnquiryState] = useState({ path: '/', isVisible: false })
  const [filmState, setFilmState] = useState<FilmState>({ path: '/', playing: false, hidden: true })
  const isHome = pathname === '/'
  const heroIsVisible = heroState.path === pathname ? heroState.isVisible : true

  useEffect(() => {
    if (!isHome) return

    const hero = document.getElementById('hero-section')
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => setHeroState({ path: pathname, isVisible: entry.isIntersecting }),
      { threshold: 0 },
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [isHome, pathname])

  useEffect(() => {
    if (!isHome) return
    const update = () => setFilmState(current => {
      const next = readFilm(pathname)
      return current.path === next.path && current.playing === next.playing && current.hidden === next.hidden ? current : next
    })
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-film-ch'] })
    return () => observer.disconnect()
  }, [isHome, pathname])

  useEffect(() => {
    const visibleTargets = new Set<Element>()
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleTargets.add(entry.target)
        else visibleTargets.delete(entry.target)
      }
      setEnquiryState({ path: pathname, isVisible: visibleTargets.size > 0 })
    })
    // While the film plays its actions sit on stages that are on screen even
    // while unseen, so the film reports its own (above) and is left out here.
    // As still frames they are ordinary actions on the page.
    const playing = document.documentElement.classList.contains('story')
    document.querySelectorAll('main .cta, .site-footer').forEach(target => {
      if (!(playing && target.closest('#film'))) observer.observe(target)
    })
    return () => observer.disconnect()
  }, [pathname])

  const film = isHome && filmState.path === pathname && filmState.playing
  if (film) {
    return (
      <div className="quote-dock quote-dock--film" data-hidden={filmState.hidden ? '' : undefined}>
        <QuoteCTA source="mobile-dock" tone="yellow" label="WhatsApp your project" className="quote-dock__cta" iconOnly />
      </div>
    )
  }

  const enquiryIsVisible = enquiryState.path === pathname && enquiryState.isVisible
  const visible = pathname !== '/contact' && (!isHome || !heroIsVisible) && !enquiryIsVisible
  if (!visible) return null

  return (
    <div className="quote-dock">
      <QuoteCTA source="mobile-dock" tone="yellow" label="WhatsApp your project" className="quote-dock__cta" />
    </div>
  )
}
