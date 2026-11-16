import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import { BRAND_LEDGER, type LedgerBrand } from '@/content/for-brands'
import styles from './Brands.module.css'

/**
 * A logo set to one optical height: a wide mark is drawn lower than a square
 * one so the row reads level. The factor is applied to a height that the CSS
 * sets per breakpoint, so the box is fixed before the file arrives.
 */
function opticalScale({ width, height }: LedgerBrand): number {
  return Math.round(Math.min(1.25, Math.max(0.5, (width / height) ** -0.38 * 1.15)) * 100) / 100
}

/**
 * The client logos as a ledger: one row per sector, the sector at the left,
 * logos in a line, hairline rules between rows. Each logo carries its name
 * as its alternative text. No tiles, chips or frames.
 */
export function BrandLedger() {
  return (
    <section className={styles.ledgerSection} aria-labelledby="brands-ledger-heading">
      <div className="field-container">
        <h2 id="brands-ledger-heading" className={styles.ledgerHeading} data-site-reveal="title">Brands we have worked for.</h2>
        <dl className={styles.ledger}>
          {BRAND_LEDGER.map(row => (
            <div key={row.sector} className={styles.ledgerRow}>
              <dt>{row.sector}</dt>
              <dd>
                <ul className={styles.ledgerLogos}>
                  {row.brands.map(brand => (
                    <li key={brand.name} style={{ '--logo-k': opticalScale(brand) } as React.CSSProperties}>
                      <Image src={brand.logo} alt={brand.name} width={brand.width} height={brand.height} sizes="200px" className={styles.ledgerLogo} />
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
