import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebPageJsonLd, jsonLdString } from '@/lib/seo'
import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { PageMasthead } from '@/components/street/PageMasthead'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { ServicesBoard } from '@/components/street/ServicesBoard'
import { CommissionCTA } from '@/components/street/CommissionCTA'
import { SignComparison } from '@/components/sections/SignComparison'
import { BrandTeamsLink } from '@/components/sections/BrandTeamsLink'
import styles from './Services.module.css'
import { FOUNDED_YEAR } from '@/lib/coverage'

const PAGE = {
  title: "Advertising, Signage & Printing Services in Siliguri",
  description: "AD JEET's services in Siliguri: glow sign boards, ACP and 3D LED letters, flex, vehicle branding, wall painting and brand rollouts.",
  path: "/services",
}

export const metadata = buildPageMetadata(PAGE)

const webPage = buildWebPageJsonLd({ ...PAGE, type: 'CollectionPage' })

const breadcrumb = buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }])

const PROCESS = [
  {
    n: '01',
    title: 'Start with the site',
    body: 'A photo, a location, a rough size or a brand brief gives the project a place to begin.',
  },
  {
    n: '02',
    title: 'Plan the face',
    body: 'We work through materials, scale and visibility before the workshop starts making.',
  },
  {
    n: '03',
    title: 'Make it',
    body: 'Fabrication, print, finish and illumination meet in the same working process.',
  },
  {
    n: '04',
    title: 'Put it up',
    body: 'The project comes out to the site and gets fitted where people will see it.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
      <PageMasthead
        title={
          <>
            Advertising & signage.
            <br />
            <span className="text-signal">Made in Siliguri.</span>
          </>
        }
        lead={`An advertising agency in Siliguri since ${FOUNDED_YEAR}, with its own workshop and crews. From a single shopfront to a brand rollout across North Bengal and Sikkim.`}
      >
        <QuoteCTA source="services" label="WhatsApp your project" tone="yellow" />
        <Link href="/contact" className="action-quiet">Or send a project brief <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </PageMasthead>

      <ServicesBoard />

      <BrandTeamsLink />

      <SignComparison />

      {/* Process: brief to street */}
      <section className="service-process">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
          <div className={styles.processIntro}>
            <h2 className="display text-ink" style={{ fontSize: 'var(--text-display-2)' }} data-site-reveal="title">
              From place to presence.
            </h2>
            <p>Materials, print and finish meet at the bench before a sign reaches its site.</p>
          </div>

          <figure className={styles.materialFigure} data-site-reveal="media">
            <div className={styles.materialImage}>
              <Image
                src="/images/services/vinyl-acp-workshop-documentary.webp"
                alt="Material visualisation of two workers applying printed vinyl to an aluminium composite panel"
                fill
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) calc(100vw - 64px), 1216px"
              />            </div>
            <figcaption>Material visualisation. Illustrative fabrication scene, not a documented AD JEET project.</figcaption>
          </figure>

          <ol className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PROCESS.map(step => (
              <li key={step.n} className="plate p-6">
                <span aria-hidden="true" className="display block text-5xl text-signal">
                  {step.n}
                </span>
                <h3 className="display mt-4 text-2xl text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CommissionCTA />
    </>
  )
}
