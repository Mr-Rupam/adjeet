import { MessageSquare, MapPin, Pencil, Wrench, Zap } from 'lucide-react'
import styles from './OurProcess.module.css'

const STEPS = [
  {
    n: '01', col: 1, side: 'above' as const, when: 'Day 0',
    Icon: MessageSquare, iconSize: 22,
    title: 'Inquiry',
    body: 'Send dimensions and a reference image via WhatsApp. We respond within two business hours.',
    dotDelay: '0.8s', stepDelay: '0.9s',
  },
  {
    n: '02', col: 2, side: 'below' as const, when: 'Day 1',
    Icon: MapPin, iconSize: 22,
    title: 'Site Survey',
    body: 'Our team measures substrate, photographs the location, and confirms electrical access.',
    dotDelay: '0.95s', stepDelay: '1.05s',
  },
  {
    n: '03', col: 3, side: 'above' as const, when: 'Day 2–3',
    Icon: Pencil, iconSize: 22,
    title: 'Design & Quote',
    body: 'Scaled mockup with material specs and a fixed quote. Revisions until you sign off.',
    dotDelay: '1.1s', stepDelay: '1.2s',
  },
  {
    n: '04', col: 4, side: 'below' as const, when: 'Day 4–7',
    Icon: Wrench, iconSize: 22,
    title: 'Workshop Build',
    body: 'Cut, weld, print, wire, and finish at our Patiram Jote workshop. Full QC before dispatch.',
    dotDelay: '1.25s', stepDelay: '1.35s',
  },
  {
    n: '05', col: 5, side: 'above' as const, when: 'Day 8',
    Icon: Zap, iconSize: 22,
    title: 'Installation',
    body: 'Crew on-site with hardware and electrical kit. Sign goes live. One-year warranty starts.',
    dotDelay: '1.4s', stepDelay: '1.5s',
  },
]

const above = STEPS.filter(s => s.side === 'above')
const below = STEPS.filter(s => s.side === 'below')

export function OurProcess() {
  return (
    <section className={styles.section}>

      {/* Label bar */}
      <div className={styles.header}>
        <span className={styles.headerLabel}>№ 03 — How We Work</span>
        <span className={styles.headerMeta}>Inquiry → Installation</span>
      </div>

      {/* Intro */}
      <div className={styles.intro}>
        <h2 className={styles.heading}>
          From the brief to a live sign in{' '}
          <em className={styles.headingAccent}>eight days.</em>
        </h2>
        <div className={styles.introBadge}>
          <span className={styles.introBadgeNum}>8</span>
          <span className={styles.introBadgeLabel}>day production cycle</span>
        </div>
      </div>

      {/* ── Desktop: horizontal signal-line timeline ── */}
      <div className={styles.timelineOuter}>

        {/* Row ABOVE the track — steps 01, 03, 05 */}
        <div className={styles.rowAbove}>
          {above.map(step => (
            <div
              key={step.n}
              className={`${styles.step} ${styles.stepAbove}`}
              style={{ gridColumn: step.col, animationDelay: step.stepDelay }}
            >
              {/* DOM: connector first — column-reverse makes card appear on top */}
              <div className={styles.connector} />
              <div className={styles.card}>
                <div className={styles.cardMeta}>
                  <span className={styles.cardNum}>{step.n}</span>
                  <span className={styles.cardDay}>{step.when}</span>
                </div>
                <step.Icon size={step.iconSize} strokeWidth={1.5} className={styles.cardIcon} aria-hidden="true" />
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.cardBody}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Track: animated draw line + nodes */}
        <div className={styles.track}>
          <div className={styles.trackLine} />
          <div className={styles.tickRow}>
            {STEPS.map(step => (
              <div key={step.n} className={styles.tick}>
                <div
                  className={styles.tickDot}
                  style={{ animationDelay: step.dotDelay }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row BELOW the track — steps 02, 04 */}
        <div className={styles.rowBelow}>
          {below.map(step => (
            <div
              key={step.n}
              className={`${styles.step} ${styles.stepBelow}`}
              style={{ gridColumn: step.col, animationDelay: step.stepDelay }}
            >
              <div className={styles.connector} />
              <div className={styles.card}>
                <div className={styles.cardMeta}>
                  <span className={styles.cardNum}>{step.n}</span>
                  <span className={styles.cardDay}>{step.when}</span>
                </div>
                <step.Icon size={step.iconSize} strokeWidth={1.5} className={styles.cardIcon} aria-hidden="true" />
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.cardBody}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Mobile: vertical stacked list ── */}
      <div className={styles.mobileList}>
        {STEPS.map(step => (
          <div key={step.n} className={styles.mobileStep}>
            <span className={styles.mobileNum}>{step.n}</span>
            <div className={styles.mobileContent}>
              <span className={styles.mobileDay}>{step.when}</span>
              <h3 className={styles.mobileTitle}>{step.title}</h3>
              <p className={styles.mobileBody}>{step.body}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
