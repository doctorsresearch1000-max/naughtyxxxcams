"use client";

import { useMemo } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { JerkmateTubeAdCard } from "@/components/ads/JerkmateTubeAdCard";
import { ModelTubeCard } from "@/components/cams/ModelTubeCard";
import { filterHomeMobilePerformers } from "@/lib/feed/filterHomeMobilePerformers";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { buildHomeGridItems } from "@/lib/home/homeGridWithAds";
import { MOBILE_HOME_GRID_CLASS } from "@/lib/layout/catalogGridLayout";
import { useInfiniteScrollBatch } from "@/hooks/useInfiniteScrollBatch";

/** Smaller batches on mobile reduce parallel image decodes (Android GPU). */
const BATCH = 16;

const VIEWPORT_EAGER_COUNT = 6;

type HomeTubeGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
  /** Desktop quick-view (immersive room). */
  onQuickView?: (performer: FeedPerformer) => void;
  enableDesktopPreview?: boolean;
  gridClassName?: string;
};

export function HomeTubeGrid({
  performers,
  emptyMessage = "Live models are loading. Try again in a moment.",
  onQuickView,
  enableDesktopPreview = false,
  gridClassName = MOBILE_HOME_GRID_CLASS,
}: HomeTubeGridProps) {
  const cards = useMemo(
    () => filterHomeMobilePerformers(performers),
    [performers],
  );

  const { visibleCount, sentinelRef, hasMore } = useInfiniteScrollBatch(
    cards.length,
    BATCH,
  );

  const visiblePerformers = useMemo(
    () => cards.slice(0, visibleCount),
    [cards, visibleCount],
  );

  const gridItems = useMemo(
    () => buildHomeGridItems(visiblePerformers),
    [visiblePerformers],
  );

  if (cards.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-zinc-400">{emptyMessage}</p>
    );
  }

  return (
    <>
      <div className={gridClassName} data-home-tube-grid="v1-jm-ads">
        {gridItems.map((item, visualIndex) => {
          const viewportPriority = visualIndex < VIEWPORT_EAGER_COUNT;

          if (item.kind === "jerkmate-ad") {
            const promoPriority = item.adSlotIndex === 0;
            return (
              <JerkmateTubeAdCard
                key={item.key}
                adSlotIndex={item.adSlotIndex}
                priority={promoPriority}
              />
            );
          }

          return (
            <ModelTubeCard
              key={item.key}
              performer={item.performer}
              gridIndex={item.performerIndex}
              priority={viewportPriority}
              onQuickView={onQuickView}
              enableDesktopPreview={enableDesktopPreview}
            />
          );
        })}
      </div>

      <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
      {hasMore ? (
        <p className="py-3 text-center text-[11px] font-medium text-zinc-500">
          Loading more…
        </p>
      ) : null}
    </>
  );
}
