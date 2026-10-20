import type { Metadata } from 'next'
import { services, type Service } from '@/content/services'
import { reviewedOn } from '@/content/page-reviews'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { business } from '@/lib/business'

export const siteConfig = {
  name: business.name,
  url: business.url,
  ogImage: '/images/share/ambuja-cement-acp.jpg',
  description: 'Sign board makers in Siliguri since 1990: glow sign boards, ACP and 3D LED letters, flex printing and vehicle branding for North Bengal and Sikkim.',
}

// Stable node IDs. Every page's structured data points at the same business,
// site and founder, so search engines and AI assistants read one connected
// entity instead of a separate anonymous one per page.
export const BUSINESS_ID = `${siteConfig.url}/#business`
export const WEBSITE_ID = `${siteConfig.url}/#website`
export const FOUNDER_ID = `${siteConfig.url}/about#founder`

/** The workshop gate, photographed; the About page shows the same image. */
const WORKSHOP_PHOTO = '/images/workshop/workshop-gate.webp'

/** The languages enquiries are handled in, as BCP 47 codes with their names. */
const KNOWS_LANGUAGE = [
  { '@type': 'Language', name: 'English', alternateName: 'en' },
  { '@type': 'Language', name: 'Bengali', alternateName: 'bn' },
  { '@type': 'Language', name: 'Hindi', alternateName: 'hi' },
]

/** The canonical URL for a site path, matching `alternates.canonical`. */
function canonicalUrl(path: string): string {
  return path === '/' ? siteConfig.url : siteConfig.url + path
}

/** The site-wide link preview, used by any page without a project photo of its own. */
const DEFAULT_SHARE_IMAGE = { url: siteConfig.ogImage, alt: 'Ambuja Cement ACP and LED signage by AD JEET' }

export function buildPageMetadata({ title, description, path, image, indexable = true }: {
  title: string
  description: string
  path: string
  /** The page's own project photo for link previews, as a JPEG under /images/share. */
  image?: { url: string; alt: string }
  /**
   * False for a page that is live for visitors but not yet worth indexing,
   * such as a town page below its quality gate. Links on it are still followed.
   */
  indexable?: boolean
}): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`
  const url = canonicalUrl(path)
  const share = image ?? DEFAULT_SHARE_IMAGE
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: fullTitle, description, url, siteName: siteConfig.name,
      type: 'website', locale: 'en_IN',
      images: [share],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [share.url] },
  }
}

// Defense in depth: escape `<` so a stray `</script>` inside JSON-LD can never
// break out of the inline script tag, even if user-controllable strings ever
// flow into a schema object. Use this on every dangerouslySetInnerHTML JSON-LD.
export function jsonLdString(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c')
}

export function generateServiceMetadata(service: Service, image?: { url: string; alt: string }): Metadata {
  return buildPageMetadata({
    title: service.seoTitle,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
    image,
  })
}

// Google prints the site name above each result from this schema on the home
// page; without it, results fall back to the bare domain.
export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: siteConfig.name,
    // Only the unhyphenated spelling: the brand dropped "AD-JEET", and Google
    // can show an alternate name exactly as written.
    alternateName: ['ADJEET'],
    url: `${siteConfig.url}/`,
    inLanguage: 'en-IN',
    publisher: { '@id': BUSINESS_ID },
  }
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    name: siteConfig.name,
    // "Jeet" alone resolves to unrelated people, so spell out the variants
    // buyers and directories use for the same business.
    alternateName: ['ADJEET', 'AD-JEET', 'Ad Jeet Siliguri'],
    // A differently run advertising agency with a near-identical name is
    // listed in Kolkata, with its own directory pages. Tie this entity to the
    // facts that separate them: Siliguri, the founder and the founding year.
    disambiguatingDescription: `The Siliguri sign board and outdoor advertising workshop founded in ${business.foundingYear} by ${business.founder}. Its workshop and office are both in Siliguri, West Bengal.`,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: business.phone,
    email: business.email,
    logo: siteConfig.url + business.logo,
    // A finished installation and the workshop itself, both photographed.
    image: [siteConfig.url + siteConfig.ogImage, siteConfig.url + WORKSHOP_PHOTO],
    foundingDate: String(business.foundingYear),
    founder: { '@type': 'Person', '@id': FOUNDER_ID, name: business.founder },
    // Matches the Google Business Profile listing, including its verified pin.
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.street,
      addressLocality: business.city,
      addressRegion: business.region,
      postalCode: business.postalCode,
      addressCountry: 'IN',
    },
    geo: { '@type': 'GeoCoordinates', ...business.geo },
    // The second address, as printed in the footer and on the contact page.
    location: {
      '@type': 'Place',
      name: `${siteConfig.name} office`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.office,
        addressLocality: business.city,
        addressRegion: business.region,
        postalCode: business.officePostalCode,
        addressCountry: 'IN',
      },
    },
    hasMap: business.mapsUrl,
    // Only profiles that are live and recorded in this repository. Add each
    // directory listing here once it exists (see local-listing-kit.md).
    sameAs: [business.mapsUrl],
    knowsLanguage: KNOWS_LANGUAGE,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '20:00',
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

/** A town a page serves, as schema.org reads it: the town and the state it is in. */
export interface ServedTown {
  name: string
  state: string
}

export function buildCityJsonLd(town: ServedTown) {
  return {
    '@type': 'City',
    name: town.name,
    containedInPlace: { '@type': 'State', name: town.state },
  }
}

/**
 * A trade, either across the whole coverage list (its service page) or for one
 * town (a town page, which carries one node per trade it describes). Town nodes
 * get their own `@id` per trade, because one page can describe several.
 */
export function buildServiceJsonLd(service: Service, local?: { town: ServedTown; path: string; description: string }) {
  const url = siteConfig.url + (local?.path ?? `/services/${service.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': local ? `${url}#service-${service.slug}` : `${url}#service`,
    url,
    name: local ? `${service.name} in ${local.town.name}` : service.name,
    alternateName: service.alternateNames,
    description: local?.description ?? service.answer,
    provider: { '@id': BUSINESS_ID },
    areaServed: local ? [buildCityJsonLd(local.town)] : COVERAGE_AREAS.map(a => a.name),
    serviceType: service.name,
  }
}

/** The founder as a node of his own, described only by what the About page says. */
export function buildFounderJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: business.founder,
    jobTitle: 'Founder',
    worksFor: { '@id': BUSINESS_ID },
    description: `${business.founder} founded ${siteConfig.name} in ${business.foundingYear}, at 20, starting in a small room in his own flat. He went on to build the company's own signage workshop in ${business.city}.`,
    url: `${siteConfig.url}/about`,
  }
}

export type WebPageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'

/**
 * The page itself: what it is, which site it belongs to, what it is about and
 * when its content was last reviewed. Takes the same title, description and
 * path as `buildPageMetadata`, so the node repeats the page's own metadata.
 */
export function buildWebPageJsonLd({ title, description, path, type = 'WebPage', mainEntityId, image }: {
  title: string
  description: string
  path: string
  type?: WebPageType
  /** `@id` of the node the page is mainly about, e.g. a Service. Defaults to the business. */
  mainEntityId?: string
  /** Site path of the page's main photograph. */
  image?: string
}) {
  const url = canonicalUrl(path)
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: `${title} | ${siteConfig.name}`,
    description,
    inLanguage: 'en-IN',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': BUSINESS_ID },
    mainEntity: { '@id': mainEntityId ?? BUSINESS_ID },
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: siteConfig.url + image } } : {}),
    dateModified: reviewedOn(path),
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
