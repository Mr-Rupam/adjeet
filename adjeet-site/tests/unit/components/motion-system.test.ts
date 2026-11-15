import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEnterWatcher, holdFrom, maskedLineReveal, splitLines } from '@/components/motion/motion-system'

function heading(html: string) {
  const element = document.createElement('h2')
  element.innerHTML = html
  document.body.append(element)
  return element
}

/** Lays words out as the browser would, one line per `perLine` words. */
function layOut(perLine: number) {
  let index = 0
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const line = Math.floor(index++ / perLine)
    return { top: line * 40, height: 40, bottom: line * 40 + 40, left: 0, right: 0, width: 0, x: 0, y: line * 40, toJSON: () => ({}) } as DOMRect
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('splitLines', () => {
  it('groups words into masked lines, carries inline wrappers onto them and restores the exact original nodes', () => {
    const target = heading('Your signage project. <br><span class="text-signal">Let&apos;s talk.</span>')
    const originals = Array.from(target.childNodes)
    layOut(3)

    const { lines, revert } = splitLines(target)
    expect(lines.map(line => line.textContent)).toEqual(['Your signage project.', "Let's talk."])
    expect(lines[1].querySelector('span.text-signal')?.textContent).toBe("Let's talk.")
    expect(lines.every(line => (line.parentElement as HTMLElement).style.overflow === 'clip')).toBe(true)

    revert()
    expect(Array.from(target.childNodes)).toEqual(originals)
  })

  it('keeps every word on one line when the layout reports no geometry', () => {
    const target = heading('One plain heading')
    const { lines } = splitLines(target)
    expect(lines).toHaveLength(1)
    expect(lines[0].textContent).toBe('One plain heading')
  })
})

describe('reveals without the Web Animations API', () => {
  it('shows the element as it is and still reports completion', () => {
    const element = document.createElement('div')
    const onComplete = vi.fn()
    const reveal = holdFrom(element, { from: { opacity: 0.5 }, duration: 0.5, onComplete })
    reveal.play()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('leaves a heading exactly as it was when its lines cannot animate', () => {
    const target = heading('A conversation.<br>Then a plan.')
    const original = target.innerHTML
    maskedLineReveal(createEnterWatcher(), target)
    expect(target.innerHTML).toBe(original)
    expect(target.hasAttribute('aria-label')).toBe(false)
    expect(target.style.opacity).toBe('')
  })
})

describe('masked line reveal', () => {
  afterEach(() => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate
  })

  it('names the split heading by its rendered text while it plays, then restores it', () => {
    const playing = { cancel: vi.fn(), finished: new Promise<Animation>(() => {}) }
    HTMLElement.prototype.animate = vi.fn(() => playing as unknown as Animation)
    const target = heading('A conversation.<br>Then a plan.')
    const original = target.innerHTML

    const cleanup = maskedLineReveal(createEnterWatcher(), target)
    expect(target.getAttribute('aria-label')).toBe('A conversation. Then a plan.')
    expect(target.innerHTML).not.toBe(original)

    cleanup()
    expect(playing.cancel).toHaveBeenCalled()
    expect(target.innerHTML).toBe(original)
    expect(target.hasAttribute('aria-label')).toBe(false)
  })
})
