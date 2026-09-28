"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ExploreDesktopTheaterModal } from "@/components/explore/desktop/ExploreDesktopTheaterModal";
import { ExploreInFeedPromoCard } from "@/components/explore/ExploreInFeedPromoCard";
import { ExploreTubeCard } from "@/components/explore/ExploreTubeCard";
import { EXPLORE_TUBE_GRID_CLASS } from "@/lib/explore/exploreTubeLayout";
import {
  buildExploreInFeedPromo,
  resolveInFeedPromoIndex,
  type ExploreInFeedPromo,
} from "@/lib/explore/exploreInFeedPromo";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useInfiniteScrollBatch } from "@/hooks/useInfiniteScrollBatch";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";

type ExploreTubeGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
  inFeedPromo?: ExploreInFeedPromo | null;
};

const TUBE_BATCH = 48;

type GridItem =
  | { kind: "performer"; key: string; performer: FeedPerformer }
  | { kind: "promo"; key: string };

function buildGridItems(
  cards: FeedPerformer[],
  promo: ExploreInFeedPromo | null | undefined,
): GridItem[] {
  const items: GridItem[] = cards.map((performer) => ({
    kind: "performer",
    key: performer.feedKey,
    performer,
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
  const router = useRouter();
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

  const [theaterIndex, setTheaterIndex] = useState<number | null>(null);

  const onSelectCard = useCallback(
    (performer: FeedPerformer) => {
      const useTheater = window.matchMedia("(min-width: 1024px)").matches;
      if (useTheater) {
        const idx = cards.findIndex((p) => p.feedKey === performer.feedKey);
        setTheaterIndex(idx >= 0 ? idx : 0);
        return;
      }
      const path = performerProfilePathFromPerformer(performer);
      if (path) router.push(path);
    },
    [cards, router],
  );

  const closeTheater = useCallback(() => setTheaterIndex(null), []);

  if (cards.length === 0) {
    return (
      <p className="mx-3 rounded-lg bg-[#1C1C1E] p-6 text-center text-sm text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div className={EXPLORE_TUBE_GRID_CLASS} data-explore-tube-grid="v2">
        {gridItems.map((item) =>
          item.kind === "promo" ? (
            <ExploreInFeedPromoCard key={item.key} promo={promo} />
          ) : (
            <ExploreTubeCard
              key={item.key}
              performer={item.performer}
              onSelect={() => onSelectCard(item.performer)}
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

      {theaterIndex !== null ? (
        <ExploreDesktopTheaterModal
          performers={cards}
          activeIndex={theaterIndex}
          onClose={closeTheater}
          onChangeIndex={setTheaterIndex}
        />
      ) : null}
    </>
  );
}
