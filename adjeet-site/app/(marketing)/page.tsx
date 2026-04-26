import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { ClientShowcase } from '@/components/sections/ClientShowcase'
import { ServicesIndex } from '@/components/sections/ServicesIndex'
import { TheStandard } from '@/components/sections/TheStandard'
import { SelectedWork } from '@/components/sections/SelectedWork'
import { ByTheNumbers } from '@/components/sections/ByTheNumbers'
import { WhereWeWork } from '@/components/sections/WhereWeWork'
import { CommissionSign } from '@/components/sections/CommissionSign'

export const metadata: Metadata = {
  title: 'AD-JEET — North Bengal Signage & Outdoor Advertising',
  description:
    "North Bengal's most trusted signage company. Glow signs, ACP/LED, flex printing, vehicle branding, F-pole installation across Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, Malda.",
  alternates: { canonical: 'https://adjeet.vercel.app' },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClientShowcase />
      <ServicesIndex />
      <TheStandard />
      <SelectedWork />
      <ByTheNumbers />
      <WhereWeWork />
      <CommissionSign />
    </>
  )
}
