"use client";

import Link from "next/link";
import type { ExploreCategoryHubCard } from "@/lib/explore/exploreCategoryHubCards";

type ExploreCategoryPremiumGridProps = {
  cards: ExploreCategoryHubCard[];
};

/**
 * Typographic category posters — clearly not model cards (no photos).
 */
export function ExploreCategoryPremiumGrid({
  cards,
}: ExploreCategoryPremiumGridProps) {
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
      {cards.map((card) => {
        const { theme } = card;
        const titleLines = splitPosterTitle(card.title);

        return (
          <Link
            key={card.id}
            href={card.href}
            className="group relative flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-[24px] p-4 shadow-[0_12px_48px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.08] transition duration-300 hover:ring-magenta/50 hover:shadow-neon active:scale-[0.98]"
            style={{ background: theme.background }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 0%, ${theme.accent} 0%, transparent 45%), radial-gradient(circle at 100% 100%, #ff007f 0%, transparent 40%)`,
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.08%22/%3E%3C/svg%3E')] opacity-40 mix-blend-overlay"
              aria-hidden
            />

            <span
              className="pointer-events-none absolute -right-1 bottom-6 select-none text-[clamp(4rem,22vw,5.5rem)] font-black leading-none text-white/[0.07]"
              aria-hidden
            >
              {theme.watermark}
            </span>

            <div className="relative z-10 space-y-1">
              <p
                className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/55"
              >
                Category
              </p>
              <div
                className="h-0.5 w-8 rounded-full opacity-90 transition group-hover:w-12"
                style={{ backgroundColor: theme.accent }}
              />
            </div>

            <div className="relative z-10 flex flex-1 flex-col justify-end">
              <h3
                className="font-black uppercase leading-[0.92] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
                style={{
                  fontSize: titleLines.length > 1 ? "1.35rem" : "1.65rem",
                }}
              >
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h3>
              <p className="mt-2 text-[11px] font-semibold leading-snug text-white/75">
                {theme.kicker}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-3">
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-white/50"
              >
                Browse
              </span>
              {card.liveCount > 0 ? (
                <span className="text-[10px] font-semibold tabular-nums text-white/90">
                  <span
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]"
                    aria-hidden
                  />
                  {card.liveCount} live
                </span>
              ) : (
                <span className="text-[10px] font-medium text-white/45">
                  Open hub
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/** Break long labels into 2 poster lines (e.g. "18+ Verified"). */
function splitPosterTitle(title: string): string[] {
  const t = title.trim();
  if (t.length <= 10) return [t];
  if (t.includes(" ")) {
    const parts = t.split(/\s+/);
    if (parts.length === 2) return parts;
    const mid = Math.ceil(parts.length / 2);
    return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
  }
  return [t];
}
