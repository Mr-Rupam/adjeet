'use client'

import { useState, useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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
  const uid = useId()

  function toggle(idx: number) {
    setOpen(prev => (prev === idx ? null : idx))
  }

  return (
    <dl className={`divide-y divide-rule ${className}`}>
      {items.map((item, idx) => {
        const panelId = `${uid}-panel-${idx}`
        const isOpen = open === idx
        return (
          <div key={item.q}>
            <dt>
              <button
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-ink hover:text-blue transition-colors"
              >
                <span>{item.q}</span>
                <span aria-hidden="true" className="ml-4 shrink-0 text-ink-subtle">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </dt>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.dd
                  key={panelId}
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden pb-4 text-sm text-ink-muted leading-relaxed"
                >
                  {item.a}
                </motion.dd>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </dl>
  )
}
