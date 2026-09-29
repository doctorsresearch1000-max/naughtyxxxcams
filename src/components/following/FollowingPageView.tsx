"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ModelTubeCard } from "@/components/cams/ModelTubeCard";
import { LiveBadge } from "@/components/cams/LiveBadge";
import { FollowingOfflineList } from "@/components/following/FollowingOfflineList";
import { JerkmateFollowingGifBanner } from "@/components/following/JerkmateFollowingGifBanner";
import { LiveNearbyCarousel } from "@/components/following/LiveNearbyCarousel";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import {
  CATALOG_GRID_CLASS,
  MOBILE_HOME_GRID_CLASS,
} from "@/lib/layout/catalogGridLayout";
import type { FollowingPageData } from "@/lib/following/followingPageData";

type FollowingPageViewProps = FollowingPageData;

function formatUpdatedLabel(updatedAt: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));
  if (sec < 8) return "Updated just now";
  if (sec < 60) return `Updated ${sec}s ago`;
  return `Updated ${Math.floor(sec / 60)} min ago`;
}

export function FollowingPageView({
  nearby,
  liveGrid,
  offline,
  liveCount,
  followedTotal,
}: FollowingPageViewProps) {
  const router = useRouter();
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [, setClockTick] = useState(0);

  const gridCards = useMemo(
    () => filterFeedPerformers(liveGrid),
    [liveGrid],
  );

  useEffect(() => {
    const id = window.setInterval(() => setClockTick((t) => t + 1), 12_000);
    return () => window.clearInterval(id);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setUpdatedAt(Date.now());
    router.refresh();
    window.setTimeout(() => setRefreshing(false), 600);
  }, [router]);

  const subtitle =
    liveCount === 0
      ? "None of your models are live right now"
      : liveCount === 1
        ? "1 of your models is live now"
        : `${liveCount} of your ${followedTotal} models are live`;

  return (
    <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
      <section className="mb-6 lg:col-span-12 lg:mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--nx-action)]">
          Following stories
        </span>
        <div className="mt-2 lg:mt-3">
          <LiveNearbyCarousel items={nearby} />
        </div>
      </section>

      <div className="mb-2 lg:col-span-12">
        <JerkmateFollowingGifBanner />
      </div>

      <section className="lg:col-span-8 xl:col-span-9">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--nx-action)]">
          Following
        </span>
        <div className="mb-1 mt-1 flex items-center justify-between gap-3 lg:mt-2">
          <h1 className="text-2xl font-black tracking-tight text-white lg:text-3xl">
            Your models
          </h1>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-[#1C1C1E] text-sm text-[var(--nx-action)] transition hover:border-[var(--nx-action)]/40 hover:bg-zinc-900 disabled:opacity-60 lg:h-10 lg:w-10"
            aria-label="Refresh list"
          >
            <span className={refreshing ? "inline-block animate-spin" : ""}>
              🔄
            </span>
          </button>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-zinc-400 lg:text-sm">
          {subtitle}
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-2 lg:mb-6">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nx-action)]/35 bg-[var(--nx-action)]/10 px-2.5 py-1 text-[10px] font-bold text-[var(--nx-action)]"
          >
            <LiveBadge className="scale-90" />
            <span>{liveCount}</span>
          </span>
          <span className="text-[11px] font-medium text-zinc-500 lg:text-xs">
            {formatUpdatedLabel(updatedAt)}
          </span>
        </div>

        <div className={`mb-4 ${MOBILE_HOME_GRID_CLASS} lg:hidden`}>
          {gridCards.map((performer, index) => (
            <ModelTubeCard
              key={performer.feedKey}
              performer={performer}
              gridIndex={index}
              priority={index < 4}
            />
          ))}
        </div>

        <div className={`mb-4 hidden lg:grid ${CATALOG_GRID_CLASS}`}>
          {gridCards.map((performer, index) => (
            <ModelTubeCard
              key={performer.feedKey}
              performer={performer}
              gridIndex={index}
              priority={index < 8}
              enableDesktopPreview
            />
          ))}
        </div>
      </section>

      <section className="lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-[calc(var(--app-header-height,3.5rem)+1rem)]">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Offline
          </span>
          <FollowingOfflineList items={offline} />
        </div>
      </section>
    </div>
  );
}
