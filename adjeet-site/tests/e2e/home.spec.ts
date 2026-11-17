import { test, expect, type Page } from '@playwright/test'
import { CHAPTERS, MALDA_BOARDS, MALDA_DAYS, MALDA_NORMAL, MALDA_ROWS, ROAD } from '../../content/home-film'
import { SERVICE_SLUGS } from '../../content/services'

// The home page since 16 November 2026: one film, the hero its first chapter
// (DESIGN.md, "Home film"), then the questions.

async function seenIntro(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('adjeet-entry-intro-v1', 'seen')
    localStorage.setItem('adjeet-consent', 'declined')
  })
}

type Film = { yAt: (ch: string, p: number) => number; now: () => { moving: boolean } }

/**
 * The engine starts after hydration, writes the current chapter on <html> and
 * publishes window.__film. With the proof first, the first chapter a test
 * scrolls to is the one right after the hero, so a scroll made before the
 * engine runs would see its beats late.
 */
async function engineReady(page: Page) {
  await page.locator('html[data-film-ch]').waitFor({ state: 'attached' })
  await page.waitForFunction(() => !!(window as unknown as { __film?: Film }).__film)
}

/**
 * Scrolls to progress p of a chapter (window.__film.yAt) and waits for the
 * film to catch up. A p between two stops shows that frame of the move.
 */
async function scrollToChapter(page: Page, id: string, p: number) {
  await engineReady(page)
  await page.evaluate(([id, p]) => {
    const film = (window as unknown as { __film: Film }).__film
    scrollTo({ top: film.yAt(id as string, p as number), behavior: 'instant' })
  }, [id, p] as const)
  await page.waitForTimeout(200)
  await moveEnded(page)
  await page.waitForTimeout(500)
  // A first visit to a chapter decodes its pictures, which can hold a beat's
  // light back on a busy machine: let the lights finish switching on.
  await page.waitForFunction(() => document.getAnimations().every(animation => !(animation instanceof CSSTransition) || animation.playState !== 'running'), undefined, { timeout: 4000 }).catch(() => {})
}

/**
 * Shows the frame at progress p of a chapter when p lies between two stops.
 * The film rests only on stops (components/film/rest.ts), so the frame is held
 * as a visitor holds it: from the stop before it, a finger down (a CDP touch),
 * the page scrolled there, the film caught up. Returns the lift.
 */
async function holdChapter(page: Page, id: string, p: number) {
  await engineReady(page)
  const before = await page.evaluate(([id, p]) => {
    const film = (window as unknown as { __film: Film & { stops: Array<{ ch: string; p: number; y: number }> } }).__film
    const y = film.yAt(id as string, p as number)
    return [...film.stops].reverse().find(stop => stop.y <= y + 1) ?? film.stops[0]
  }, [id, p] as const)
  await scrollToChapter(page, before.ch, before.p)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  const size = page.viewportSize()!
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: size.width / 2, y: size.height / 2, id: 0 }] })
  await page.evaluate(([id, p]) => {
    const film = (window as unknown as { __film: Film }).__film
    scrollTo({ top: film.yAt(id as string, p as number), behavior: 'instant' })
  }, [id, p] as const)
  await page.waitForTimeout(200)
  await moveEnded(page)
  await page.waitForTimeout(500)
  await page.waitForFunction(() => document.getAnimations().every(animation => !(animation instanceof CSSTransition) || animation.playState !== 'running'), undefined, { timeout: 4000 }).catch(() => {})
  return async () => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForTimeout(200)
    await moveEnded(page)
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false })
    await cdp.detach()
  }
}

/** Waits for the film to catch up with the scroll: not moving, and the page has not scrolled, for 600 ms. */
async function moveEnded(page: Page) {
  let last = await page.evaluate(() => scrollY)
  for (let still = 0, i = 0; still < 6 && i < 120; i++) {
    await page.waitForTimeout(100)
    const [y, moving] = await page.evaluate(() => [scrollY, (window as unknown as { __film: Film }).__film.now().moving] as const)
    still = y === last && !moving ? still + 1 : 0
    last = y
  }
}

/**
 * True when the element is what the visitor sees at its centre: on screen, not
 * faded out, and with nothing visible drawn over it. Words over a scene do not
 * take the pointer, so the hit test looks at every layer, ignoring layers that
 * are faded out.
 */
async function seen(page: Page, selector: string) {
  return page.locator(selector).first().evaluate(element => {
    const opacity = (node: Element | null) => {
      let value = 1
      for (; node; node = node.parentElement) value *= Number(getComputedStyle(node).opacity)
      return value
    }
    const rect = element.getBoundingClientRect()
    const x = Math.min(innerWidth - 2, Math.max(1, rect.left + Math.min(rect.width / 2, 20)))
    const y = rect.top + rect.height / 2
    if (y < 0 || y > innerHeight || opacity(element) < 0.5) return false
    const style = document.createElement('style')
    style.textContent = '#film, #film * { pointer-events: auto !important; }'
    document.head.append(style)
    const stack = document.elementsFromPoint(x, y)
    style.remove()
    for (const hit of stack) {
      if (element.contains(hit) || hit.contains(element)) return true
      // A light handoff fading out (under a third) still lets the words read through.
      if (opacity(hit) > 0.3 && getComputedStyle(hit).visibility !== 'hidden') {
        const box = getComputedStyle(hit)
        // A layer that paints nothing there (no background, no image, no text) does not hide it.
        const paints = box.backgroundColor !== 'rgba(0, 0, 0, 0)' || box.backgroundImage !== 'none' || hit.tagName === 'IMG' || (hit.childNodes.length > 0 && [...hit.childNodes].some(n => n.nodeType === 3 && n.textContent!.trim()))
        if (paints) return false
      }
    }
    return false
  })
}

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => { await seenIntro(page) })

  test('uses one clear hero proposition on the street scene', async ({ page }) => {
    await page.goto('/')
    const hero = page.locator('#hero-section')
    await expect(hero.getByRole('heading', { level: 1, name: /advertising that gets you noticed/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(hero.getByText('Advertising agency in Siliguri, since 1990.', { exact: true })).toBeVisible()
    await expect(hero.getByRole('img', { name: /^visualisation: a small market street on a misty morning/i })).toBeVisible()
    const waLink = hero.getByRole('link', { name: /whatsapp your project/i })
    expect(await waLink.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//)
    await expect(hero.getByRole('link', { name: 'See finished work' })).toHaveAttribute('href', '#work')
  })

  test('the film plays: mode set before paint, one stage per chapter, the rail on the right', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/\bstory\b/)
    await expect(page.locator('html')).toHaveAttribute('data-film-ch', 'hero')
    await expect(page.locator('#film .chs > section.ch')).toHaveCount(CHAPTERS.length)
    await expect(page.getByRole('navigation', { name: 'Chapters' }).getByRole('link')).toHaveCount(CHAPTERS.length)
  })

  test('every chapter\'s heading and actions are reached by scrolling, at 390 and 1440 wide', async ({ page }) => {
    // Each scroll waits for the film to catch up (about 1 to 2 s) and to be still.
    test.setTimeout(240000)
    for (const [width, height] of [[390, 844], [1440, 900]] as const) {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      // Where each heading is on screen (the junction's gives way to its list at its resting point).
      const headingAt: Record<string, number> = { brands: 0.5, work: 0.06, brief: 0.57, workshop: 0.66, road: 0.14, hills: 0.8, junction: 0.25, finale: 0.72 }
      for (const chapter of CHAPTERS.slice(1)) {
        await scrollToChapter(page, chapter.id, headingAt[chapter.id])
        await expect(page.locator('html'), `${width}: ${chapter.id}`).toHaveAttribute('data-film-ch', chapter.id)
        expect(await seen(page, `#${chapter.id} h2`), `${width}: ${chapter.id} heading`).toBe(true)
      }
      // Each chapter's own actions come into view on their beats.
      const actions: Array<[string, number, string]> = [
        ['brief', 0.57, '#brief .acts .cta'],
        ['hills', 0.8, '#hills a[href="/areas"]'],
        ['junction', 0.8, '#junction .j-trades a[href="/services/glow-sign-boards"]'],
        ['brands', 0.5, '#brands .acts .cta'],
        ['work', 0.8, '#work a[href="/portfolio"]'],
        ['finale', 0.72, '#finale .fin-acts .cta'],
      ]
      for (const [id, p, selector] of actions) {
        await scrollToChapter(page, id, p)
        expect(await seen(page, selector), `${width}: ${selector}`).toBe(true)
      }
    }
  })

  test('the Malda beat: the field lights row by row, then the days run on by themselves past day 7', async ({ page }) => {
    test.slow()
    for (const [width, height] of [[390, 844], [1440, 900]] as const) {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      const road = page.locator('#road')
      await expect(road.locator('.m-field .m-row > i')).toHaveCount(MALDA_BOARDS)
      await expect(road.locator('.m-strip i')).toHaveCount(MALDA_NORMAL.max)
      // Mid count (a frame of the move into the hold): some rows lit, some not, and the gold days with them.
      const lift = await holdChapter(page, 'road', 0.5)
      const lit = await road.locator('.m-row.on').count()
      expect(lit, `${width}: rows lit mid count`).toBeGreaterThan(0)
      expect(lit, `${width}: rows lit mid count`).toBeLessThan(MALDA_ROWS)
      expect(await road.locator('.m-gold.on').count()).toBeLessThan(MALDA_DAYS)
      expect(await seen(page, '#road .m-count'), `${width}: the counter`).toBe(true)
      await lift()
      // The hold: every row and every gold day lit, and the words.
      await scrollToChapter(page, 'road', 0.78)
      await expect(road.locator('.m-row.on')).toHaveCount(MALDA_ROWS)
      await expect(road.locator('.m-gold.on')).toHaveCount(MALDA_DAYS)
      await expect(road.locator('.m-hold')).toHaveText(ROAD.hold)
      expect(await seen(page, '#road .m-hold'), `${width}: the hold`).toBe(true)
      await expect(road.locator('.m-title')).toHaveText(ROAD.maldaTitle)
      expect(await seen(page, '#road .m-title'), `${width}: the beat's heading`).toBe(true)
      expect(await seen(page, '#road .m-text'), `${width}: the sentence`).toBe(true)
      // Then, by themselves, the outlined days to the end of the normal time, and its line.
      await page.waitForTimeout(2600)
      const run = await road.locator('.m-run i').evaluateAll(marks => marks.map(mark => Number(getComputedStyle(mark).opacity)))
      expect(run, `${width}: the days run on`).toEqual(Array(MALDA_NORMAL.max - MALDA_DAYS).fill(1))
      await expect(road.locator('.m-normal')).toHaveText(ROAD.normal)
      expect(await seen(page, '#road .m-normal'), `${width}: the normal time`).toBe(true)
    }
  })

  test('the road\'s still frame has the field complete, 7 gold days and 18 outlined, and every word', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const road = page.locator('#road')
    await road.locator('.stage').scrollIntoViewIfNeeded()
    const rows = await road.locator('.m-row').evaluateAll(list => list.map(row => Number(getComputedStyle(row).opacity)))
    expect(rows).toEqual(Array(MALDA_ROWS).fill(1))
    const gold = await road.locator('.m-gold').evaluateAll(list => list.map(mark => Number(getComputedStyle(mark, '::after').opacity)))
    expect(gold).toEqual(Array(MALDA_DAYS).fill(1))
    const outlined = await road.locator('.m-run i').evaluateAll(list => list.map(mark => Number(getComputedStyle(mark).opacity)))
    expect(outlined).toEqual(Array(MALDA_NORMAL.max - MALDA_DAYS).fill(1))
    for (const selector of ['#road h2', '#road .road-card p', '#road .m-title', '#road .m-hold', '#road .m-normal', '#road .m-text']) {
      expect(await seen(page, selector), selector).toBe(true)
    }
  })

  test('the brands wall is lit at its stop, on screen, and no logo or photograph is drawn above its own pixels', async ({ page }) => {
    test.slow()
    for (const [width, height, boards] of [[390, 844, 22], [360, 740, 22], [1440, 900, 22]] as const) {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await scrollToChapter(page, 'brands', 0.5)
      const wall = await page.locator('#brands .b-board').evaluateAll(async items => {
        const shown = items.filter(item => getComputedStyle(item).display !== 'none')
        await Promise.all(shown.map(item => item.querySelector('img')?.decode().catch(() => undefined)))
        return shown.map(item => {
          const box = item.getBoundingClientRect()
          const img = item.querySelector('img')
          return {
            lit: getComputedStyle(item.querySelector('.b-face')!).opacity === '1',
            inside: box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight,
            logo: img ? img.getBoundingClientRect().width <= img.naturalWidth + 0.5 && img.getBoundingClientRect().height <= img.naturalHeight + 0.5 : true,
          }
        })
      })
      expect(wall, `${width}`).toHaveLength(boards)
      for (const board of wall) expect(board, `${width}`).toEqual({ lit: true, inside: true, logo: true })
      for (const selector of ['#brands h2', '#brands .b-big', '#brands .b-years', '#brands .acts .cta', '#brands a[href="/for-brands"]']) expect(await seen(page, selector), `${width} ${selector}`).toBe(true)
      // The words sit under the wall, not over it.
      const [wallBottom, wordsTop] = await page.evaluate(() => [document.querySelector('#brands .b-wall')!.getBoundingClientRect().bottom, document.querySelector('#brands .b-words')!.getBoundingClientRect().top])
      expect(wordsTop, `${width}`).toBeGreaterThan(wallBottom)
      for (const p of [0.3, 0.6]) {
        await scrollToChapter(page, 'work', p)
        const sizes = await page.locator('#work [data-photo] img').evaluateAll(images => images.map(image => image.getBoundingClientRect().width <= Number(image.getAttribute('width')) + 0.5))
        expect(sizes.every(Boolean), `${width} work ${p}`).toBe(true)
      }
    }
  })

  test('with the keyboard the keys move the film towards a chapter and its links can take focus', async ({ page }) => {
    // Each key press waits for the film to catch up and be still.
    test.setTimeout(120000)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await engineReady(page)
    // Only the chapter on screen is rendered, so its links are the ones in the tab order.
    for (const [id, selector, extra] of [['brands', '#brands a[href="/for-brands"]', 0], ['work', '#work a[href="/portfolio"]', 5]] as const) {
      for (let i = 0; i < 12 && await page.evaluate(() => document.documentElement.dataset.filmCh) !== id; i++) {
        await page.keyboard.press('ArrowDown')
        await page.waitForTimeout(200)
        await moveEnded(page)
      }
      // The work chapter's link closes its wall, at its last stop.
      for (let i = 0; i < extra; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(200); await moveEnded(page) }
      await expect(page.locator('html')).toHaveAttribute('data-film-ch', id)
      await page.locator(selector).focus()
      await expect(page.locator(selector)).toBeFocused()
      // Focus moves the page to the chapter's stop for that link; the film then catches up.
      await page.waitForTimeout(200)
      await moveEnded(page)
      expect(await seen(page, selector), selector).toBe(true)
    }
  })

  test('the skip link lands on the real photographs', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await engineReady(page)
    await page.locator('#hero-section').getByRole('link', { name: 'See finished work' }).click()
    await page.waitForTimeout(200)
    await moveEnded(page)
    await expect(page.locator('html')).toHaveAttribute('data-film-ch', 'work')
    expect(await seen(page, '#work h2')).toBe(true)
  })

  test('the name typed in the brief letters every board, and stays on the device', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const posts: string[] = []
    page.on('request', request => { if (request.method() !== 'GET') posts.push(request.url()) })
    await page.goto('/')
    await scrollToChapter(page, 'brief', 0.5)
    await page.locator('#brief input[data-name-input]').fill('Maa Tara Stores')
    const boards = page.locator('#film [data-name]')
    expect(await boards.count()).toBeGreaterThan(5)
    await expect(boards).toHaveText(Array(await boards.count()).fill('Maa Tara Stores'))
    expect(await page.evaluate(() => sessionStorage.getItem('adj-name'))).toBe('Maa Tara Stores')
    expect(posts.filter(url => !/clarity|google|vercel/.test(url))).toEqual([])
    // The lettering stays on its board.
    await scrollToChapter(page, 'workshop', 0.4)
    const fit = await page.locator('#workshop .face[data-name]').evaluate(element => {
      const box = element.getBoundingClientRect()
      const text = (element.firstElementChild as HTMLElement).getBoundingClientRect()
      return text.left >= box.left - 1 && text.right <= box.right + 1
    })
    expect(fit).toBe(true)
    await page.reload()
    await expect(page.locator('#hero-section [data-name]')).toHaveText('Maa Tara Stores')
  })

  test('the theme toggle in a chapter keeps the film where it was', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await scrollToChapter(page, 'hills', 0.8)
    const before = await page.evaluate(() => scrollY)
    await page.getByRole('button', { name: /switch to (dark|light) mode/i }).click()
    await page.waitForTimeout(1200)
    expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThan(4)
    await expect(page.locator('html')).toHaveAttribute('data-film-ch', 'hills')
    expect(await seen(page, '#hills h2')).toBe(true)
  })

  test('on a phone the one floating action keeps clear of the chapters\' own actions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const dock = page.locator('.quote-dock')
    // In the hero the hero's own gold action is the one on screen.
    await expect(dock.and(page.locator(':not([data-hidden])'))).toHaveCount(0)
    await scrollToChapter(page, 'workshop', 0.4)
    await expect(page.locator('.quote-dock--film:not([data-hidden])')).toHaveCount(1)
    await scrollToChapter(page, 'brief', 0.57)
    await expect(page.locator('.quote-dock--film[data-hidden]')).toHaveCount(1)
    await scrollToChapter(page, 'finale', 0.72)
    await expect(page.locator('.quote-dock--film[data-hidden]')).toHaveCount(1)
    await expect(page.locator('.quote-dock:visible')).toHaveCount(0)
  })

  test('no sideways scroll and almost no layout shift through the whole film at 390 wide', async ({ page }) => {
    test.slow()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'load' })
    await page.evaluate(() => {
      const w = window as unknown as { __cls: number }
      w.__cls = 0
      new PerformanceObserver(list => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
          if (!entry.hadRecentInput) w.__cls += entry.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    const total = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < total; y += 400) {
      await page.mouse.wheel(0, 400)
      await page.waitForTimeout(60)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    }
    await page.waitForTimeout(500)
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThanOrEqual(0.05)
  })

  test('leaving the page takes the film off <html>, and coming back starts it again', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/\bstory\b/)
    await page.getByRole('banner').getByRole('link', { name: 'About', exact: true }).click()
    await expect(page).toHaveURL(/\/about$/)
    await expect(page.locator('html')).not.toHaveClass(/\bstory\b|\bsettled\b|\bhas-cta\b/)
    await expect(page.locator('html')).not.toHaveAttribute('data-film-ch')
    await expect(page.locator('html')).not.toHaveAttribute('data-film-tone')
    await page.getByRole('banner').getByRole('link', { name: 'Home', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('html')).toHaveClass(/\bstory\b/)
    await expect(page.locator('html')).toHaveAttribute('data-film-ch', 'hero')
    await scrollToChapter(page, 'road', 0.14)
    await expect(page.locator('html')).toHaveAttribute('data-film-ch', 'road')
    expect(await seen(page, '#road h2')).toBe(true)
  })

  test('with reduced motion every chapter is a still frame, stacked, with every heading and link', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/\bstory\b/)
    for (const chapter of CHAPTERS.slice(1)) {
      const heading = page.locator(`#${chapter.id} h2`)
      await heading.scrollIntoViewIfNeeded()
      await expect(heading, chapter.id).toBeVisible()
      expect(await seen(page, `#${chapter.id} h2`), chapter.id).toBe(true)
    }
    // Chapters follow one another down the page, not on top of each other.
    const tops = await page.locator('#film .chs > section.ch').evaluateAll(sections => sections.map(section => section.getBoundingClientRect().top + scrollY))
    for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1])
    const links = [
      ...SERVICE_SLUGS.map(slug => `#junction .j-trades a[href="/services/${slug}"]`),
      '#hills a[href="/areas"]', '#brands a[href="/for-brands"]', '#work a[href="/portfolio"]',
      '#brief .acts .cta', '#brands .acts .cta', '#finale .fin-acts .cta',
    ]
    for (const selector of links) {
      const link = page.locator(selector)
      await link.scrollIntoViewIfNeeded()
      expect(await seen(page, selector), selector).toBe(true)
    }
    // No camera or scroll animation runs.
    expect(await page.locator('#film').evaluate(film => film.getAnimations({ subtree: true })
      .filter(animation => 'animationName' in animation && animation.playState === 'running').length)).toBe(0)
  })

  test('without JavaScript the still frames carry every heading', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
    const page = await context.newPage()
    await page.goto('/')
    for (const chapter of CHAPTERS.slice(1)) {
      const heading = page.locator(`#${chapter.id} h2`)
      await heading.scrollIntoViewIfNeeded()
      await expect(heading, chapter.id).toBeVisible()
      expect(await seen(page, `#${chapter.id} h2`), chapter.id).toBe(true)
    }
    await context.close()
  })

  test('the junction lights five surfaces in turn, then pushes into the glow sign board\'s light', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const stops = (await page.locator('#junction').getAttribute('data-stops'))!.split(' ').map(Number)
    expect(stops).toHaveLength(6)
    const captions = page.locator('#junction .j-cap')
    await expect(captions).toHaveCount(5)
    // At each surface's stop its caption is the one line showing, and its link goes to the service page.
    const pages = ['glow-sign-boards', 'wall-painting', 'f-pole-installation', 'vehicle-branding', 'in-shop-branding']
    for (const [index, slug] of pages.entries()) {
      await scrollToChapter(page, 'junction', stops[index])
      await expect(captions.nth(index).locator('a')).toHaveAttribute('href', `/services/${slug}`)
      const shown = await captions.evaluateAll(lines => lines.map(line => Number(getComputedStyle(line).opacity) > 0.5))
      expect(shown, slug).toEqual(pages.map((_, other) => other === index))
    }
    // The names step off before the push, so no giant cropped letters show.
    // (Frames between stops, held with a finger down: the film rests only on stops.)
    let lift = await holdChapter(page, 'junction', 0.86)
    expect(Number(await page.locator('#junction .j-name-out').evaluate(element => getComputedStyle(element).opacity))).toBeLessThan(0.05)
    await lift()
    // The chapter leaves on the film's flat white, the colour the next chapter opens on.
    lift = await holdChapter(page, 'junction', 1)
    const out = await page.locator('#junction .j-out').evaluate(element => {
      const style = getComputedStyle(element)
      const probe = document.createElement('i')
      probe.style.color = getComputedStyle(element).getPropertyValue('--light-white')
      document.body.append(probe)
      const white = getComputedStyle(probe).color
      probe.remove()
      return { opacity: Number(style.opacity), background: style.backgroundColor, white }
    })
    expect(out.opacity).toBeGreaterThan(0.95)
    expect(out.background).toBe(out.white)
    expect(out.white).toBe('rgb(255, 248, 231)')
    await lift()
  })

  test('the film names no hoarding or billboard, in its words or its pictures', async ({ page }) => {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      await page.emulateMedia({ reducedMotion })
      await page.goto('/')
      // What the page shows and says (not the structured data, which is unchanged).
      const said = await page.locator('body').evaluate(film => [
        (film as HTMLElement).innerText ?? '',
        ...[...film.querySelectorAll('[alt], [aria-label], [title]')].flatMap(element => ['alt', 'aria-label', 'title'].map(name => element.getAttribute(name) ?? '')),
      ].join('\n'))
      expect(said, reducedMotion).not.toMatch(/hoarding|billboard/i)
    }
  })

  test('keeps real photographs and logos to the proof chapters and names every scene as a visualisation', async ({ page }) => {
    await page.goto('/')
    const scenes = await page.locator('#film img[alt]:not([alt=""])').evaluateAll(images => images.map(image => ({
      alt: image.getAttribute('alt') ?? '',
      proof: !!image.closest('#brands, #work'),
    })))
    for (const scene of scenes.filter(image => !image.proof)) expect(scene.alt).toMatch(/^Visualisation:/)
    await expect(page.getByText(/visualisation/i)).toHaveCount(0)
    // The owner took the regional agencies note off the home page on 16 November 2026.
    await expect(page.getByText(/regional agenc/i)).toHaveCount(0)
  })

  test('small phones keep the brand, actions and navigation usable without overflow', async ({ page }) => {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto('/')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await expect(page.getByRole('banner').getByRole('img', { name: /ad jeet, since 1990/i })).toBeVisible()
      const theme = page.getByRole('button', { name: /switch to (dark|light) mode/i })
      const box = await theme.boundingBox()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('mobile navigation reaches the contact form', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    const drawer = page.getByRole('dialog', { name: 'Navigation menu' })
    await expect(drawer).toBeVisible()
    await drawer.getByRole('link', { name: 'Contact', exact: true }).click()
    await expect(page).toHaveURL(/\/contact$/)
    await expect(page.locator('#lead-name')).toBeVisible()
  })
})
