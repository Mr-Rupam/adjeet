import localFont from 'next/font/local'

/**
 * Local font files keep the workshop's first paint independent of a third
 * party request. Barlow Condensed has the tall, painted proportion of a
 * street sign; Hind Siliguri keeps project details calm and legible on a
 * phone.
 */
export const barlowCondensed = localFont({
  src: [
    { path: './fonts/BarlowCondensed-Medium.ttf', weight: '500', style: 'normal' },
    { path: './fonts/BarlowCondensed-SemiBold.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-barlow-condensed',
  display: 'swap',
  preload: true,
})

export const hindSiliguri = localFont({
  src: [
    { path: './fonts/HindSiliguri-Regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/HindSiliguri-Medium.ttf', weight: '500', style: 'normal' },
  ],
  variable: '--font-hind-siliguri',
  display: 'swap',
  preload: true,
})
