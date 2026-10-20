import { describe, expect, it } from 'vitest'
import { getPhotoById, photos } from '@/content/gallery'
import { getServiceBySlug } from '@/content/services'
import { photoReference } from '@/lib/project-reference'

describe('photoReference', () => {
  it('carries the gallery id, the brand and the trade, with the recorded place', () => {
    expect(photoReference(getPhotoById('tanyamakeovers-154'))).toEqual({
      id: 'tanyamakeovers-154',
      client: 'Tanyamakeovers',
      label: 'ACP & LED Signage, Siliguri',
    })
  })

  it('names no place when the gallery records none', () => {
    expect(photoReference(getPhotoById('anchor-by-panasonic-112')).label).toBe('Glow Sign Boards')
  })

  it('accepts a hand-written label for a curated example', () => {
    expect(photoReference(getPhotoById('acc-125'), 'ACP shopfront fascia, Dalkhola').label).toBe('ACP shopfront fascia, Dalkhola')
  })

  it('only ever claims what each photo records', () => {
    for (const photo of photos) {
      const { id, client, label } = photoReference(photo)
      expect(id).toBe(photo.id)
      expect(client).toBe(photo.client)
      expect(label.startsWith(getServiceBySlug(photo.service)!.name)).toBe(true)
      if (!photo.location) expect(label).toBe(getServiceBySlug(photo.service)!.name)
    }
  })
})
