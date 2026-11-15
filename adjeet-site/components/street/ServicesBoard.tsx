import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { services, type ServiceSlug } from '@/content/services'
import { getPhotoById, type GalleryPhoto } from '@/content/gallery'
import { FasciaCaption } from './FasciaCaption'

const GROUPS: Array<{ id: string; title: string; note: string; photo: GalleryPhoto; slugs: ServiceSlug[] }> = [
  { id: 'storefront', title: 'Your storefront', note: 'Make the first impression from the street.', photo: getPhotoById('anchor-by-panasonic-114'), slugs: ['glow-sign-boards', 'acp-led-signage', 'one-way-vision'] },
  { id: 'campaign', title: 'Your next campaign', note: 'Take a message beyond one address.', photo: getPhotoById('srmb-143'), slugs: ['flex-printing', 'vehicle-branding', 'wall-painting', 'f-pole-installation'] },
  { id: 'space-event', title: 'Your space or event', note: 'Bring the whole place into the picture.', photo: getPhotoById('anchor-by-panasonic-111'), slugs: ['in-shop-branding', 'events-and-puja', 'product-display'] },
]

export function ServicesBoard() {
  return (
    <section className="service-catalogue field-container" id="services">
      <div className="service-catalogue-intro"><p>Choose what you&apos;re planning. We&apos;ll help with the materials, dimensions and details.</p></div>
      {GROUPS.map(group => <section id={group.id} key={group.id} className="service-group" aria-labelledby={group.id + '-title'}>
        <div className="service-group-heading"><h2 id={group.id + '-title'}>{group.title}</h2><p>{group.note}</p><figure className="service-group-figure"><div className="service-group-photo"><Image src={group.photo.src} alt={group.photo.alt} fill sizes="(max-width: 767px) 100vw, 35vw" /></div><FasciaCaption photo={group.photo} size="sm" /></figure></div>
        <ol>{group.slugs.map(slug => {
          const service = services.find(s => s.slug === slug)!
          return <li key={slug}><Link href={'/services/' + slug} className="service-row"><span><strong>{service.name}</strong><small>{service.tagline}</small><span className="service-timing">{service.turnaround}</span></span><ArrowUpRight size={22} aria-hidden="true" /></Link></li>
        })}</ol>
      </section>)}
    </section>
  )
}
