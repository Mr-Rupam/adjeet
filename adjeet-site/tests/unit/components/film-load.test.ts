import { describe, expect, it } from 'vitest'
import { keptLazy, wantedCopy } from '@/components/film/story'

// The film loads ahead only the copy of a picture for the visitor's theme and
// screen shape, chosen by rule, since a chapter the browser skips has no boxes.

const doc = new DOMParser().parseFromString(`
  <div class="ch">
    <img id="plain">
    <picture class="day"><img id="day"></picture>
    <picture class="night"><img id="night"></picture>
    <div class="tall-only"><img id="tall"><span class="night"><img id="tall-night"></span></div>
    <div class="wide-only"><img id="wide"></div>
  </div>`, 'text/html')
const pick = (dark: boolean, wide: boolean) =>
  [...doc.querySelectorAll('img')].filter(img => wantedCopy(img, { dark, wide })).map(img => img.id)

describe('keptLazy', () => {
  // The work wall's later photographs stay lazy at page load (data-keep-lazy)
  // and are released, in document order, once their chapter (or the one
  // before it) is shown.
  const wall = new DOMParser().parseFromString(`
    <section class="ch" id="work">
      <img id="a" loading="lazy">
      <img id="b" loading="lazy" data-keep-lazy>
      <picture class="night"><img id="c" loading="lazy" data-keep-lazy></picture>
      <div class="wide-only"><img id="d" loading="lazy" data-keep-lazy></div>
      <img id="e" loading="eager" data-keep-lazy>
      <img id="f" class="pl" loading="lazy" data-keep-lazy>
      <img id="g" loading="lazy" data-keep-lazy>
    </section>`, 'text/html')
  const ids = (dark: boolean, wide: boolean) => keptLazy(wall.getElementById('work')!, { dark, wide }).map(img => img.id)

  it('takes the kept-lazy pictures of the right copy, in document order', () => {
    expect(ids(false, false)).toEqual(['b', 'g'])
    expect(ids(true, true)).toEqual(['b', 'c', 'd', 'g'])
  })
  it('leaves out pictures already eager, plain lazy ones and depth planes', () => {
    expect(ids(true, true)).not.toContain('a')
    expect(ids(true, true)).not.toContain('e')
    expect(ids(true, true)).not.toContain('f')
  })
})

describe('wantedCopy', () => {
  it('takes the day and tall copies in the light theme on a tall screen', () => {
    expect(pick(false, false)).toEqual(['plain', 'day', 'tall'])
  })
  it('takes the night and wide copies in the dark theme on a wide screen', () => {
    expect(pick(true, true)).toEqual(['plain', 'night', 'wide'])
  })
  it('combines both rules', () => {
    expect(pick(true, false)).toEqual(['plain', 'night', 'tall', 'tall-night'])
    expect(pick(false, true)).toEqual(['plain', 'day', 'wide'])
  })
})
