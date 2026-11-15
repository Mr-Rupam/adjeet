import Link from 'next/link'
import { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { ArrowDown } from 'lucide-react'
import { outfit } from '@/app/fonts'
import { FOUNDED_YEAR } from '@/lib/coverage'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { getServiceBySlug } from '@/content/services'
import { HeroArt, type HeroArtLayer, type HeroLight } from './HeroArt'
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

const SCENES: Record<HeroLight, { tall: string; wide: string; alt: string }> = {
  day: {
    tall: '/hero/day-street-tall.webp',
    wide: '/hero/day-street-wide.webp',
    alt: 'Visualisation: a small market street on a misty morning after rain. One shop has a lit, blank sign board over its open front, and two people have stopped to look at it',
  },
  night: {
    tall: '/hero/night-street-tall.webp',
    wide: '/hero/night-street-wide.webp',
    alt: 'Visualisation: a small market street at night after rain. Every shop is shut and dark except one, whose blank sign board is lit, and two people have stopped to look at it',
  },
}

function layer(scene: HeroLight): HeroArtLayer {
  const { tall, wide, alt } = SCENES[scene]
  // Lazy, so the browser only fetches the scene that is laid out (the other is
  // display: none). The one for the visitor's theme is preloaded below.
  // The night scene asks for 85 to keep its dark sky's long gradient smooth
  // (next.config.ts); the misty day scene needs no more than the default 75,
  // which makes it about 30% lighter. With AVIF (next.config.ts) the tall cuts
  // a phone gets are about 74 KB by day and 56 KB at night.
  const quality = scene === 'night' ? 85 : 75
  const common = { alt, quality, loading: 'lazy', fetchPriority: 'high' } as const
  const { props: { srcSet: wideSrcSet } } = getImageProps({ ...common, src: wide, width: 1672, height: 941, sizes: WIDE_SIZES })
  const { props: tallProps } = getImageProps({ ...common, src: tall, width: 941, height: 1672, sizes: TALL_SIZES })
  return { tall: tallProps, wideSrcSet: wideSrcSet ?? '', alt }
}

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
 * same place when the theme changes. The artwork is a labelled visualisation
 * (DESIGN.md), never presented as a client job; real photographs start in the
 * next section. The board in the artwork is blank: "Your shop name" is
 * decorative HTML placed on the board's own rectangle (HeroArt).
 */
export function HomeHero() {
  const layers = { day: layer('day'), night: layer('night') }
  preloadScenes(layers)

  return (
    <section id="hero-section" className={`${styles.hero} ${outfit.variable}`} aria-labelledby="home-heading">
      <script dangerouslySetInnerHTML={{ __html: preloadScript(layers) }} />
      <HeroArt layers={layers} wideScreen={WIDE_SCREEN} wideSizes={WIDE_SIZES} />

      <div className={styles.heroCopy}>
        <h1 id="home-heading" data-hero-title>Advertising{' '}<br />that gets you{' '}<br /><em>noticed.</em></h1>
        <p className={styles.heroLead} data-hero-lead>Advertising agency in Siliguri, since {FOUNDED_YEAR}.</p>
      </div>

      <div className={styles.heroActions} data-hero-actions>
        <QuoteCTA source="hero" label="WhatsApp your project" tone="yellow" />
        <a href="#selected-work" className={styles.heroMore} aria-label="See finished shopfronts">
          <span>See finished shopfronts</span><ArrowDown size={18} aria-hidden="true" />
        </a>
      </div>

      <nav className={styles.heroTrades} aria-label="Main trades">
        {MAIN_TRADES.map(slug => (
          <Link key={slug} href={'/services/' + slug}>{getServiceBySlug(slug)?.name}</Link>
        ))}
      </nav>
      <p className={styles.heroLabel} data-hero-label>Visualisation</p>
    </section>
  )
}
