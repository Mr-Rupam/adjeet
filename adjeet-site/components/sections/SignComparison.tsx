import Link from 'next/link'
import type { ServiceSlug } from '@/content/services'
import { COMPARED_BOARDS, COMPARISON_COLUMNS, COMPARISON_HEADING, COMPARISON_LEAD, COMPARISON_NOTE } from '@/content/sign-comparison'
import styles from './SignComparison.module.css'

/**
 * The shopfront comparison as one real HTML table. It is the first thing a shop
 * owner asks, and search and answer engines lift a table far more cleanly than
 * the same facts spread through prose. The facts live in content/sign-comparison.ts.
 */
export function SignComparison({ current }: { current?: ServiceSlug }) {
  return (
    <section className={`field-container ${styles.section}`} aria-labelledby="sign-compare-heading">
      <p className="spec text-signal">Compare / Shopfront boards</p>
      <h2 id="sign-compare-heading">{COMPARISON_HEADING}</h2>
      <p className={styles.lead}>{COMPARISON_LEAD}</p>
      {/* Explicit roles keep the table readable to screen readers on phones, where CSS restacks the rows. */}
      <table className={styles.table} role="table">
        <caption className="sr-only">Glow sign board, ACP board with 3D LED letters and flex board compared</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">Board</th>
            {COMPARISON_COLUMNS.map(column => <th key={column} scope="col" role="columnheader">{column}</th>)}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {COMPARED_BOARDS.map(board => (
            <tr key={board.slug} role="row">
              <th scope="row" role="rowheader">
                {board.slug === current
                  ? <span aria-current="page">{board.name}</span>
                  : <Link href={`/services/${board.slug}`}>{board.name}</Link>}
              </th>
              {board.cells.map((cell, index) => (
                <td key={COMPARISON_COLUMNS[index]} role="cell" data-label={COMPARISON_COLUMNS[index]}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.note}>{COMPARISON_NOTE}</p>
    </section>
  )
}
