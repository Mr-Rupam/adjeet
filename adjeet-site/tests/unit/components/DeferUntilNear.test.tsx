import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { DeferUntilNear } from '@/components/ui/DeferUntilNear'

type Callback = (entries: { isIntersecting: boolean }[]) => void

/** A stand-in IntersectionObserver the test can trigger by hand. */
function installObserver() {
  const observers: { callback: Callback; options?: IntersectionObserverInit }[] = []
  class FakeObserver {
    constructor(callback: Callback, options?: IntersectionObserverInit) { observers.push({ callback, options }) }
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  return observers
}

afterEach(() => vi.unstubAllGlobals())

describe('DeferUntilNear', () => {
  it('holds the space but renders nothing until the spot nears the viewport', () => {
    const observers = installObserver()
    const { container } = render(<DeferUntilNear reserve={{ minHeight: 140 }}><p>widget</p></DeferUntilNear>)
    expect(screen.queryByText('widget')).toBeNull()
    expect(container.firstElementChild).toHaveStyle({ minHeight: '140px' })
    expect(observers[0].options?.rootMargin).toBe('800px 0px')

    act(() => observers[0].callback([{ isIntersecting: false }]))
    expect(screen.queryByText('widget')).toBeNull()
    act(() => observers[0].callback([{ isIntersecting: true }]))
    expect(screen.getByText('widget')).toBeInTheDocument()
  })

  it('renders as soon as anything in the surrounding form takes focus', () => {
    installObserver()
    render(<form><input aria-label="Name" /><DeferUntilNear><p>widget</p></DeferUntilNear></form>)
    expect(screen.queryByText('widget')).toBeNull()
    fireEvent.focusIn(screen.getByLabelText('Name'))
    expect(screen.getByText('widget')).toBeInTheDocument()
  })

  it('stops observing and stops listening to the form once it is gone', () => {
    const disconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect = disconnect })
    const added = vi.spyOn(HTMLFormElement.prototype, 'addEventListener')
    const removed = vi.spyOn(HTMLFormElement.prototype, 'removeEventListener')
    const Harness = ({ show }: { show: boolean }) => (
      <form><input aria-label="Name" />{show && <DeferUntilNear><p>widget</p></DeferUntilNear>}</form>
    )
    const { rerender } = render(<Harness show />)
    const listener = added.mock.calls.find(([type]) => type === 'focusin')?.[1]
    expect(listener).toBeTypeOf('function')
    // The form outlives the component, so its focus listener must go with it.
    rerender(<Harness show={false} />)
    expect(disconnect).toHaveBeenCalled()
    expect(removed).toHaveBeenCalledWith('focusin', listener)
    added.mockRestore()
    removed.mockRestore()
  })

  it('renders straight away where IntersectionObserver does not exist', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<DeferUntilNear><p>widget</p></DeferUntilNear>)
    expect(screen.getByText('widget')).toBeInTheDocument()
  })
})
