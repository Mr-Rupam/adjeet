import { ENTRY_INTRO_COMPLETE_EVENT, ENTRY_INTRO_FALLBACK_MS, ENTRY_INTRO_STORAGE_KEY } from '@/lib/entry-intro'

/**
 * Select the entry shutter before paint, without hiding content when JS is off.
 *
 * It plays once per browser session, and only when that session's first page
 * is the homepage itself. Every other page marks the session as seen without
 * playing it, so arriving on a service or regional page never shows the
 * shutter, and nor does reaching the homepage from one later. Client-side
 * navigation never re-runs this script.
 *
 * The shutter is an overlay: the page underneath, the hero photo included,
 * loads and paints at full priority while it plays.
 */
export function EntryIntroScript() {
  const script = `
(function(){
  try {
    if (window.sessionStorage.getItem(${JSON.stringify(ENTRY_INTRO_STORAGE_KEY)})) return;
    window.sessionStorage.setItem(${JSON.stringify(ENTRY_INTRO_STORAGE_KEY)}, 'seen');
    if (window.location.pathname !== '/') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.setAttribute('data-entry-intro', 'playing');
    document.documentElement.setAttribute('data-entry-intro-started-at', String(Date.now()));
    window.setTimeout(function(){
      if (document.documentElement.getAttribute('data-entry-intro') !== 'playing') return;
      document.documentElement.removeAttribute('data-entry-intro');
      document.documentElement.removeAttribute('data-entry-intro-started-at');
      window.dispatchEvent(new Event(${JSON.stringify(ENTRY_INTRO_COMPLETE_EVENT)}));
    }, ${ENTRY_INTRO_FALLBACK_MS});
  } catch (_) {
    // Storage can be disabled. Leave the server-rendered page available.
  }
})();
`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
