import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { SignComparison } from '@/components/sections/SignComparison'
import { COMPARED_BOARDS, COMPARED_SLUGS, COMPARISON_COLUMNS } from '@/content/sign-comparison'
import { getServiceBySlug, SERVICE_SLUGS } from '@/content/services'

describe('shopfront comparison content', () => {
  it('compares real services and reads each lead time from its spec sheet', () => {
    for (const board of COMPARED_BOARDS) {
      expect(SERVICE_SLUGS).toContain(board.slug)
      expect(board.cells).toHaveLength(COMPARISON_COLUMNS.length)
      expect(board.cells.at(-1)).toBe(getServiceBySlug(board.slug)!.turnaround)
    }
    expect(COMPARED_SLUGS).toEqual(COMPARED_BOARDS.map(board => board.slug))
  })

  it('makes no price, count or guarantee claim the site does not already make', () => {
    const text = COMPARED_BOARDS.flatMap(board => board.cells).join(' ')
    expect(text).not.toMatch(/₹|rs\.?\s?\d|per sq|guarantee|warrant|\d+\s*(years?|%)/i)
  })
})

describe('SignComparison', () => {
  it('renders one real table row per board, every fact labelled by its column', () => {
    render(<SignComparison />)
    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(COMPARED_BOARDS.length)
    rows.forEach((row, index) => {
      const cells = within(row).getAllByRole('cell')
      expect(cells.map(cell => cell.getAttribute('data-label'))).toEqual([...COMPARISON_COLUMNS])
      expect(cells.map(cell => cell.textContent)).toEqual([...COMPARED_BOARDS[index].cells])
    })
  })

  it("links every board to its service page, except the page it is on", () => {
    render(<SignComparison current="acp-led-signage" />)
    expect(screen.getByRole('link', { name: 'Glow sign board' })).toHaveAttribute('href', '/services/glow-sign-boards')
    expect(screen.getByRole('link', { name: 'Flex board or banner' })).toHaveAttribute('href', '/services/flex-printing')
    expect(screen.queryByRole('link', { name: 'ACP board with 3D LED letters' })).toBeNull()
    expect(screen.getByText('ACP board with 3D LED letters')).toHaveAttribute('aria-current', 'page')
  })

  it('is headed as the question buyers ask', () => {
    render(<SignComparison />)
    expect(screen.getByRole('heading', { level: 2, name: 'Glow sign board, ACP board or flex?' })).toBeInTheDocument()
  })
})
