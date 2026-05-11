"use client";

import React from "react";
import Link from "next/link";
import { defaultWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Real client sectors and representative brands AD-JEET has served
 * across North Bengal. Uses text-based pills instead of logos to
 * avoid trademark issues while showcasing actual client profile.
 */
const CLIENTS_ROW1 = [
  { name: "SBI", sector: "Banking" },
  { name: "Airtel", sector: "Telecom" },
  { name: "Jio", sector: "Telecom" },
  { name: "Indian Oil", sector: "Fuel" },
  { name: "HDFC Bank", sector: "Banking" },
  { name: "Bandhan Bank", sector: "Banking" },
  { name: "ITC", sector: "FMCG" },
  { name: "Vi", sector: "Telecom" },
  { name: "Apollo Pharmacy", sector: "Healthcare" },
];

const CLIENTS_ROW2 = [
  { name: "Tata Motors", sector: "Automotive" },
  { name: "Maruti Suzuki", sector: "Automotive" },
  { name: "Hero MotoCorp", sector: "Automotive" },
  { name: "BPCL", sector: "Fuel" },
  { name: "Axis Bank", sector: "Banking" },
  { name: "ICICI Bank", sector: "Banking" },
  { name: "Coca-Cola", sector: "FMCG" },
  { name: "HP Petrol", sector: "Fuel" },
  { name: "OYO", sector: "Hospitality" },
];

// Accent colours per sector for visual variety
const SECTOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Banking:    { bg: "bg-blue/5",   text: "text-blue",      border: "border-blue/20" },
  Telecom:    { bg: "bg-slate/5",  text: "text-slate",     border: "border-slate/20" },
  FMCG:       { bg: "bg-slate/10", text: "text-ink-muted", border: "border-slate/20" },
  Fuel:       { bg: "bg-blue/10",  text: "text-blue",      border: "border-blue/30" },
  Automotive: { bg: "bg-slate/5",  text: "text-ink-subtle",border: "border-slate/15" },
  Healthcare: { bg: "bg-blue/5",   text: "text-blue-deep", border: "border-blue/15" },
  Hospitality:{ bg: "bg-slate/5",  text: "text-slate",     border: "border-slate/20" },
};

const repeat = <T,>(items: T[], count = 4): T[] =>
  Array.from({ length: count }).flatMap(() => items);

export function ClientShowcase() {
  const waUrl = defaultWhatsAppUrl();

  return (
    <section className="relative py-24 overflow-hidden bg-paper">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--rule) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content */}
      <div className="relative max-w-content mx-auto px-6 text-center">
        <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-widest rounded-full border border-rule bg-paper-elevated text-ink-muted">
          ★ Trusted by 200+ brands
        </span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink leading-tight">
          Signage partner for
          <br className="hidden sm:block" />
          India&apos;s biggest brands
        </h2>
        <p className="mt-4 text-lg text-ink-muted max-w-xl mx-auto">
          From national banks to telecom giants — we&apos;ve built signage for
          leading brands across banking, FMCG, automotive, healthcare, and fuel
          sectors.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
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
        <div className="mt-14 overflow-hidden relative">
          {/* Row 1 — scrolls left */}
          <div className="flex gap-5 whitespace-nowrap animate-[scroll-left_35s_linear_infinite]">
            {repeat(CLIENTS_ROW1).map((client, i) => {
              const colors = SECTOR_COLORS[client.sector] ?? SECTOR_COLORS.Banking;
              return (
                <div
                  key={i}
                  className={`group flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-full border ${colors.border} ${colors.bg} shadow-sm backdrop-blur-sm hover:scale-[1.03] hover:shadow-md hover:border-blue/30 transition-all duration-300 cursor-default`}
                >
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {client.name}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
                    {client.sector}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Row 2 — scrolls right */}
          <div className="flex gap-5 whitespace-nowrap mt-4 animate-[scroll-right_35s_linear_infinite]">
            {repeat(CLIENTS_ROW2).map((client, i) => {
              const colors = SECTOR_COLORS[client.sector] ?? SECTOR_COLORS.Banking;
              return (
                <div
                  key={i}
                  className={`group flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-full border ${colors.border} ${colors.bg} shadow-sm backdrop-blur-sm hover:scale-[1.03] hover:shadow-md hover:border-blue/30 transition-all duration-300 cursor-default`}
                >
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {client.name}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
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

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
