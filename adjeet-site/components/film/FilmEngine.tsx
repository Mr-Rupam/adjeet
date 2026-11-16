'use client'

import { useLayoutEffect } from 'react'
import { bootFilm } from './film-boot'
import { startStory, type StopStory } from './story'

/**
 * Sets the film's mode before the browser paints (a layout effect, for a
 * visit that arrives by client-side navigation; on a full load the hero's
 * inline script has already done it), then starts the engine and its stepper
 * just after the first paint. The teardown takes every listener, class and
 * attribute off.
 */
export function FilmEngine() {
  useLayoutEffect(() => {
    const film = document.getElementById('film')
    if (!film) return
    bootFilm()
    let stop: StopStory | undefined
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
