import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ServiceIcon } from '@/components/icons/ServiceIcon'

const ALL_ICONS = [
  'lightbulb',
  'panels',
  'print',
  'truck',
  'paint-roller',
  'flag-pole',
  'store',
  'sparkles',
  'eye',
  'display',
]

describe('ServiceIcon', () => {
  it.each(ALL_ICONS)('renders an svg for icon "%s"', (icon) => {
    const { container } = render(<ServiceIcon icon={icon} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('returns null for an unknown icon string', () => {
    const { container } = render(<ServiceIcon icon="unknown-xyz" />)
    expect(container.firstChild).toBeNull()
  })

  it('applies the className to the wrapper span', () => {
    const { container } = render(<ServiceIcon icon="lightbulb" className="text-blue" />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('text-blue')
  })
})
