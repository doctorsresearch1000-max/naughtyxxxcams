"use client";

import { useCallback, useMemo, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { JerkmateTubeAdCard } from "@/components/ads/JerkmateTubeAdCard";
import { ModelTubeCard } from "@/components/cams/ModelTubeCard";
import { ExploreDesktopTheaterModal } from "@/components/explore/desktop/ExploreDesktopTheaterModal";
import { buildGridWithJerkmateAds } from "@/lib/ads/inGridJerkmateAds";
import { EXPLORE_TUBE_GRID_CLASS } from "@/lib/explore/exploreTubeLayout";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useInfiniteScrollBatch } from "@/hooks/useInfiniteScrollBatch";

type ExploreTubeGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

const TUBE_BATCH = 48;

export function ExploreTubeGrid({
  performers,
  emptyMessage = "No results. Try another filter or search.",
}: ExploreTubeGridProps) {
  const [theaterIndex, setTheaterIndex] = useState<number | null>(null);

  const cards = useMemo(
    () => filterFeedPerformers(performers),
    [performers],
  );

  const openTheater = useCallback(
    (performer: FeedPerformer) => {
      const idx = cards.findIndex((p) => p.feedKey === performer.feedKey);
      setTheaterIndex(idx >= 0 ? idx : 0);
    },
    [cards],
  );

  const { visibleCount, sentinelRef, hasMore } = useInfiniteScrollBatch(
    cards.length,
    TUBE_BATCH,
  );

  const visibleCards = useMemo(
    () => cards.slice(0, visibleCount),
    [cards, visibleCount],
  );

  const gridItems = useMemo(
    () => buildGridWithJerkmateAds(visibleCards, { keyPrefix: "explore" }),
    [visibleCards],
  );

  if (cards.length === 0) {
    return (
      <p className="mx-3 rounded-lg bg-[#1C1C1E] p-6 text-center text-sm text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      {theaterIndex !== null && cards.length > 0 ? (
        <ExploreDesktopTheaterModal
          performers={cards}
          activeIndex={theaterIndex}
          onClose={() => setTheaterIndex(null)}
          onChangeIndex={setTheaterIndex}
        />
      ) : null}

      <div
        className={EXPLORE_TUBE_GRID_CLASS}
        data-explore-tube-grid="v5-jm-in-grid"
      >
        {gridItems.map((item) =>
          item.kind === "jerkmate-ad" ? (
            <JerkmateTubeAdCard
              key={item.key}
              adSlotIndex={item.adSlotIndex}
            />
          ) : (
            <ModelTubeCard
              key={item.key}
              performer={item.performer}
              gridIndex={item.performerIndex}
              priority={item.performerIndex < 4}
              enableDesktopPreview
              onQuickView={openTheater}
            />
          ),
        )}
      </div>

      <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
      {hasMore ? (
        <p className="py-3 text-center text-xs font-semibold text-zinc-500">
          Loading more models…
        </p>
      ) : null}
    </>
  );
}
