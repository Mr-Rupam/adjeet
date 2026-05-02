import Link from "next/link";
import { defaultWhatsAppUrl } from "@/lib/whatsapp";
import styles from "./ClientShowcase.module.css";

const CLIENTS_ROW1 = [
  { name: "Airtel",       sector: "Telecom" },
  { name: "Supreme Pipe", sector: "Piping" },
  { name: "Havells",      sector: "Electricals" },
  { name: "Star Cement",  sector: "Cement" },
  { name: "SRMB",         sector: "Steel" },
  { name: "Shyam Steel",  sector: "Steel" },
  { name: "Emami",        sector: "FMCG" },
  { name: "OYO",          sector: "Hospitality" },
  { name: "Dalmia Cement",sector: "Cement" },
  { name: "Jio",          sector: "Telecom" },
];

const CLIENTS_ROW2 = [
  { name: "Vivo",            sector: "Smartphones" },
  { name: "Toptech TMT",     sector: "Steel" },
  { name: "Captain TMT Bar", sector: "Steel" },
  { name: "Supershakti",     sector: "Steel" },
  { name: "Elegant TMT Bar", sector: "Steel" },
  { name: "Astral Pipe",     sector: "Piping" },
  { name: "SEL TMT",         sector: "Steel" },
  { name: "Adani Cement",    sector: "Cement" },
  { name: "Anchor",          sector: "Electricals" },
];

const SECTOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Piping:      { bg: "bg-blue/10",  text: "text-blue",  border: "border-blue/20" },
  Telecom:     { bg: "bg-clay/10",  text: "text-clay",  border: "border-clay/20" },
  FMCG:        { bg: "bg-sage/10",  text: "text-sage",  border: "border-sage/20" },
  Steel:       { bg: "bg-blue/10",  text: "text-blue",  border: "border-blue/20" },
  Electricals: { bg: "bg-ochre/10", text: "text-ochre", border: "border-ochre/20" },
  Cement:      { bg: "bg-slate/10", text: "text-slate", border: "border-slate/20" },
  Hospitality: { bg: "bg-clay/10",  text: "text-clay",  border: "border-clay/20" },
  Smartphones: { bg: "bg-ochre/10", text: "text-ochre", border: "border-ochre/20" },
};

const repeat = <T,>(items: T[], count = 2): T[] =>
  Array.from({ length: count }).flatMap(() => items);

export function ClientShowcase() {
  const waUrl = defaultWhatsAppUrl();

  return (
    <section className="relative py-24 overflow-hidden bg-paper">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--rule) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-content mx-auto px-6">
        {/* Editorial heading — left-aligned, no emoji badge */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink leading-tight max-w-2xl">
          Airtel. Jio. Havells.{" "}
          <span className="text-ink/60">They chose AD-JEET for North Bengal.</span>
        </h2>
        <p className="mt-4 text-lg text-ink/60 max-w-xl">
          35 years of outdoor fabrication. Every brand in the carousel below has a
          sign somewhere in North Bengal that we built.
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center rounded bg-blue text-white font-medium px-7 py-3.5 text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            View our work
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded border border-rule text-ink font-medium px-7 py-3.5 text-sm hover:bg-paper-elevated transition-colors active:scale-[0.98]"
          >
            Get a quote →
          </a>
        </div>

        {/* Client carousel */}
        <div className={`mt-14 overflow-hidden relative ${styles.carouselWrap}`}>
          {/* Row 1 — scrolls left */}
          <div className={`flex gap-5 whitespace-nowrap ${styles.animateScrollLeft}`}>
            {repeat(CLIENTS_ROW1).map((client, i) => {
              const colors = SECTOR_COLORS[client.sector] ?? SECTOR_COLORS.Steel;
              return (
                <div
                  key={i}
                  className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded border ${colors.border} ${colors.bg} shadow-sm`}
                >
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {client.name}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink/40">
                    {client.sector}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Row 2 — scrolls right */}
          <div className={`flex gap-5 whitespace-nowrap mt-4 ${styles.animateScrollRight}`}>
            {repeat(CLIENTS_ROW2).map((client, i) => {
              const colors = SECTOR_COLORS[client.sector] ?? SECTOR_COLORS.Steel;
              return (
                <div
                  key={i}
                  className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded border ${colors.border} ${colors.bg} shadow-sm`}
                >
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {client.name}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink/40">
                    {client.sector}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Fade edges */}
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-paper to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-paper to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
