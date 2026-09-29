"use client";

import { useMemo } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ModelTubeCard } from "@/components/cams/ModelTubeCard";
import { HomeCatalogSectionTitle } from "@/components/home/HomeCatalogSectionTitle";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import { filterHomeMobilePerformers } from "@/lib/feed/filterHomeMobilePerformers";
import {
  CATALOG_PAGE_PADDING,
  MOBILE_HOME_GRID_CLASS,
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
      className={`${CATALOG_PAGE_PADDING} w-full overflow-x-hidden bg-black pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-white md:hidden`}
      data-home-mobile-dense="v6-tube-grid"
    >
      <HomeCatalogSectionTitle />

      {!ready ? (
        <ExplorePerformerGridSkeleton />
      ) : cards.length === 0 ? (
        <p className="p-4 text-center text-sm text-zinc-400">
          Live models are loading. Try again in a moment.
        </p>
      ) : (
        <>
          <div className={MOBILE_HOME_GRID_CLASS}>
            {visible.map((performer, index) => (
              <ModelTubeCard
                key={performer.feedKey}
                performer={performer}
                gridIndex={index}
                priority={index < 4}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
          {hasMore ? (
            <p className="py-3 text-center text-[11px] font-medium text-zinc-500">
              Loading more…
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}
