import localFont from 'next/font/local'

/**
 * Local font files keep the workshop's first paint independent of a third
 * party request. Barlow Condensed has the tall, painted proportion of a
 * street sign; Hind Siliguri keeps project details calm and legible on a
 * phone.
 *
 * The site loads Latin-only WOFF2 subsets, 76KB for all four files against
 * 729KB for the full TTFs. Hind Siliguri's TTFs are mostly Bengali glyphs,
 * which no page uses, and every page preloaded all four, which cost phones on
 * slow connections several seconds. The TTFs stay alongside as the masters.
 * Regenerate a subset after changing a master, or when a page starts using a
 * new script (Bengali copy would need Hind Siliguri's full character set):
 *
 *   python -m fontTools.subset <name>.ttf --flavor=woff2 --layout-features='*' \
 *     --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+20B9,U+2122,U+2190-21FF,U+2212,U+2215,U+2016,U+25AA,U+25B6,U+26A0,U+2713,U+2715,U+FEFF,U+FFFD" \
 *     --output-file=<name>.woff2
 */
export const barlowCondensed = localFont({
  src: [
    { path: './fonts/BarlowCondensed-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/BarlowCondensed-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-barlow-condensed',
  display: 'swap',
  preload: true,
})

export const hindSiliguri = localFont({
  src: [
    { path: './fonts/HindSiliguri-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/HindSiliguri-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-hind-siliguri',
  display: 'swap',
  preload: true,
})
