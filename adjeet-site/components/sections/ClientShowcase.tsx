import Link from "next/link";
import { defaultWhatsAppUrl } from "@/lib/whatsapp";
import styles from "./ClientShowcase.module.css";

type Client = { name: string; sector: string; national?: boolean };

const CLIENTS_ROW1: Client[] = [
  { name: "Airtel",        sector: "Telecom",      national: true },
  { name: "Supreme Pipe",  sector: "Piping" },
  { name: "Havells",       sector: "Electricals",  national: true },
  { name: "Star Cement",   sector: "Cement" },
  { name: "SRMB",          sector: "Steel" },
  { name: "Shyam Steel",   sector: "Steel" },
  { name: "Emami",         sector: "FMCG",         national: true },
  { name: "OYO",           sector: "Hospitality",  national: true },
  { name: "Dalmia Cement", sector: "Cement" },
  { name: "Jio",           sector: "Telecom",      national: true },
];

const CLIENTS_ROW2: Client[] = [
  { name: "Vivo",            sector: "Smartphones", national: true },
  { name: "Toptech TMT",     sector: "Steel" },
  { name: "Captain TMT Bar", sector: "Steel" },
  { name: "Supershakti",     sector: "Steel" },
  { name: "Elegant TMT Bar", sector: "Steel" },
  { name: "Astral Pipe",     sector: "Piping" },
  { name: "SEL TMT",         sector: "Steel" },
  { name: "Adani Cement",    sector: "Cement",      national: true },
  { name: "Anchor",          sector: "Electricals" },
];

const repeat = <T,>(items: T[], count = 2): T[] =>
  Array.from({ length: count }).flatMap(() => items);

export function ClientShowcase() {
  const waUrl = defaultWhatsAppUrl();

  return (
    <section className={`relative py-24 overflow-hidden bg-paper ${styles.section}`}>
      <div className="relative max-w-content mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink leading-tight max-w-2xl">
          Airtel. Jio. Havells.{" "}
          <span className="text-ink/60">They chose AD-JEET for North Bengal.</span>
        </h2>
        <p className="mt-4 text-base text-ink/60 max-w-xl leading-relaxed">
          35 years of outdoor fabrication. Every brand below has a sign somewhere
          in North Bengal that we built.
        </p>

        <div className="flex flex-wrap gap-3 mt-8">
          <Link href="/portfolio" className={styles.btnPrimary}>
            View our work
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            Get a quote &rarr;
          </a>
        </div>

        <div className={`mt-12 overflow-hidden relative ${styles.carouselWrap}`}>
          <div className={`flex gap-3 whitespace-nowrap ${styles.animateScrollLeft}`}>
            {repeat(CLIENTS_ROW1).map((client, i) => (
              <div
                key={i}
                className={`${styles.plate} ${client.national ? styles.plateNational : ""}`}
              >
                <span className={styles.plateName}>{client.name}</span>
                <span className={styles.plateSector}>{client.sector}</span>
              </div>
            ))}
          </div>

          <div className={`flex gap-3 whitespace-nowrap mt-3 ${styles.animateScrollRight}`}>
            {repeat(CLIENTS_ROW2).map((client, i) => (
              <div
                key={i}
                className={`${styles.plate} ${client.national ? styles.plateNational : ""}`}
              >
                <span className={styles.plateName}>{client.name}</span>
                <span className={styles.plateSector}>{client.sector}</span>
              </div>
            ))}
          </div>

          <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-paper to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-paper to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
