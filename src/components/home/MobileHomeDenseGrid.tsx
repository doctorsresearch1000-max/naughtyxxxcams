"use client";

import { useMemo } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { JerkmateHomeMobileGifBanner } from "@/components/conversion/JerkmateHomeMobileGifBanner";
import { HomeCatalogSectionTitle } from "@/components/home/HomeCatalogSectionTitle";
import { MobileHomeDenseCard } from "@/components/home/MobileHomeDenseCard";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import { filterHomeMobilePerformers } from "@/lib/feed/filterHomeMobilePerformers";
import {
  CATALOG_GRID_CLASS,
  CATALOG_PAGE_PADDING,
} from "@/lib/layout/catalogGridLayout";
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
      className={`${CATALOG_PAGE_PADDING} min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-black pb-[calc(5rem+env(safe-area-inset-bottom))] text-white md:hidden`}
      data-home-mobile-dense="v4-camb3"
    >
      <HomeCatalogSectionTitle />
      <JerkmateHomeMobileGifBanner />

      {!ready ? (
        <ExplorePerformerGridSkeleton />
      ) : cards.length === 0 ? (
        <p className="p-4 text-center text-sm text-zinc-400">
          Live models are loading. Try again in a moment.
        </p>
      ) : (
        <>
          <div className={CATALOG_GRID_CLASS}>
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
        </>
      )}
    </main>
  );
}
