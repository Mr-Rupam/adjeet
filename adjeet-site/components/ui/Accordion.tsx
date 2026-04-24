'use client'

import { useState } from 'react'

interface AccordionItem {
  q: string
  a: string
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

export function Accordion({ items, className = '' }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(null)

  function toggle(idx: number) {
    setOpen(prev => (prev === idx ? null : idx))
  }

  return (
    <dl className={`divide-y divide-rule ${className}`}>
      {items.map((item, idx) => (
        <div key={idx}>
          <dt>
            <button
              onClick={() => toggle(idx)}
              aria-expanded={open === idx}
              className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-ink hover:text-blue transition-colors"
            >
              <span>{item.q}</span>
              <span aria-hidden="true" className="ml-4 shrink-0 text-ink-subtle">
                {open === idx ? '−' : '+'}
              </span>
            </button>
          </dt>
          {open === idx && (
            <dd className="pb-4 text-sm text-ink-muted leading-relaxed">
              {item.a}
            </dd>
          )}
        </div>
      ))}
    </dl>
  )
}
