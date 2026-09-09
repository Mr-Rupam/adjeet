import type { Metadata } from 'next'
import { HomePageView } from '@/components/home/HomePageView'

export const metadata: Metadata = {
  title: 'AD JEET: North Bengal Signage & Outdoor Advertising',
  description:
    'Signage, print and outdoor branding from Siliguri for businesses across North Bengal since 1990.',
  alternates: { canonical: 'https://adjeet.in' },
}

export default function HomePage() {
  return (
    <HomePageView />
  )
}
