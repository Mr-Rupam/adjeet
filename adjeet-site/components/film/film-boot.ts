/**
 * Chooses the film's mode on <html> before first paint, so the page never
 * draws the stacked stills and then jumps to the pinned film. The film plays
 * (.story) unless the visitor asks for reduced motion or the URL has `?still`
 * (a test switch, as in the prototype). Without JavaScript nothing is set and
 * the stills show.
 *
 * A watchdog: if the engine has not started (window.__film, story.ts) 10 s
 * after DOMContentLoaded, .story comes off, so the visitor gets the stacked
 * stills instead of a pinned hero that never moves.
 *
 * FILM_BOOT runs inline as the hero is parsed, in the hero's existing inline
 * script (HomeHero), so the page gains no script of its own. bootFilm does the
 * same from the film's client component, for a visit that arrives by
 * client-side navigation, where no inline script runs.
 */
export const FILM_BOOT =
  "(function(h){try{var u=new URLSearchParams(location.search);" +
  "if(matchMedia('(prefers-reduced-motion: reduce)').matches||u.has('still'))return;" +
  "h.classList.add('story');" +
  "var w=function(){setTimeout(function(){if(!window.__film)h.classList.remove('story')},10000)};" +
  "document.readyState=='loading'?document.addEventListener('DOMContentLoaded',w):w()" +
  '}catch(e){}})(document.documentElement);'

export function bootFilm() {
  const h = document.documentElement
  if (h.classList.contains('story')) return
  const u = new URLSearchParams(location.search)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || u.has('still')) return
  h.classList.add('story')
}
