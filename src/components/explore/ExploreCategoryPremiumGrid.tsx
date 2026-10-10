"use client";

import Image from "next/image";
import Link from "next/link";
import type { ExploreCategoryHubCard } from "@/lib/explore/exploreCategoryHubCards";
import { NAUGHTY_GREEN } from "@/lib/explore/exploreCategoryVisualTheme";

type ExploreCategoryPremiumGridProps = {
  cards: ExploreCategoryHubCard[];
};

/**
 * Compact niche covers — photo + typographic title, green Naughty accent (not feed cards).
 */
export function ExploreCategoryPremiumGrid({
  cards,
}: ExploreCategoryPremiumGridProps) {
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {cards.map((card, index) => {
        const { theme } = card;

        return (
          <Link
            key={card.id}
            href={card.href}
            className="group relative flex h-[5.5rem] w-full overflow-hidden rounded-2xl bg-[#0d0d0f] shadow-[0_6px_24px_rgba(0,0,0,0.45)] ring-1 ring-[#39FF14]/20 transition duration-300 hover:ring-[#39FF14]/55 hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] active:scale-[0.98]"
          >
            <Image
              src={theme.coverImage}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 768px) 46vw, 240px"
              className="object-cover object-center transition duration-500 group-hover:scale-[1.04]"
              priority={index < 2}
            />

            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: theme.background }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              aria-hidden
            />

            <div
              className="absolute left-0 top-0 z-10 h-full w-[3px] bg-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.65)]"
              aria-hidden
            />

            <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center py-2 pl-3.5 pr-2">
              <p
                className="text-[7px] font-black uppercase tracking-[0.22em] text-[#39FF14]"
              >
                Category
              </p>
              <h3
                className="mt-0.5 truncate text-[1.05rem] font-black uppercase leading-none tracking-tight text-white"
              >
                {card.title}
              </h3>
              <p className="mt-1 truncate text-[9px] font-semibold text-white/65">
                {theme.kicker}
              </p>
            </div>

            {card.liveCount > 0 ? (
              <span
                className="absolute bottom-1.5 right-2 z-10 rounded-md bg-black/55 px-1.5 py-0.5 text-[8px] font-bold tabular-nums text-white ring-1 ring-[#39FF14]/35"
              >
                <span
                  className="mr-1 inline-block h-1 w-1 rounded-full bg-[#39FF14]"
                  style={{ boxShadow: `0 0 6px ${NAUGHTY_GREEN}` }}
                  aria-hidden
                />
                {card.liveCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
