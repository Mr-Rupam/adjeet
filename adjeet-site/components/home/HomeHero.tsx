import Link from 'next/link'
import type { CSSProperties } from 'react'
import { preload } from 'react-dom'
import { DEFAULT_SHOP_NAME, SKIP_LABEL, chapter, railLabel, stopsAttr } from '@/content/home-film'
import { FILM_BOOT } from '@/components/film/film-boot'
import { PLANES, Planes } from '@/components/film/planes'
import { ArrowDown } from 'lucide-react'
import { outfit } from '@/app/fonts'
import { FOUNDED_YEAR } from '@/lib/coverage'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { getServiceBySlug } from '@/content/services'
import { ThemeScene } from './ThemeScene'
import { buildSceneLayers, type SceneLayer as HeroArtLayer, type SceneLight as HeroLight } from './theme-scene-layers'
import styles from './Home.module.css'

/** The four trades most enquiries are about, named and linked from the hero (desktop). */
const MAIN_TRADES = ['glow-sign-boards', 'acp-led-signage', 'flex-printing', 'vehicle-branding'] as const

/**
 * Where the hero switches from the tall cut to the wide one. The same query is
 * in Home.module.css (it cannot be imported there), so change both together.
 */
const WIDE_SCREEN = '(min-width: 1024px) and (min-aspect-ratio: 5/4)'

// The tall cut spans the full width. The wide cut is as tall as the hero, so
// it is drawn about 1.78 times the screen's height across.
const TALL_SIZES = '100vw'
const WIDE_SIZES = '178vh'

// The night scene asks for 85 to keep its dark sky's long gradient smooth
// (next.config.ts); the misty day scene needs no more than the default 75,
// which makes it about 30% lighter. With AVIF (next.config.ts) the tall cuts
// a phone gets are about 74 KB by day and 56 KB at night.
const SCENES = {
  day: {
    tall: '/hero/day-street-tall.webp',
    wide: '/hero/day-street-wide.webp',
    alt: 'Visualisation: a small market street on a misty morning after rain. One shop has a lit, blank sign board over its open front, and two people have stopped to look at it',
    quality: 75,
  },
  night: {
    tall: '/hero/night-street-tall.webp',
    wide: '/hero/night-street-wide.webp',
    alt: 'Visualisation: a small market street at night after rain. Every shop is shut and dark except one, whose blank sign board is lit, and two people have stopped to look at it',
    quality: 85,
  },
}

/**
 * Lazy, so the browser only fetches the scene that is laid out (the other is
 * display: none), at high priority, because the scene is the page's largest
 * paint. The one for the visitor's theme is preloaded below.
 */
const sceneLayers = () => buildSceneLayers({
  scenes: SCENES,
  tallWidth: 941,
  tallHeight: 1672,
  wideWidth: 1672,
  wideHeight: 941,
  tallSizes: TALL_SIZES,
  wideSizes: WIDE_SIZES,
  highPriority: true,
})

/**
 * The night scene for the film's finale, which returns to this street: the
 * same files and sizes as the hero's, so a visitor in the dark theme already
 * has it, but at normal priority since it is far below the fold.
 */
export const finaleNightLayer = () => buildSceneLayers({
  scenes: SCENES,
  tallWidth: 941,
  tallHeight: 1672,
  wideWidth: 1672,
  wideHeight: 941,
  tallSizes: TALL_SIZES,
  wideSizes: WIDE_SIZES,
}).night

/**
 * Preload the one image a visitor on the system theme will see, from <head>:
 * the scene for the system colour scheme in the cut for this screen, picked by
 * each preload's `media`. React places these links ahead of the stylesheets,
 * so the request starts with the fonts instead of after the CSS has arrived
 * (an inline script in the body only runs once the stylesheets are in, which
 * cost more than a second on a phone). Every first visit is on the system
 * theme. The tall cut's query is the wide one negated (Media Queries 4), so
 * exactly one of the four matches.
 */
function preloadScenes(layers: Record<HeroLight, HeroArtLayer>) {
  const cuts = [
    { media: WIDE_SCREEN, srcSet: (scene: HeroLight) => layers[scene].wideSrcSet, sizes: WIDE_SIZES },
    { media: `(not (${WIDE_SCREEN}))`, srcSet: (scene: HeroLight) => layers[scene].tall.srcSet ?? '', sizes: TALL_SIZES },
  ]
  for (const scene of ['day', 'night'] as const) {
    const scheme = `(prefers-color-scheme: ${scene === 'night' ? 'dark' : 'light'})`
    for (const cut of cuts) {
      preload(String(layers[scene].tall.src), {
        as: 'image',
        imageSrcSet: cut.srcSet(scene),
        imageSizes: cut.sizes,
        fetchPriority: 'high',
        media: `${scheme} and ${cut.media}`,
      })
    }
  }
}

/**
 * A visitor who chose the theme opposite to the system's (ThemeScript has set
 * it on <html> from localStorage) needs the other scene, which the server
 * cannot know. This runs inline as the hero is parsed and preloads it then.
 */
function preloadScript(layers: Record<HeroLight, HeroArtLayer>) {
  const sets = {
    day: [[layers.day.tall.srcSet, TALL_SIZES], [layers.day.wideSrcSet, WIDE_SIZES]],
    night: [[layers.night.tall.srcSet, TALL_SIZES], [layers.night.wideSrcSet, WIDE_SIZES]],
  }
  return `(function(){try{
var sets=${JSON.stringify(sets)};
var scene=document.documentElement.getAttribute('data-theme')==='dark'?'night':'day';
var system=window.matchMedia('(prefers-color-scheme: dark)').matches?'night':'day';
if(scene===system)return;
var pick=sets[scene][window.matchMedia(${JSON.stringify(WIDE_SCREEN)}).matches?1:0];
var link=document.createElement('link');
link.rel='preload';link.as='image';
link.setAttribute('imagesrcset',pick[0]);link.setAttribute('imagesizes',pick[1]);
link.setAttribute('fetchpriority','high');link.setAttribute('data-hero-preload',scene);
document.head.appendChild(link);
}catch(_){}})();`
}

/**
 * The home page hero, chosen by the owner's side on 15 November 2026: a market
 * street where one shop's sign board is the thing you notice, by day in the
 * light theme and at night after rain in the dark theme, changing light in the
 * same place when the theme changes. The artwork is a visualisation: since
 * 16 November 2026 it carries no visible label, its alt text begins
 * "Visualisation:" and it is never presented as a client job (DESIGN.md); real
 * photographs start in the film's work chapter. The board in the artwork is
 * blank: "Your shop name" is decorative HTML placed on the board's own
 * rectangle (ThemeScene), which the film letters with the visitor's name.
 *
 * Since 16 November 2026 it is chapter 0 of the home film (DESIGN.md, "Home
 * film"): at rest it is exactly this hero; as the visitor scrolls, the words
 * lift away and the camera pushes into the lit board until its light fills
 * the screen (components/film/film.css). Its first paint is unchanged: the
 * same image request, the same preloads, and the one inline script it always
 * had, which now also picks the film's mode before paint (film-boot.ts).
 */
export function HomeHero() {
  const layers = sceneLayers()
  preloadScenes(layers)
  const entry = chapter('hero')

  return (
    <section
      className="ch"
      id="hero"
      style={{ '--len': entry.len, '--still': entry.still } as CSSProperties}
      data-title={railLabel(entry)}
      data-rest={entry.rest}
      data-stops={stopsAttr(entry.stops)}
      data-dur={entry.dur}
      aria-labelledby="home-heading"
    >
      <div className="stage hero-stage" data-tone="page" data-tone-at=".78" data-tone-late="light">
        <div id="hero-section" className={`${styles.hero} hero-frame ${outfit.variable}`}>
          <script dangerouslySetInnerHTML={{ __html: preloadScript(layers) + FILM_BOOT }} />
          <ThemeScene
            layers={layers}
            wideScreen={WIDE_SCREEN}
            wideSizes={WIDE_SIZES}
            wideWidth={1672}
            wideHeight={941}
            className={`${styles.heroArt} hero-art tl`}
            imageAttribute="data-hero-image"
            rootAttribute="data-hero-light"
          >
            {/* Depth for the push: three planes over the scene while it moves (planes.tsx). */}
            <Planes stack={PLANES.hero} at={0.003} off={0.9} />
            <span className={`${styles.heroBoard} hero-face tl`} aria-hidden="true" data-hero-board data-name><span>{DEFAULT_SHOP_NAME}</span></span>
            <i className="glow hero-glow tl" aria-hidden="true" />
          </ThemeScene>

          <div className={`${styles.heroCopy} hero-copy tl`}>
            <h1 id="home-heading" data-hero-title>Advertising{' '}<br />that gets you{' '}<br /><em>noticed.</em></h1>
            <p className={styles.heroLead} data-hero-lead>Advertising agency in Siliguri, since {FOUNDED_YEAR}.</p>
          </div>

          <div className={`${styles.heroActions} hero-actions tl`} data-hero-actions>
            <QuoteCTA source="hero" label="WhatsApp your project" tone="yellow" />
            {/* The way past the film: straight to the real work. */}
            <a href="#work" className={styles.heroMore} aria-label={SKIP_LABEL}>
              <span>{SKIP_LABEL}</span><ArrowDown size={18} aria-hidden="true" />
            </a>
          </div>

          <nav className={`${styles.heroTrades} hero-trades tl`} aria-label="Main trades">
            {MAIN_TRADES.map(slug => (
              <Link key={slug} href={'/services/' + slug}>{getServiceBySlug(slug)?.name}</Link>
            ))}
          </nav>
        </div>
        <i className="bloom tl" aria-hidden="true" />
        <i className="flash tl" aria-hidden="true" />
      </div>
    </section>
  )
}
