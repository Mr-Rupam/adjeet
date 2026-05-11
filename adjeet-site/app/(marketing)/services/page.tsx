import type { Metadata } from 'next'
import { ServicesSpecimenHero } from '@/components/sections/ServicesSpecimenHero'
import { ServicesManifesto } from '@/components/sections/ServicesManifesto'
import { ServicesCatalogue } from '@/components/sections/ServicesCatalogue'
import { OurProcess } from '@/components/sections/OurProcess'


export const metadata: Metadata = {
  title: 'Signage & Outdoor Advertising Services',
  description:
    'From glow sign boards and ACP LED signage to flex printing, vehicle branding, and events — AD-JEET delivers quality signage across North Bengal.',
  alternates: { canonical: 'https://adjeet.vercel.app/services' },
}

export default function ServicesPage() {
  return (
    <>
      <ServicesSpecimenHero />
      <ServicesManifesto />
      <ServicesCatalogue />
      <OurProcess />
    </>
  )
}
