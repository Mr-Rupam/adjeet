import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { services, type ServiceSlug } from '@/content/services'

const GROUPS: Array<{ id: string; title: string; note: string; image: string; alt: string; slugs: ServiceSlug[] }> = [
  { id: 'storefront', title: 'Your storefront', note: 'Make the first impression from the street.', image: '/Ambuja_cement_ACP-LED.png', alt: 'Ambuja Cement shopfront signage by AD JEET', slugs: ['glow-sign-boards', 'acp-led-signage', 'one-way-vision'] },
  { id: 'campaign', title: 'Your next campaign', note: 'Take a message beyond one address.', image: '/SRMB_vechile.png', alt: 'SRMB branded delivery vehicle', slugs: ['flex-printing', 'vehicle-branding', 'wall-painting', 'f-pole-installation'] },
  { id: 'space-event', title: 'Your space or event', note: 'Bring the whole place into the picture.', image: '/Gates.png', alt: 'Anchor by Panasonic branded entrance for Durga Puja', slugs: ['in-shop-branding', 'events-and-puja', 'product-display'] },
]

export function ServicesBoard() {
  return (
    <section className="service-catalogue field-container" id="services">
      <div className="service-catalogue-intro"><span className="spec">All ten services / Three ways to start</span><p>Choose what you&apos;re planning. We&apos;ll help with the materials, dimensions and details.</p></div>
      {GROUPS.map((group, index) => <section id={group.id} key={group.id} className="service-group" aria-labelledby={group.id + '-title'}>
        <div className="service-group-heading"><span className="spec text-signal">0{index + 1}</span><h2 id={group.id + '-title'}>{group.title}</h2><p>{group.note}</p><div className="service-group-photo"><Image src={group.image} alt={group.alt} fill sizes="(max-width: 767px) 100vw, 35vw" /></div></div>
        <ol>{group.slugs.map(slug => {
          const service = services.find(s => s.slug === slug)!
          return <li key={slug}><Link href={'/services/' + slug} className="service-row"><span><strong>{service.name}</strong><small>{service.tagline}</small><span className="service-timing">{service.turnaround}</span></span><ArrowUpRight size={22} aria-hidden="true" /></Link></li>
        })}</ol>
      </section>)}
    </section>
  )
}
