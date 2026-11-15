import Link from 'next/link'
import { LEAD_FIGURE, SCALE_FIGURES, tenureFigures } from '@/content/for-brands'
import styles from './Brands.module.css'

/**
 * The figures, all read from content/company-figures.ts: one lead numeral on
 * the gold sweep, the years with five brands as a ledger, then the size of the
 * operation in a line. Plain numerals on the ground, no boxes.
 */
export function BrandFigures() {
  const tenure = tenureFigures()
  return (
    <section className={styles.figures} aria-labelledby="brands-figures-heading">
      <div className={`field-container ${styles.figuresInner}`}>
        <div className={styles.leadFigure}>
          <p className={styles.leadValue}>
            {LEAD_FIGURE.value}
            <svg className={styles.sweep} viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M8 96 C 240 20, 640 2, 992 34 C 660 26, 280 50, 8 96 Z" />
            </svg>
          </p>
          <p className={styles.leadLabel}>{LEAD_FIGURE.label}</p>
        </div>

        <div className={styles.tenure}>
          <h2 id="brands-figures-heading" className={styles.figuresHeading} data-site-reveal="title">Brands stay for years.</h2>
          <ul className={styles.tenureList}>
            {tenure.map(figure => (
              <li key={figure.label}>
                <span className={styles.tenureValue}>{figure.value}</span>{' '}
                <span className={styles.tenureLabel}>{figure.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <ul className={styles.scale} aria-label="The size of the operation">
          {SCALE_FIGURES.map(figure => (
            <li key={figure.label}>
              <span className={styles.scaleValue}>{figure.value}</span>{' '}
              <span className={styles.scaleLabel}>{figure.label}</span>
            </li>
          ))}
        </ul>
        <Link href="/areas" className={styles.figuresLink}>Every area we cover</Link>
      </div>
    </section>
  )
}
