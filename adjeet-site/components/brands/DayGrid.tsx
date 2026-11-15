import { JOB_DAYS, JOB_DAYS_CAPTION } from '@/content/company-figures'
import styles from './Brands.module.css'

const DAYS = [1, 2, 3, 4, 5] as const

/**
 * Days from the order, as the day grid of the approved company profile: one
 * small square per day, dark up to the fastest day, light up to the longest,
 * empty after, with the range written at the end of the row. A real table, so
 * assistive technology reads the trade, the scale and the range.
 */
export function DayGrid() {
  return (
    <div className={styles.dayGridWrap}>
      <table className={styles.dayGrid}>
        <caption>{JOB_DAYS_CAPTION}</caption>
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">Trade</span></th>
            {DAYS.map(day => (
              <th key={day} scope="col" className={styles.dayHead}>
                <span className={day === 1 ? undefined : styles.dayWord}>Day </span>{day}
              </th>
            ))}
            <th scope="col"><span className="sr-only">From the order</span></th>
          </tr>
        </thead>
        <tbody>
          {JOB_DAYS.map(job => (
            <tr key={job.slug}>
              <th scope="row">{job.label}</th>
              {DAYS.map(day => (
                <td key={day} className={styles.dayCell}>
                  <span
                    aria-hidden="true"
                    className={day <= job.min ? styles.dayFast : day <= job.max ? styles.dayMost : styles.dayEmpty}
                  />
                </td>
              ))}
              <td className={styles.dayRange}>{job.min} to {job.max} days</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.dayLegend} aria-hidden="true">
        <span><i className={styles.dayFast} />Fastest</span>
        <span><i className={styles.dayMost} />At most</span>
      </p>
    </div>
  )
}
