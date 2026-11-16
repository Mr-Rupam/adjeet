'use client'

import { useLayoutEffect } from 'react'
import { bootFilm } from './film-boot'
import { startStory } from './story'

/**
 * Sets the film's mode before the browser paints (a layout effect, for a
 * visit that arrives by client-side navigation; on a full load the hero's
 * inline script has already done it), then starts the engine just after the
 * first paint, so the hero's picture paints before any of the engine's work.
 * At the top of the page nothing the engine sets is on screen yet. Its
 * teardown takes every listener off and every class and attribute off <html>.
 */
export function FilmEngine() {
  useLayoutEffect(() => {
    const film = document.getElementById('film')
    if (!film) return
    bootFilm()
    let stop: (() => void) | undefined
    let timer = 0
    const frame = requestAnimationFrame(() => { timer = window.setTimeout(() => { stop = startStory(film) }, 0) })
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      if (stop) stop()
      else document.documentElement.classList.remove('story', 'drv-native', 'drv-js')
    }
  }, [])
  return null
}
