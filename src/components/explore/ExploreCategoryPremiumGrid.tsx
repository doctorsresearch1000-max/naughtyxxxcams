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
    <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-3 lg:gap-3 xl:grid-cols-6">
      {cards.map((card, index) => {
        const { theme } = card;

        return (
          <Link
            key={card.id}
            href={card.href}
            className="group relative aspect-[2.15/1] h-[5.5rem] w-full overflow-hidden rounded-2xl bg-[#0d0d0f] shadow-[0_6px_24px_rgba(0,0,0,0.45)] ring-1 ring-[#39FF14]/20 transition duration-200 hover:scale-[1.02] hover:ring-[#39FF14]/55 hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] active:scale-[0.98] lg:aspect-[16/9] lg:h-28 lg:max-h-28 lg:rounded-xl"
          >
            <Image
              src={theme.coverImage}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 768px) 46vw, (max-width: 1600px) 16vw, 200px"
              className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
              priority={index < 2}
            />

            <div
              className="pointer-events-none absolute inset-0 bg-black/25"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10 lg:from-black/60 lg:via-black/30 lg:to-transparent"
              aria-hidden
            />

            <div
              className="absolute left-0 top-0 z-10 h-full w-[3px] bg-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.65)]"
              aria-hidden
            />

            <div className="absolute inset-x-0 bottom-0 z-10 px-2.5 pb-2 pt-6 lg:px-2 lg:pb-1.5">
              <p className="text-[6px] font-black uppercase tracking-[0.2em] text-[#39FF14] lg:text-[7px]">
                Category
              </p>
              <h3 className="truncate text-sm font-black uppercase leading-tight tracking-tight text-white lg:text-xs">
                {card.title}
              </h3>
              <p className="mt-0.5 truncate text-[8px] font-semibold text-white/70 lg:hidden">
                {theme.kicker}
              </p>
            </div>

            {card.liveCount > 0 ? (
              <span
                className="absolute right-1.5 top-1.5 z-10 rounded-md bg-black/60 px-1.5 py-0.5 text-[8px] font-bold tabular-nums text-white ring-1 ring-[#39FF14]/35"
              >
                <span
                  className="mr-0.5 inline-block h-1 w-1 rounded-full bg-[#39FF14]"
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
