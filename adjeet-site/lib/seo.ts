import type { Metadata } from 'next'
import { services, type Service } from '@/content/services'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { business } from '@/lib/business'

export const siteConfig = {
  name: business.name,
  url: business.url,
  ogImage: '/Ambuja_cement_ACP-LED.png',
  description: 'Sign board makers in Siliguri since 1990: glow sign boards, ACP and 3D LED letters, flex printing and vehicle branding for North Bengal and Sikkim.',
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
    title: service.seoTitle,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
  })
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}/#business`,
    name: siteConfig.name,
    // "Jeet" alone resolves to unrelated people, so spell out the variants
    // buyers and directories use for the same business.
    alternateName: ['ADJEET', 'AD-JEET', 'Ad Jeet Siliguri'],
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
    knowsAbout: services.flatMap(service => [service.name, ...service.alternateNames]),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Signage, printing and outdoor advertising services',
      itemListElement: services.map(service => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service.name, url: `${siteConfig.url}/services/${service.slug}` },
      })),
    },
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
    alternateName: service.alternateNames,
    description: location?.description ?? service.answer,
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
