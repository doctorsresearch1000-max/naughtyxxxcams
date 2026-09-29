"use client";

import { useCallback, useMemo, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import { ModelTubeCard } from "@/components/cams/ModelTubeCard";
import { ExploreDesktopTheaterModal } from "@/components/explore/desktop/ExploreDesktopTheaterModal";
import { EXPLORE_TUBE_GRID_CLASS } from "@/lib/explore/exploreTubeLayout";
import {
  JERKMATE_EXPLORE_GIF_BANNER_URL,
  JERKMATE_EXPLORE_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useInfiniteScrollBatch } from "@/hooks/useInfiniteScrollBatch";

type ExploreTubeGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

const TUBE_BATCH = 48;
const EXPLORE_BANNER_AFTER_MODELS = 4;

type GridItem =
  | { kind: "performer"; key: string; performer: FeedPerformer; index: number }
  | { kind: "explore-banner"; key: string };

function buildExploreGridItems(cards: FeedPerformer[]): GridItem[] {
  const items: GridItem[] = [];

  cards.forEach((performer, index) => {
    items.push({
      kind: "performer",
      key: performer.feedKey,
      performer,
      index,
    });

    if (index === EXPLORE_BANNER_AFTER_MODELS - 1) {
      items.push({ kind: "explore-banner", key: "explore-jerkmate-natural" });
    }
  });

  return items;
}

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
    () => buildExploreGridItems(visibleCards),
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

      <div className={EXPLORE_TUBE_GRID_CLASS} data-explore-tube-grid="v4-natural-banner">
        {gridItems.map((item) =>
          item.kind === "explore-banner" ? (
            <div key={item.key} className="col-span-full">
              <JerkmateNaturalBanner
                href={JERKMATE_EXPLORE_GIF_TRACKING_URL}
                imageSrc={JERKMATE_EXPLORE_GIF_BANNER_URL}
                alt="Jerkmate explore offer"
                className="my-1"
              />
            </div>
          ) : (
            <ModelTubeCard
              key={item.key}
              performer={item.performer}
              gridIndex={item.index}
              priority={item.index < 4}
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
