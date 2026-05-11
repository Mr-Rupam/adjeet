import { ServiceSlug } from '@/content/services'
import { CitySlug } from '@/content/cities'

export interface GalleryPhoto {
  id: string
  src: string
  alt: string
  service: ServiceSlug
  city: CitySlug
  year: number
  featured: boolean
}

export const photos: GalleryPhoto[] = [
  {
    id: 'gs-acc',
    src: '/Acc.png',
    alt: 'Glow sign board for ACC Cement installed by AD-JEET',
    service: 'glow-sign-boards',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'acp-ambuja',
    src: '/Ambuja_cement_ACP-LED.png',
    alt: 'ACP and LED signage for Ambuja Cement fabricated by AD-JEET',
    service: 'acp-led-signage',
    city: 'jalpaiguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'gs-gates',
    src: '/Gates.png',
    alt: 'Glow sign board for Gates branding executed by AD-JEET',
    service: 'glow-sign-boards',
    city: 'darjeeling',
    year: 2023,
    featured: true,
  },
  {
    id: 'vb-srmb',
    src: '/SRMB_vechile.png',
    alt: 'SRMB vehicle branding wrap on a delivery truck by AD-JEET',
    service: 'vehicle-branding',
    city: 'malda',
    year: 2024,
    featured: true,
  },
  {
    id: 'gs-airtel',
    src: '/airtel.png',
    alt: 'Airtel glow sign board installation in Cooch Behar by AD-JEET',
    service: 'glow-sign-boards',
    city: 'cooch-behar',
    year: 2024,
    featured: true,
  },

]

export function getFeaturedPhotos(): GalleryPhoto[] {
  return photos.filter(p => p.featured)
}

export function getPhotosByService(service: ServiceSlug): GalleryPhoto[] {
  return photos.filter(p => p.service === service)
}

export function getPhotosByCity(city: CitySlug): GalleryPhoto[] {
  return photos.filter(p => p.city === city)
}
