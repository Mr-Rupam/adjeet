import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { ProofBlock } from '@/components/sections/ProofBlock'
import { GalleryTeaser } from '@/components/sections/GalleryTeaser'
import { TrustBand } from '@/components/sections/TrustBand'

export const metadata: Metadata = {
  title: 'AD-JEET — North Bengal Signage & Outdoor Advertising',
  description:
    "North Bengal's most trusted signage company. Glow signs, ACP/LED, flex printing, vehicle branding, F-pole installation across Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, Malda.",
  alternates: { canonical: 'https://adjeet.in' },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <ProofBlock />
      <GalleryTeaser />
      <TrustBand />
    </>
  )
}
