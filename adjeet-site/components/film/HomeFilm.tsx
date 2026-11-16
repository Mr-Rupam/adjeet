import { outfit } from '@/app/fonts'
import { CHAPTERS, railLabel } from '@/content/home-film'
import { HomeHero, finaleNightLayer } from '@/components/home/HomeHero'
import { FilmBrief } from './FilmBrief'
import { FilmWorkshop } from './FilmWorkshop'
import { FilmRoad } from './FilmRoad'
import { FilmHills } from './FilmHills'
import { FilmJunction } from './FilmJunction'
import { FilmProof } from './FilmProof'
import { FilmFinale } from './FilmFinale'
import { FilmEngine } from './FilmEngine'
import './film.css'

/**
 * The home page as one film (DESIGN.md, "Home film"; storyboard of
 * 16 November 2026): the hero is chapter 0, then the brief, the workshop, the
 * road, the hills, the junction, the proof and the finale, each a sticky
 * stage whose camera the scroll moves, each leaving through a light the next
 * one opens on. Without JavaScript, or with reduced motion, every chapter is
 * one still frame with all its words and links, stacked down the page.
 */
export function HomeFilm() {
  return (
    <div className={`film ${outfit.variable}`} id="film">
      <FilmEngine />
      <nav className="rail" aria-label="Chapters">
        {CHAPTERS.map(entry => <a key={entry.id} href={`#${entry.id}`}><span>{railLabel(entry)}</span></a>)}
      </nav>
      <div className="chs">
        <HomeHero />
        <FilmBrief />
        <FilmWorkshop />
        <FilmRoad />
        <FilmHills />
        <FilmJunction />
        <FilmProof />
        <FilmFinale night={finaleNightLayer()} />
      </div>
    </div>
  )
}
