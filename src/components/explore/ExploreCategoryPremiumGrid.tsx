"use client";

import Image from "next/image";
import Link from "next/link";
import type { ExploreCategoryHubCard } from "@/lib/explore/exploreCategoryHubCards";

type ExploreCategoryPremiumGridProps = {
  cards: ExploreCategoryHubCard[];
};

/**
 * Premium 2-col category tiles — live thumbs + Naughty magenta/cyan/neon accents.
 */
export function ExploreCategoryPremiumGrid({
  cards,
}: ExploreCategoryPremiumGridProps) {
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
      {cards.map((card, index) => (
        <Link
          key={card.id}
          href={card.href}
          className="group relative block aspect-[5/4] w-full overflow-hidden rounded-[22px] bg-[#141416] shadow-[0_10px_40px_rgba(0,0,0,0.45)] ring-1 ring-magenta/35 transition duration-300 hover:shadow-neon hover:ring-[#39FF14]/45 active:scale-[0.98]"
        >
          {card.coverUrl ? (
            <Image
              src={card.coverUrl}
              alt={card.label}
              fill
              sizes="(max-width: 768px) 46vw, 280px"
              className="object-cover transition duration-500 group-hover:scale-[1.06]"
              unoptimized
              priority={index < 2}
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-magenta/40 via-[#1a0a14] to-night"
              aria-hidden
            />
          )}

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-magenta/30 via-transparent to-cyan/10 opacity-90 mix-blend-soft-light transition group-hover:from-magenta/40"
            aria-hidden
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magenta/70 to-transparent opacity-80" />

          {card.liveCount > 0 ? (
            <span
              className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-md bg-[#39FF14] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-black shadow-[0_0_12px_rgba(57,255,20,0.45)]"
            >
              <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-black/80" />
              {card.liveCount} live
            </span>
          ) : (
            <span
              className="absolute left-2.5 top-2.5 z-10 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-pink-200 ring-1 ring-magenta/40"
            >
              Explore
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 p-3 pt-8">
            <h3 className="text-sm font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {card.label}
            </h3>
            <p className="mt-0.5 text-[10px] font-semibold text-pink-300/90">
              HD cams · NaughtyXXX
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
