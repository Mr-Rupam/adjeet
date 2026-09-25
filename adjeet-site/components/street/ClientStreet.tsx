import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { clientSlug, getPhotosByClient } from '@/content/gallery'
import styles from './ClientStreet.module.css'

interface Client {
  name: string
  sector: string
  /** Portfolio brand filter, when the gallery files the work under another name. */
  portfolio?: string
  portfolioName?: string
}

const ROW_1: Client[] = [
  { name: 'Airtel', sector: 'Telecom' },
  { name: 'Supreme Pipe', sector: 'Piping' },
  { name: 'Havells', sector: 'Electricals' },
  { name: 'Star Cement', sector: 'Cement' },
  { name: 'SRMB', sector: 'Steel' },
  { name: 'Shyam Steel', sector: 'Steel' },
  { name: 'Emami', sector: 'FMCG' },
  { name: 'OYO', sector: 'Hospitality' },
  { name: 'Dalmia Cement', sector: 'Cement' },
  { name: 'Jio', sector: 'Telecom' },
]

const ROW_2: Client[] = [
  { name: 'Vivo', sector: 'Smartphones' },
  { name: 'Toptech TMT', sector: 'Steel' },
  { name: 'Captain TMT Bar', sector: 'Steel' },
  { name: 'Supershakti', sector: 'Steel' },
  { name: 'Elegant TMT Bar', sector: 'Steel' },
  { name: 'Astral Pipe', sector: 'Piping' },
  { name: 'SEL TMT', sector: 'Steel' },
  { name: 'Adani Cement', sector: 'Cement', portfolio: 'acc', portfolioName: 'ACC' },
  { name: 'Anchor', sector: 'Electricals', portfolio: 'anchor-by-panasonic' },
  { name: 'SD Lion TMT', sector: 'Steel' },
  { name: 'Dish TV', sector: 'DTH' },
]

export function ClientStreet() {
  return (
    <section id="client-history" className={styles.clients} aria-labelledby="client-history-heading" data-home-section>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <div>
            <p className={styles.kicker}>02 / Client history</p>
            <h2 id="client-history-heading" data-home-title>Names you know.<br /><span>Work you can&nbsp;see.</span></h2>
          </div>
          <div className={styles.introAside}>
            <p>From national names to regional specialists, these brands have been part of our signage and campaign work.</p>
            <Link href="/portfolio">Explore the project archive <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={styles.boardHeader} aria-hidden="true"><span>AD JEET / Client history</span><span>Made visible in North Bengal</span></div>
        <ul className={styles.names} aria-label="Brands in our work history">
          {[...ROW_1, ...ROW_2].map(client => {
            const slug = client.portfolio ?? clientSlug(client.name)
            const count = getPhotosByClient(slug).length
            const contents = <>
              <span className={styles.logoFrame}>
                <Image src={`/client-logos/${clientSlug(client.name)}.webp`} alt="" width={220} height={92} className={styles.logo} />
              </span>
              <span className={styles.cardFooter}>
                <span><small>{client.sector}</small><strong data-client-name>{client.name}</strong></span>
                {count > 0 && <ArrowUpRight size={19} aria-hidden="true" />}
              </span>
            </>
            return (
              <li key={client.name} data-home-client>
                {count > 0
                  ? <Link href={'/portfolio?client=' + slug} aria-label={`View ${count} ${client.portfolioName ?? client.name} project photo${count === 1 ? '' : 's'}`}>{contents}</Link>
                  : <div className={styles.staticBrand}>{contents}</div>}
              </li>
            )
          })}
        </ul>
        <p className={styles.note}>Selected history includes assignments through regional agencies. Logos with an arrow open photographs of the work.</p>
      </div>
    </section>
  )
}
