import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

describe('Input', () => {
  it('renders a labelled text input', () => {
    render(<Input label="Your name" name="name" />)
    expect(screen.getByLabelText('Your name')).toBeTruthy()
  })

  it('shows error message when error prop set', () => {
    render(<Input label="Phone" name="phone" error="Required" />)
    expect(screen.getByText('Required')).toBeTruthy()
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
  })

  it('passes through placeholder', () => {
    render(<Input label="City" name="city" placeholder="Enter city" />)
    expect(screen.getByPlaceholderText('Enter city')).toBeTruthy()
  })
})

describe('Select', () => {
  const opts = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ]

  it('renders a labelled select', () => {
    render(<Select label="Choose" name="choice" options={opts} />)
    expect(screen.getByLabelText('Choose')).toBeTruthy()
  })

  it('renders all options', () => {
    render(<Select label="Choose" name="choice" options={opts} />)
    expect(screen.getByRole('option', { name: 'Option A' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Option B' })).toBeTruthy()
  })

  it('shows error when error prop set', () => {
    render(<Select label="Choose" name="choice" options={opts} error="Select one" />)
    expect(screen.getByText('Select one')).toBeTruthy()
  })
})
