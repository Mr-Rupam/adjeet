import { STORAGE_KEY } from '@/lib/theme'

// Inlined script runs synchronously before React hydration — prevents theme flash.
// Must remain a Server Component (no 'use client') so it emits raw <script>.
export function ThemeScript() {
  const script = `
(function(){
  var pref = localStorage.getItem('${STORAGE_KEY}') || 'system';
  var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  var resolved = pref === 'system' ? sys : pref;
  document.documentElement.setAttribute('data-theme', resolved);
})();
`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
