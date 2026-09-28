"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ExploreDesktopTheaterModal } from "@/components/explore/desktop/ExploreDesktopTheaterModal";
import { ExploreTubeCard } from "@/components/explore/ExploreTubeCard";
import { EXPLORE_TUBE_GRID_CLASS } from "@/lib/explore/exploreTubeLayout";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useInfiniteScrollBatch } from "@/hooks/useInfiniteScrollBatch";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";

type ExploreTubeGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

const TUBE_BATCH = 48;

export function ExploreTubeGrid({
  performers,
  emptyMessage = "No results. Try another filter or search.",
}: ExploreTubeGridProps) {
  const router = useRouter();
  const cards = useMemo(
    () => filterFeedPerformers(performers),
    [performers],
  );

  const { visibleCount, sentinelRef, hasMore } = useInfiniteScrollBatch(
    cards.length,
    TUBE_BATCH,
  );

  const visibleCards = useMemo(
    () => cards.slice(0, visibleCount),
    [cards, visibleCount],
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
      <div className={EXPLORE_TUBE_GRID_CLASS} data-explore-tube-grid="v1">
        {visibleCards.map((performer) => (
          <ExploreTubeCard
            key={performer.feedKey}
            performer={performer}
            onSelect={() => onSelectCard(performer)}
          />
        ))}
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
