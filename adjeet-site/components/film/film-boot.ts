/**
 * Chooses the film's mode on <html> before first paint, so the page never
 * draws the stacked stills and then jumps to the pinned film. The film plays
 * unless the visitor asks for reduced motion; the scroll timeline drives it
 * where the browser has one, requestAnimationFrame elsewhere. Without
 * JavaScript nothing is set and the stills show.
 *
 * Two test switches in the URL, as in the prototype: `?still` shows the still
 * frames, `?driver=js` forces the requestAnimationFrame driver.
 *
 * FILM_BOOT runs inline as the hero is parsed, in the hero's existing inline
 * script (HomeHero), so the page gains no script of its own. bootFilm does the
 * same from the film's client component, for a visit that arrives by
 * client-side navigation, where no inline script runs.
 */
export const FILM_BOOT =
  "(function(h){try{var u=new URLSearchParams(location.search);" +
  "if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!u.has('still'))" +
  "h.classList.add('story',u.get('driver')!='js'&&CSS.supports('animation-timeline:view()')?'drv-native':'drv-js')" +
  '}catch(e){}})(document.documentElement);'

export function bootFilm() {
  const h = document.documentElement
  if (h.classList.contains('story')) return
  const u = new URLSearchParams(location.search)
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || u.has('still')) return
  h.classList.add('story', u.get('driver') !== 'js' && CSS.supports('animation-timeline:view()') ? 'drv-native' : 'drv-js')
}
