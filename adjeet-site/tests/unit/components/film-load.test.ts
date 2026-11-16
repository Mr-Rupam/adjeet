import { describe, expect, it } from 'vitest'
import { wantedCopy } from '@/components/film/story'

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
