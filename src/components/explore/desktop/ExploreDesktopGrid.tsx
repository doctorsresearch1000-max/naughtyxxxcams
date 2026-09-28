"use client";

import { useCallback, useMemo, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ExploreDesktopGridCard } from "@/components/explore/desktop/ExploreDesktopGridCard";
import { ExploreDesktopTheaterModal } from "@/components/explore/desktop/ExploreDesktopTheaterModal";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { useInfiniteScrollBatch } from "@/hooks/useInfiniteScrollBatch";

type ExploreDesktopGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

const DESKTOP_BATCH = 40;

export function ExploreDesktopGrid({
  performers,
  emptyMessage = "No results. Try another filter or search.",
}: ExploreDesktopGridProps) {
  const cards = useMemo(
    () => filterFeedPerformers(performers),
    [performers],
  );

  const { visibleCount, sentinelRef, hasMore } = useInfiniteScrollBatch(
    cards.length,
    DESKTOP_BATCH,
  );

  const visibleCards = useMemo(
    () => cards.slice(0, visibleCount),
    [cards, visibleCount],
  );

  const [theaterIndex, setTheaterIndex] = useState<number | null>(null);

  const openTheater = useCallback(
    (performer: FeedPerformer) => {
      const idx = cards.findIndex((p) => p.feedKey === performer.feedKey);
      setTheaterIndex(idx >= 0 ? idx : 0);
    },
    [cards],
  );

  const closeTheater = useCallback(() => setTheaterIndex(null), []);

  if (cards.length === 0) {
    return (
      <p className="rounded-2xl bg-[#1C1C1E] p-6 text-center text-sm text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
        data-explore-desktop-grid="v1"
      >
        {visibleCards.map((performer) => (
          <ExploreDesktopGridCard
            key={performer.feedKey}
            performer={performer}
            onSelect={() => openTheater(performer)}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-10 w-full" aria-hidden />
      {hasMore ? (
        <p className="py-4 text-center text-xs font-semibold text-zinc-500">
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
