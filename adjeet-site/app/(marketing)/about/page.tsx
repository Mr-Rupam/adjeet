import Image from 'next/image'
import type { Metadata } from 'next'
import { buildBreadcrumbJsonLd, jsonLdString, siteConfig } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { COVERAGE_AREAS, FOUNDED_YEAR } from '@/lib/coverage'

export const metadata: Metadata = {
  title: 'About AD JEET: North Bengal Signage Since 1990',
  description: 'AD JEET has made signage, print and outdoor branding from Siliguri since 1990.',
  alternates: { canonical: `${siteConfig.url}/about` },
}

const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
])

const WORK_IMAGES = [
  { src: '/Ambuja_cement_ACP-LED.png', alt: 'ACP and LED signage for Ambuja Cement fabricated by AD JEET' },
  { src: '/SRMB_vechile.png', alt: 'SRMB vehicle branding wrap by AD JEET' },
  { src: '/airtel.png', alt: 'Airtel glow sign board installation by AD JEET' },
]

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />

      <PageMasthead
        meta={[`Since ${FOUNDED_YEAR}`, 'Siliguri', 'North Bengal']}
        title={<>A name earns its<br /><span className="text-signal">place in the street.</span></>}
        lead="AD JEET has worked from Siliguri since 1990. The work is simple to describe: make the business visible where people actually move."
      />

      <section className="border-b border-rule bg-paper">
        <div className="mx-auto grid max-w-content gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:py-24">
          <div>
            <p className="spec text-signal">The point of the work</p>
            <h2 className="display mt-3 text-ink" data-reveal-text style={{ fontSize: 'var(--text-display-2)' }}>
              A sign should make the next look easier.
            </h2>
          </div>
          <div className="space-y-5 text-[1.05rem] leading-relaxed text-ink-muted" data-site-reveal="body">
            <p>A shopfront, a vehicle, an event entrance or a roadside surface all ask the same question: will the right person notice this when they pass?</p>
            <p>That question shapes the size, material, light and placement. It is why the first useful thing to share is usually a photo of the site.</p>
            <p>From there, AD JEET helps turn an idea into a physical piece of work that belongs to the street around it.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-paper-elevated">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="spec text-signal">Seen in the wild</p>
              <h2 className="display mt-3 text-ink" data-reveal-text style={{ fontSize: 'var(--text-display-2)' }}>Work is the clearest introduction.</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3 md:gap-6">
            {WORK_IMAGES.map((image, index) => (
              <figure key={image.src} className={index === 1 ? 'sm:mt-10' : ''} data-site-reveal="media">
                <div className="relative aspect-[4/5] overflow-hidden bg-night">
                  <Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) calc(100vw - 40px), 30vw" className="object-cover" />
                </div>
                <figcaption className="spec mt-3 text-ink-subtle">Documented project photograph</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-paper">
        <div className="mx-auto grid max-w-content gap-10 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:py-24">
          <div>
            <p className="spec text-signal">The route out</p>
            <h2 className="display mt-3 text-ink" data-reveal-text style={{ fontSize: 'var(--text-display-2)' }}>Siliguri is the base.<br />North Bengal is the route.</h2>
          </div>
          <ul className="m-0 grid list-none grid-cols-2 border-t border-rule p-0 sm:grid-cols-3">
            {COVERAGE_AREAS.map(area => (
              <li key={area.name} className="min-h-14 border-b border-rule px-3 py-4 text-sm text-ink-muted">
                {area.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CommissionCTA />
    </>
  )
}
