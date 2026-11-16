'use client'

import { useLayoutEffect } from 'react'
import { bootFilm } from './film-boot'
import { startStory, type StopStory } from './story'

/**
 * Sets the film's mode before the browser paints (a layout effect, for a
 * visit that arrives by client-side navigation; on a full load the hero's
 * inline script has already done it), then starts the engine just after the
 * first paint on the native scroll timelines. Once the page has loaded, GSAP,
 * ScrollTrigger and Lenis are fetched (their own chunks, this page only) and
 * the engine hands over to that driver (storyboard-v2, section 3b). If they
 * fail to load the native driver stays. The teardown kills the triggers,
 * destroys Lenis and takes every listener, class and attribute off.
 */
export function FilmEngine() {
  useLayoutEffect(() => {
    const film = document.getElementById('film')
    if (!film) return
    bootFilm()
    let stop: StopStory | undefined
    let timer = 0
    let live = true
    const frame = requestAnimationFrame(() => { timer = window.setTimeout(() => { if (!stop) stop = startStory(film) }, 0) })
    const upgrade = () => {
      if (!live || !document.documentElement.classList.contains('story')) return
      Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')])
        .then(([g, st, ln]) => {
          if (!live) return
          clearTimeout(timer)
          stop?.(true)
          stop = startStory(film, { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger, Lenis: ln.default })
        })
        .catch(() => undefined)
    }
    if (document.readyState === 'complete') window.setTimeout(upgrade, 0)
    else window.addEventListener('load', upgrade, { once: true })
    return () => {
      live = false
      window.removeEventListener('load', upgrade)
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      if (stop) stop()
      else document.documentElement.classList.remove('story', 'drv-native', 'drv-js', 'drv-gsap')
    }
  }, [])
  return null
}
