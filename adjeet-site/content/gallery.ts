import { ServiceSlug } from '@/content/services'

export interface GalleryPhoto {
  id: string
  src: string
  alt: string
  service: ServiceSlug
  city: string
  year: number
  featured: boolean
}

export const photos: GalleryPhoto[] = [
  {
    id: 'gs-01',
    src: '/images/gallery/glow-sign-siliguri-01.jpg',
    alt: 'Glow sign board installed for a pharmacy on Hill Cart Road, Siliguri',
    service: 'glow-sign-boards',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'gs-02',
    src: '/images/gallery/glow-sign-jalpaiguri-01.jpg',
    alt: 'Double-sided glow sign for a clothing showroom in Jalpaiguri',
    service: 'glow-sign-boards',
    city: 'jalpaiguri',
    year: 2023,
    featured: true,
  },
  {
    id: 'acp-01',
    src: '/images/gallery/acp-siliguri-01.jpg',
    alt: 'ACP cladding and LED module signage for a bank branch in Siliguri',
    service: 'acp-led-signage',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'acp-02',
    src: '/images/gallery/acp-cooch-behar-01.jpg',
    alt: 'ACP facade with backlit logo for a telecom outlet in Cooch Behar',
    service: 'acp-led-signage',
    city: 'cooch-behar',
    year: 2023,
    featured: false,
  },
  {
    id: 'flex-01',
    src: '/images/gallery/flex-siliguri-01.jpg',
    alt: 'Large-format flex hoarding for a real estate project in Siliguri',
    service: 'flex-printing',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'flex-02',
    src: '/images/gallery/flex-malda-01.jpg',
    alt: 'Event flex banner printed and installed for a product launch in Malda',
    service: 'flex-printing',
    city: 'malda',
    year: 2023,
    featured: false,
  },
  {
    id: 'vb-01',
    src: '/images/gallery/vehicle-branding-siliguri-01.jpg',
    alt: 'Full vehicle wrap on a delivery van for an FMCG brand in Siliguri',
    service: 'vehicle-branding',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'vb-02',
    src: '/images/gallery/vehicle-branding-jalpaiguri-01.jpg',
    alt: 'Auto-rickshaw panel branding for a mobile network in Jalpaiguri',
    service: 'vehicle-branding',
    city: 'jalpaiguri',
    year: 2023,
    featured: false,
  },
  {
    id: 'fp-01',
    src: '/images/gallery/f-pole-siliguri-01.jpg',
    alt: '30-ft F-pole installation for a petrol station on NH-10, Siliguri',
    service: 'f-pole-installation',
    city: 'siliguri',
    year: 2022,
    featured: true,
  },
  {
    id: 'is-01',
    src: '/images/gallery/in-shop-siliguri-01.jpg',
    alt: 'Full in-shop branding for a telecom showroom in Siliguri',
    service: 'in-shop-branding',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'ev-01',
    src: '/images/gallery/events-siliguri-01.jpg',
    alt: 'Durga Puja pandal entrance arch and backdrop, Siliguri',
    service: 'events-and-puja',
    city: 'siliguri',
    year: 2023,
    featured: false,
  },
  {
    id: 'wp-01',
    src: '/images/gallery/wall-painting-darjeeling-01.jpg',
    alt: 'Exterior wall painting for an FMCG brand on a highway in Darjeeling district',
    service: 'wall-painting',
    city: 'darjeeling',
    year: 2023,
    featured: false,
  },
]

export function getFeaturedPhotos(): GalleryPhoto[] {
  return photos.filter(p => p.featured)
}

export function getPhotosByService(service: ServiceSlug): GalleryPhoto[] {
  return photos.filter(p => p.service === service)
}

export function getPhotosByCity(city: string): GalleryPhoto[] {
  return photos.filter(p => p.city === city)
}
