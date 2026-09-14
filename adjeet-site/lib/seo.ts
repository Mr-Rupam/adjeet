import type { Metadata } from 'next'
import type { Service } from '@/content/services'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { business } from '@/lib/business'

export const siteConfig = {
  name: business.name,
  url: business.url,
  ogImage: '/Ambuja_cement_ACP-LED.png',
  description: 'Signage and outdoor advertising in Siliguri since 1990. Glow sign boards, ACP & LED signage, flex printing and vehicle branding across North Bengal.',
}

export function buildPageMetadata({ title, description, path }: {
  title: string
  description: string
  path: string
}): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`
  const url = path === '/' ? siteConfig.url : siteConfig.url + path
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle, description, url, siteName: siteConfig.name,
      type: 'website', locale: 'en_IN',
      images: [{ url: siteConfig.ogImage, alt: 'Ambuja Cement ACP and LED signage by AD JEET' }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [siteConfig.ogImage] },
  }
}

// Defense in depth: escape `<` so a stray `</script>` inside JSON-LD can never
// break out of the inline script tag, even if user-controllable strings ever
// flow into a schema object. Use this on every dangerouslySetInnerHTML JSON-LD.
export function jsonLdString(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c')
}

export function generateServiceMetadata(service: Service): Metadata {
  return buildPageMetadata({
    title: `${service.name} in Siliguri`,
    description: `${service.name} from AD JEET in Siliguri. Compare materials, plan your project and request a quote for work across North Bengal.`,
    path: `/services/${service.slug}`,
  })
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}/#business`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: business.phone,
    email: business.email,
    logo: siteConfig.url + business.logo,
    image: siteConfig.url + siteConfig.ogImage,
    foundingDate: String(business.foundingYear),
    founder: { '@type': 'Person', name: business.founder },
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.office,
      addressLocality: business.city,
      addressRegion: business.region,
      postalCode: business.postalCode,
      addressCountry: 'IN',
    },
    areaServed: COVERAGE_AREAS.map(a => a.name),
  }
}

export function buildServiceJsonLd(service: Service, location?: { city: string; path: string; description: string }) {
  const url = siteConfig.url + (location?.path ?? `/services/${service.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    url,
    name: location ? `${service.name} in ${location.city}` : service.name,
    description: location?.description ?? service.description,
    provider: { '@id': `${siteConfig.url}/#business` },
    areaServed: location ? [location.city] : COVERAGE_AREAS.map(a => a.name),
    serviceType: service.name,
  }
}

export function buildFaqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: siteConfig.url + item.url,
    })),
  }
}
