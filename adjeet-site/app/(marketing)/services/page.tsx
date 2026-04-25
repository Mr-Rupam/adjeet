import type { Metadata } from 'next'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { Button } from '@/components/ui/Button'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Signage & Outdoor Advertising Services',
  description:
    'From glow sign boards and ACP LED signage to flex printing, vehicle branding, and events — AD-JEET delivers quality signage across North Bengal.',
  alternates: { canonical: 'https://adjeet.in/services' },
}

export default function ServicesPage() {
  const waUrl = defaultWhatsAppUrl()
  return (
    <>
      {/* Compact hero */}
      <section className="flex items-end min-h-[40vh] bg-surface-inverse py-16">
        <div className="mx-auto max-w-content px-6">
          <h1 className="text-[var(--text-display-2)] font-[var(--font-fraunces)] font-bold text-white mb-4">
            Our Services
          </h1>
          <p className="text-white/75 max-w-xl">
            Glow signs · ACP/LED · Flex printing · Vehicle branding · Wall painting · F-pole · In-shop branding · Events · One-way vision · Product display
          </p>
        </div>
      </section>

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
