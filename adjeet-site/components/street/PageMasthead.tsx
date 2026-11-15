import type { ReactNode } from 'react'

interface PageMastheadProps {
  title: ReactNode
  lead?: ReactNode
  /** One recorded fact that once sat in the meta row, kept as a short line under the lead. */
  fact?: ReactNode
  /** The actions: the gold WhatsApp button first, the brief as the quiet second link. */
  children?: ReactNode
  /** A photographed job on its fascia plate. On phones it follows the lead, before the actions. */
  media?: ReactNode
  compact?: boolean
}

/**
 * The inner pages' opening. No kicker or meta row above the heading
 * (DESIGN.md "No kickers"): the heading speaks for itself.
 */
export function PageMasthead({ title, lead, fact, children, media, compact }: PageMastheadProps) {
  const classes = ['page-masthead', 'field-masthead']
  if (compact) classes.push('field-masthead--compact')
  if (media) classes.push('field-masthead--media')
  return (
    <section className={classes.join(' ')}>
      <div className="field-container">
        <div className="field-masthead-body">
          <h1 className="display">{title}</h1>
          {(lead || fact) && (
            <div className="field-masthead-aside">
              {lead && <p>{lead}</p>}
              {fact && <p className="field-masthead-fact">{fact}</p>}
            </div>
          )}
          {media && <div className="field-masthead-media">{media}</div>}
          {children && <div className="field-masthead-actions">{children}</div>}
        </div>
      </div>
    </section>
  )
}
