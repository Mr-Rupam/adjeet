import type { CSSProperties, ReactNode } from 'react'
import { DEFAULT_SHOP_NAME, chapter, railLabel, stopsAttr, type ChapterId } from '@/content/home-film'

/** Custom properties in an inline style. */
export type Vars = CSSProperties & Record<`--${string}`, string | number>
export const vars = (v: Record<`--${string}`, string | number>) => v as Vars

/**
 * The visitor's name, lettered on a blank face of the artwork. Decorative:
 * the words are not part of the page's text. The engine fits it to the face
 * and swaps in the name typed in the brief.
 */
export function Name({ className = 'face', style }: { className?: string; style?: Vars }) {
  return (
    <span className={className} style={style} data-name aria-hidden="true"><span>{DEFAULT_SHOP_NAME}</span></span>
  )
}

type ChapterProps = {
  id: ChapterId
  /** The stage's class (the chapter's look). */
  stage: string
  /** "dark", "light" or "page": the header's and the rail's ink over this stage. */
  tone: 'dark' | 'light' | 'page'
  /** Later tones: at each p in `at`, the tone in `late` (same order). */
  toneAt?: string
  toneLate?: string
  stageStyle?: Vars
  children: ReactNode
}

/**
 * One chapter: a section as tall as its pinned scroll, holding one sticky
 * stage of one screen (film.css). Its length, overlap, landing point, still
 * frame and the scroll controller's stops come from content/home-film.ts.
 */
export function Chapter({ id, stage, tone, toneAt, toneLate, stageStyle, children }: ChapterProps) {
  const entry = chapter(id)
  const style: Record<`--${string}`, number> = { '--len': entry.len }
  if (entry.over !== undefined) style['--over'] = entry.over
  if (entry.still !== undefined) style['--still'] = entry.still
  return (
    <section className="ch" id={id} style={vars(style)} data-title={railLabel(entry)} data-rest={entry.rest} data-stops={stopsAttr(entry.stops)} aria-labelledby={`${id}-h`}>
      <div className={`stage ${stage}`} data-tone={tone} data-tone-at={toneAt} data-tone-late={toneLate} style={stageStyle}>
        {children}
      </div>
    </section>
  )
}
