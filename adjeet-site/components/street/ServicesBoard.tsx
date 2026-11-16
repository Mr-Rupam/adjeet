import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { services, type ServiceSlug } from '@/content/services'
import { getPhotoById, type GalleryPhoto } from '@/content/gallery'
import { FasciaCaption } from './FasciaCaption'
import { ALSO_SERVICES, jobDaysLabel } from '@/content/company-figures'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'

/** One honest line each: what to send, with no invented site, size, town or client. */
const ALSO_LINES: Record<(typeof ALSO_SERVICES)[number], string> = {
  'Exhibitions and dealer meets': 'Tell us the venue, the dates and what the stall or stage needs.',
  'Activations and road shows': 'Tell us the towns, the dates and the route.',
}

const GROUPS: Array<{ id: string; title: string; note: string; photo: GalleryPhoto; slugs: ServiceSlug[] }> = [
  { id: 'storefront', title: 'Your storefront', note: 'Make the first impression from the street.', photo: getPhotoById('anchor-by-panasonic-114'), slugs: ['glow-sign-boards', 'acp-led-signage', 'one-way-vision'] },
  { id: 'campaign', title: 'Your next campaign', note: 'Take a message beyond one address.', photo: getPhotoById('srmb-143'), slugs: ['flex-printing', 'vehicle-branding', 'wall-painting', 'f-pole-installation'] },
  { id: 'space-event', title: 'Your space or event', note: 'Bring the whole place into the picture.', photo: getPhotoById('anchor-by-panasonic-111'), slugs: ['in-shop-branding', 'events-and-puja', 'product-display'] },
]

export function ServicesBoard() {
  return (
    <section className="service-catalogue field-container" id="services">
      <div className="service-catalogue-intro"><p>Choose what you&apos;re planning. We&apos;ll help with the materials, dimensions and details.</p></div>
      {/* The first group's photo sits in the opening screen on phones, where it
          is the page's largest paint, so it alone is preloaded. */}
      {GROUPS.map((group, index) => <section id={group.id} key={group.id} className="service-group" aria-labelledby={group.id + '-title'}>
        <div className="service-group-heading"><h2 id={group.id + '-title'}>{group.title}</h2><p>{group.note}</p><figure className="service-group-figure"><div className="service-group-photo"><Image src={group.photo.src} alt={group.photo.alt} fill preload={index === 0} sizes="(max-width: 767px) 100vw, 35vw" /></div><FasciaCaption photo={group.photo} size="sm" /></figure></div>
        <ol>{group.slugs.map(slug => {
          const service = services.find(s => s.slug === slug)!
          const fromOrder = jobDaysLabel(slug) ? ' from the order' : ''
          return <li key={slug}><Link href={'/services/' + slug} className="service-row"><span><strong>{service.name}</strong><small>{service.tagline}</small><span className="service-timing">{service.turnaround}{fromOrder}</span></span><ArrowUpRight size={22} aria-hidden="true" /></Link></li>
        })}</ol>
      </section>)}
      {/* Done, with no page or photographs yet: named, with one honest line and a WhatsApp action each. */}
      <section id="also-done" className="service-group" aria-labelledby="also-done-title">
        <div className="service-group-heading"><h2 id="also-done-title">Also from AD JEET</h2><p>Outdoor media and on-ground work for campaigns and events. Send the details on WhatsApp.</p></div>
        <ol>{ALSO_SERVICES.map(name => (
          <li key={name}><WhatsAppLink href={defaultWhatsAppUrl({ service: name.toLowerCase() })} source="services:also-done" className="service-row"><span><strong>{name}</strong><small>{ALSO_LINES[name]}</small></span><ArrowUpRight size={22} aria-hidden="true" /></WhatsAppLink></li>
        ))}</ol>
      </section>
    </section>
  )
}
