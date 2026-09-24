import { ENTRY_INTRO_COMPLETE_EVENT, ENTRY_INTRO_STORAGE_KEY } from '@/lib/entry-intro'

/** Select the first-visit intro before paint, without hiding content when JS is off. */
export function EntryIntroScript() {
  const script = `
(function(){
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.sessionStorage.getItem(${JSON.stringify(ENTRY_INTRO_STORAGE_KEY)})) return;
    window.sessionStorage.setItem(${JSON.stringify(ENTRY_INTRO_STORAGE_KEY)}, 'seen');
    document.documentElement.setAttribute('data-entry-intro', 'playing');
    document.documentElement.setAttribute('data-entry-intro-started-at', String(Date.now()));
    window.setTimeout(function(){
      if (document.documentElement.getAttribute('data-entry-intro') !== 'playing') return;
      document.documentElement.removeAttribute('data-entry-intro');
      document.documentElement.removeAttribute('data-entry-intro-started-at');
      window.dispatchEvent(new Event(${JSON.stringify(ENTRY_INTRO_COMPLETE_EVENT)}));
    }, 3000);
  } catch (_) {
    // Storage can be disabled. Leave the server-rendered page available.
  }
})();
`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
