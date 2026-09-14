'use client'

import { useId } from 'react'

interface AccordionItem { q: string; a: string }
interface AccordionProps { items: AccordionItem[]; className?: string }

/** Native disclosure: server-rendered answers and keyboard support without JS. */
export function Accordion({ items, className = '' }: AccordionProps) {
  const group = useId()
  return (
    <div className={`divide-y divide-rule ${className}`}>
      {items.map(item => (
        <details key={item.q} name={group} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium text-ink transition-colors hover:text-signal">
            <span>{item.q}</span>
            <span aria-hidden="true" className="shrink-0 text-xl text-ink-subtle group-open:rotate-45">+</span>
          </summary>
          <p className="pb-5 text-base text-ink-muted leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
