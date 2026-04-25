import type { Metadata } from 'next'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { ServicesSpecimenHero } from '@/components/sections/ServicesSpecimenHero'
import { Button } from '@/components/ui/Button'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Signage & Outdoor Advertising Services',
  description:
    'From glow sign boards and ACP LED signage to flex printing, vehicle branding, and events — AD-JEET delivers quality signage across North Bengal.',
  alternates: { canonical: 'https://adjeet.vercel.app/services' },
}

export default function ServicesPage() {
  const waUrl = defaultWhatsAppUrl()
  return (
    <>
      <ServicesSpecimenHero />

      {/* Full grid with taglines */}
      <ServicesGrid expanded />

      {/* CTA strip */}
      <section className="py-16 border-t border-rule">
        <div className="mx-auto max-w-content px-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/#contact" size="lg">Get a Quote</Button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded border border-ink text-ink font-medium px-7 py-3.5 text-base hover:bg-paper-elevated transition-colors active:scale-[0.98]"
          >
            WhatsApp Us
          </a>
        </div>
      </section>
    </>
  )
}
