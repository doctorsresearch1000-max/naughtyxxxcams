"use client";

import { useMemo } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { JerkmateHomeMobileGifBanner } from "@/components/conversion/JerkmateHomeMobileGifBanner";
import { HomeCatalogSectionTitle } from "@/components/home/HomeCatalogSectionTitle";
import { MobileHomeDenseCard } from "@/components/home/MobileHomeDenseCard";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import { filterHomeMobilePerformers } from "@/lib/feed/filterHomeMobilePerformers";
import {
  CATALOG_PAGE_PADDING,
  MOBILE_HOME_GRID_CLASS,
} from "@/lib/layout/catalogGridLayout";
import { useInfiniteScrollBatch } from "@/hooks/useInfiniteScrollBatch";

const BATCH = 40;
const LEAD_CARD_COUNT = 4;

type MobileHomeDenseGridProps = {
  performers: CrackPerformer[];
  ready: boolean;
};

function MobileCardGrid({
  performers,
}: {
  performers: ReturnType<typeof filterHomeMobilePerformers>;
}) {
  return (
    <div className={MOBILE_HOME_GRID_CLASS}>
      {performers.map((performer) => (
        <MobileHomeDenseCard key={performer.feedKey} performer={performer} />
      ))}
    </div>
  );
}

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

  const leadCards = visible.slice(0, LEAD_CARD_COUNT);
  const restCards = visible.slice(LEAD_CARD_COUNT);
  const showMidBanner =
    visible.length >= LEAD_CARD_COUNT ||
    (!hasMore && visible.length > 0 && visible.length < LEAD_CARD_COUNT);

  return (
    <main
      className={`${CATALOG_PAGE_PADDING} w-full overflow-x-hidden bg-black pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-white md:hidden`}
      data-home-mobile-dense="v5-camb3-ref"
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
          {leadCards.length > 0 ? <MobileCardGrid performers={leadCards} /> : null}

          {showMidBanner ? <JerkmateHomeMobileGifBanner /> : null}

          {restCards.length > 0 ? (
            <MobileCardGrid performers={restCards} />
          ) : null}

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
