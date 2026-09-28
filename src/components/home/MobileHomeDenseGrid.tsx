"use client";

import { useMemo } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { JerkmateHomeWideBanner } from "@/components/conversion/JerkmateHomeWideBanner";
import { HomeCatalogSeoFooter } from "@/components/home/HomeCatalogSeoFooter";
import { MobileHomeDenseCard } from "@/components/home/MobileHomeDenseCard";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import { filterHomeMobilePerformers } from "@/lib/feed/filterHomeMobilePerformers";
import { useInfiniteScrollBatch } from "@/hooks/useInfiniteScrollBatch";

const BATCH = 40;

type MobileHomeDenseGridProps = {
  performers: CrackPerformer[];
  ready: boolean;
};

export function MobileHomeDenseGrid({
  performers,
  ready,
}: MobileHomeDenseGridProps) {
  const cards = useMemo(
    () => filterHomeMobilePerformers(performers),
    [performers],
  );

  const { visibleCount, sentinelRef, hasMore } = useInfiniteScrollBatch(
    cards.length,
    BATCH,
  );

  const visible = useMemo(
    () => cards.slice(0, visibleCount),
    [cards, visibleCount],
  );

  return (
    <main
      className="mx-auto min-h-0 w-full max-w-md flex-1 overflow-y-auto bg-black pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-white md:hidden"
      data-home-mobile-dense="v3-wide-banner"
    >
      <JerkmateHomeWideBanner />

      {!ready ? (
        <ExplorePerformerGridSkeleton />
      ) : cards.length === 0 ? (
        <p className="p-4 text-center text-sm text-zinc-400">
          Live models are loading. Try again in a moment.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-1.5 gap-y-2 p-1.5 pt-0">
            {visible.map((performer) => (
              <MobileHomeDenseCard
                key={performer.feedKey}
                performer={performer}
              />
            ))}
          </div>
          <div ref={sentinelRef} className="h-6 w-full" aria-hidden />
          {hasMore ? (
            <p className="py-2 text-center text-[11px] font-semibold text-zinc-500">
              Loading more…
            </p>
          ) : null}
          <HomeCatalogSeoFooter />
        </>
      )}
    </main>
  );
}
