import type { Metadata } from 'next'
import type { Service } from '@/content/services'

export const siteConfig = {
  name: 'AD-JEET',
  url: 'https://adjeet.vercel.app',
  ogImage: '/og-image.jpg',
  description: "North Bengal's most trusted signage and outdoor advertising partner since 1990.",
}

export function generateServiceMetadata(service: Service): Metadata {
  return {
    title: `${service.name} in North Bengal`,
    description: `${service.tagline}. Serving Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, Malda.`,
    alternates: { canonical: `/services/${service.slug}` },
  }
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: '+919832011524',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Platinum Square',
      addressLocality: 'Siliguri',
      addressRegion: 'West Bengal',
      postalCode: '734001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.7271,
      longitude: 88.3953,
    },
    areaServed: ['Siliguri', 'Jalpaiguri', 'Cooch Behar', 'Darjeeling', 'Malda'],
  }
}

export function buildServiceJsonLd(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: { '@type': 'LocalBusiness', name: siteConfig.name },
    areaServed: ['Siliguri', 'Jalpaiguri', 'Cooch Behar', 'Darjeeling', 'Malda'],
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
