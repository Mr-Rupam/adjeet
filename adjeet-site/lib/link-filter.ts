/**
 * Does this free text carry a web link?
 *
 * The enquiry message goes to the owner's email and WhatsApp, so a link in it
 * is how spam and phishing would reach him. The form asks the visitor to take
 * links out. This is spam reduction, not security: a determined sender can
 * spell a link some way no pattern catches, and Turnstile and the rate limits
 * are the real controls. What it must never do is turn away a real buyer, so
 * everything below favours ordinary writing: shop names with dots
 * ("S.K. Traders", "Pvt. Ltd."), sizes, times, and an email address the buyer
 * gives so we can reply, none of which are links.
 */

/** Spam favours these. `in`, `co` and `me` are here because they are common in India and in short links. */
const TLDS = 'com|net|org|info|biz|in|co|me|io|xyz|link|ly|top|site|online|shop|store|club|live|click|app|dev|cc|ws|gl|ru|cn|tk'

const INVISIBLE = /[­​-‍⁠﻿]/g
// "evil[.]com", "evil(.)com", "evil[dot]com", "evil(dot)com": the usual way to defang a link.
const SPELLED_DOT = /\s*(?:\[\.\]|\(\.\)|\[dot\]|\(dot\)|\{dot\})\s*/gi

// "https://", "HTTP://", "hxxp://", "http ://", "http[:]//", "ftp://", "//" after any scheme-like word.
const SCHEME = /[a-z][a-z0-9+.-]{1,20}\s?(?::|\[:\]|\(:\))\/\//i
// "www.example.com", "WWW.example.com", "www2.example.com"
const WWW = /(?:^|[^\p{L}\p{N}])www\d{0,3}\.[\p{L}\p{N}]/iu
// "example.com", "bit.ly/x", "shop.co.in", "EXAMPLE.COM". The name must start
// at a word boundary and not be the tail of an email address, and the ending
// must not run on into more letters ("sign.india" is not ".in").
const BARE = new RegExp(
  `(?:^|[^\\p{L}\\p{N}_@.-])((?:[\\p{L}\\p{N}-]+\\.)*([\\p{L}\\p{N}-]{2,}))\\.(${TLDS})(?![\\p{L}\\p{N}_@-])`,
  'giu',
)

function normalise(text: string): string {
  return text
    .normalize('NFKC') // full-width letters and dots become plain ones
    .replace(/。/g, '.') // ideographic full stop
    .replace(INVISIBLE, '')
    .replace(SPELLED_DOT, '.')
}

export function containsLink(text: string): boolean {
  const plain = normalise(text)
  if (SCHEME.test(plain) || WWW.test(plain)) return true
  for (const match of plain.matchAll(BARE)) {
    const [, , label, tld] = match
    // "12.in", "2026.co": a measurement or a year with a typo, not a name.
    if (/^\d+$/.test(label)) continue
    // "board.In Siliguri": a full stop typed without its space, so the next
    // sentence starts with a capital. Only a capital followed by lowercase
    // counts, so "EXAMPLE.COM" and "example.com" are still links.
    if (/^\p{Lu}\p{Ll}+$/u.test(tld)) continue
    return true
  }
  return false
}
