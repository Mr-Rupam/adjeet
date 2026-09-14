import type { ReactNode } from 'react'

interface PageMastheadProps {
  meta?: string[]
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  compact?: boolean
}

export function PageMasthead({ meta = [], title, lead, children, compact }: PageMastheadProps) {
  return (
    <section className={'page-masthead field-masthead' + (compact ? ' field-masthead--compact' : '')}>
      <div className="field-container">
        {meta.length > 0 && <div className="field-meta"><span aria-hidden="true">AD JEET /</span>{meta.map(m => <span key={m}>{m}</span>)}</div>}
        <div className="field-masthead-body">
          <h1 className="display">{title}</h1>
          {(lead || children) && <div className="field-masthead-aside">{lead && <p>{lead}</p>}{children && <div className="field-masthead-actions">{children}</div>}</div>}
        </div>
      </div>
    </section>
  )
}
