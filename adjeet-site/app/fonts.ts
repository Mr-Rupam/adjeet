import { Anton, Inter, JetBrains_Mono } from 'next/font/google'

/**
 * Display face — Anton. The letterform of Indian street hoardings, flex
 * banners, and painted shop boards. Single weight, all caps by usage.
 */
export const anton = Anton({
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
  weight: '400',
  preload: true,
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '600'],
  preload: false,
})
