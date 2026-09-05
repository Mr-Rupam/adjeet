import type { Metadata } from 'next'
import { StreetHero } from '@/components/street/StreetHero'
import { ClientStreet } from '@/components/street/ClientStreet'
import { ServicesBoard } from '@/components/street/ServicesBoard'
import { NightWork } from '@/components/street/NightWork'
import { StandardPlates } from '@/components/street/StandardPlates'
import { CoverageBoard } from '@/components/street/CoverageBoard'
import { CommissionCTA } from '@/components/street/CommissionCTA'

export const metadata: Metadata = {
  title: 'AD JEET: North Bengal Signage & Outdoor Advertising',
  description:
    "North Bengal's most trusted signage company. Glow signs, ACP/LED, flex printing, vehicle branding, F-pole installation across Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, Malda.",
  alternates: { canonical: 'https://adjeet.in' },
}

export default function HomePage() {
  return (
    <>
      <StreetHero />
      <ClientStreet />
      <ServicesBoard />
      <NightWork />
      <StandardPlates />
      <CoverageBoard />
      <CommissionCTA />
    </>
  )
}
