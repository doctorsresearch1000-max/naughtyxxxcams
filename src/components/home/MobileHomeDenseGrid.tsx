"use client";

import { useMemo } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
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
      className="mx-auto min-h-[var(--feed-viewport-height,100dvh)] w-full max-w-md flex-1 overflow-y-auto bg-[#f3f3f4] pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-black md:hidden"
      data-home-mobile-dense="v1"
    >
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-zinc-200/80 bg-[#f3f3f4]/95 px-2 py-2 backdrop-blur-sm">
        <h1 className="text-[13px] font-black uppercase tracking-tight text-black">
          Free live porn cams
        </h1>
        <span
          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-300 text-[10px] font-bold text-zinc-700"
          aria-hidden
        >
          i
        </span>
      </header>

      {!ready ? (
        <ExplorePerformerGridSkeleton />
      ) : cards.length === 0 ? (
        <p className="p-4 text-center text-sm text-zinc-600">
          Live models are loading. Try again in a moment.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-1.5 p-1.5">
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
