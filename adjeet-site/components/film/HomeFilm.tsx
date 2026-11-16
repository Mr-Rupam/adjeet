import { outfit } from '@/app/fonts'
import { CHAPTERS, filmLength, filmStops, railLabel } from '@/content/home-film'
import { HomeHero, finaleNightLayer } from '@/components/home/HomeHero'
import { FilmBrands } from './FilmBrands'
import { FilmWork } from './FilmWork'
import { FilmBrief } from './FilmBrief'
import { FilmWorkshop } from './FilmWorkshop'
import { FilmRoad } from './FilmRoad'
import { FilmHills } from './FilmHills'
import { FilmJunction } from './FilmJunction'
import { FilmFinale } from './FilmFinale'
import { FilmEngine } from './FilmEngine'
import { vars } from './parts'
import './film.css'

/**
 * The home page as one film (DESIGN.md, "Home film"; storyboard of
 * 16 November 2026 and its second version): the hero is chapter 0, then the
 * proof (the brands, then the real photographs), then the brief, the
 * workshop, the road, the hills, the junction and the finale, all stacked in
 * one pinned screen whose picture follows the page's scroll, each chapter
 * leaving through a light the next one opens on. The page scrolls natively;
 * one marker per stop below carries the stop's place and data for the engine. Without JavaScript, or with
 * reduced motion, every chapter is one still frame with all its words and
 * links, stacked down the page.
 */
export function HomeFilm() {
  const stops = filmStops()
  // Each stop's scroll distance in screens: the running sum of dy.
  const ys = stops.map((_, k) => stops.slice(0, k + 1).reduce((sum, stop) => sum + stop.dy, 0))
  return (
    <div className={`film ${outfit.variable}`} id="film" style={vars({ '--film-len': +filmLength(stops).toFixed(4) })}>
      <FilmEngine />
      <nav className="rail" aria-label="Chapters">
        {CHAPTERS.map(entry => <a key={entry.id} href={`#${entry.id}`}><span>{railLabel(entry)}</span></a>)}
      </nav>
      <div className="chs">
        <HomeHero />
        <FilmBrands />
        <FilmWork />
        <FilmBrief />
        <FilmWorkshop />
        <FilmRoad />
        <FilmHills />
        <FilmJunction />
        <FilmFinale night={finaleNightLayer()} />
      </div>
      {stops.map((stop, k) => (
        <i
          key={stop.i}
          className={stop.gate ? 'film-stop gate' : 'film-stop'}
          aria-hidden="true"
          style={vars({ '--y': +ys[k].toFixed(4) })}
          data-i={stop.i}
          data-ch={stop.ch}
          data-p={stop.p}
          data-ms={stop.ms}
          data-gate={stop.gate ? '' : undefined}
        />
      ))}
    </div>
  )
}
