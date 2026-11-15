import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import styles from './BrandTeamsLink.module.css'

/** The one link for brand and trade marketing teams, to /for-brands. */
export function BrandTeamsLink() {
  return (
    <aside className={styles.band} aria-label="For brand teams">
      <div className={`field-container ${styles.inner}`}>
        <p className={styles.text}>Brand or trade marketing team with outlets to brand across North Bengal and Sikkim?</p>
        <Link href="/for-brands" className={styles.link}>Dealer boards and rollouts for brands <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </aside>
  )
}
