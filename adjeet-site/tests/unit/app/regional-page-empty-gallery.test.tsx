import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProgrammaticPage from '@/app/(programmatic)/[slug]/page'

// All five trades on the regional pages have photographs today, so the page's
// no-photos branch cannot be reached from the real gallery. It becomes live the
// moment a trade without photographs joins PROG_SERVICES, and a section that
// silently disappears is worse than a sentence explaining itself. Emptying the
// gallery is the only way to see that branch render.
vi.mock('@/content/gallery', async importOriginal => ({
  ...(await importOriginal<typeof import('@/content/gallery')>()),
  getPhotosByService: () => [],
}))
vi.mock('@/components/sections/LeadForm', () => ({ LeadForm: () => <div data-testid="lead-form" /> }))
vi.mock('@/components/PageViewTracker', () => ({ ProgrammaticPageTracker: () => null }))

describe('regional page with no photographs for the trade', () => {
  it('explains the missing gallery and still offers a way to see the work', async () => {
    const html = renderToStaticMarkup(
      await ProgrammaticPage({ params: Promise.resolve({ slug: 'glow-sign-board-in-darjeeling' }) }),
    )
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const empty = doc.querySelector('.regional-gallery-empty')
    expect(empty).not.toBeNull()
    expect(empty!.textContent).toContain('We are photographing recent glow sign boards work.')

    // The CTA's `programmatic-nophotos:` analytics source is passed to an
    // onClick and never reaches the markup, so only the destination is checkable
    // here. See the test plan: the source needs an interaction test.
    expect(doc.querySelector('.regional-gallery-empty a')?.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//)

    // The empty state replaces the strip; it never renders alongside it, and it
    // must not carry the "photographed elsewhere" note, which would be a lie.
    expect(doc.body.textContent).not.toContain('More in the portfolio')
    expect(doc.body.textContent).not.toContain('We have not photographed')
    // The rest of the page is unaffected.
    expect(doc.querySelector('[data-testid="lead-form"]')).not.toBeNull()
    expect(doc.querySelectorAll('.regional-chip:not(.regional-chip--quiet)')).toHaveLength(3)
  })
})
