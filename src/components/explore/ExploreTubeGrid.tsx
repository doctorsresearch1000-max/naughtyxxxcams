"use client";

import { useMemo } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ModelTubeCard } from "@/components/cams/ModelTubeCard";
import { ExploreInFeedPromoCard } from "@/components/explore/ExploreInFeedPromoCard";
import { EXPLORE_TUBE_GRID_CLASS } from "@/lib/explore/exploreTubeLayout";
import {
  buildExploreInFeedPromo,
  resolveInFeedPromoIndex,
  type ExploreInFeedPromo,
} from "@/lib/explore/exploreInFeedPromo";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useInfiniteScrollBatch } from "@/hooks/useInfiniteScrollBatch";

type ExploreTubeGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
  inFeedPromo?: ExploreInFeedPromo | null;
};

const TUBE_BATCH = 48;

type GridItem =
  | { kind: "performer"; key: string; performer: FeedPerformer; index: number }
  | { kind: "promo"; key: string };

function buildGridItems(
  cards: FeedPerformer[],
  promo: ExploreInFeedPromo | null | undefined,
): GridItem[] {
  const items: GridItem[] = cards.map((performer, index) => ({
    kind: "performer",
    key: performer.feedKey,
    performer,
    index,
  }));

  if (!promo) return items;

  const insertAt = resolveInFeedPromoIndex(cards.length);
  if (insertAt == null) return items;

  const withPromo = [...items];
  withPromo.splice(insertAt, 0, { kind: "promo", key: "in-feed-promo" });
  return withPromo;
}

export function ExploreTubeGrid({
  performers,
  emptyMessage = "No results. Try another filter or search.",
  inFeedPromo,
}: ExploreTubeGridProps) {
  const cards = useMemo(
    () => filterFeedPerformers(performers),
    [performers],
  );

  const promo = useMemo(
    () => inFeedPromo ?? buildExploreInFeedPromo(performers[0]),
    [inFeedPromo, performers],
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
    () => buildGridItems(visibleCards, promo),
    [visibleCards, promo],
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
      <div className={EXPLORE_TUBE_GRID_CLASS} data-explore-tube-grid="v3-tube-card">
        {gridItems.map((item) =>
          item.kind === "promo" ? (
            <ExploreInFeedPromoCard key={item.key} promo={promo} />
          ) : (
            <ModelTubeCard
              key={item.key}
              performer={item.performer}
              gridIndex={item.index}
              priority={item.index < 4}
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
