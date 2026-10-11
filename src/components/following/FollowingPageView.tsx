"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { pickCoverUrl } from "@/lib/crackrevenue/api";
import { ModelTubeCard } from "@/components/cams/ModelTubeCard";
import { LiveBadge } from "@/components/cams/LiveBadge";
import { FollowingOfflineList } from "@/components/following/FollowingOfflineList";
import { FollowingJerkmatePromoBanner } from "@/components/following/FollowingJerkmatePromoBanner";
import { LiveNearbyCarousel } from "@/components/following/LiveNearbyCarousel";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import {
  FOLLOWING_DESKTOP_SHELL_CLASS,
  FOLLOWING_MODEL_GRID_CLASS,
} from "@/lib/following/followingLayout";
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

  const bannerPreviewUrl = useMemo(() => {
    const fromStory = nearby.find((n) => n.image?.trim())?.image;
    if (fromStory) return fromStory;
    const fromGrid = liveGrid[0] ? pickCoverUrl(liveGrid[0]) : null;
    return fromGrid || null;
  }, [nearby, liveGrid]);

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
    <div className="flex flex-col gap-4 overflow-x-hidden pb-1 lg:gap-5">
      <section
        className={`${FOLLOWING_DESKTOP_SHELL_CLASS} order-1 overflow-visible`}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--nx-action)]">
          Following stories
        </span>
        <div className="mt-2">
          <LiveNearbyCarousel items={nearby} />
        </div>
      </section>

      <div className={`order-2 ${FOLLOWING_DESKTOP_SHELL_CLASS}`}>
        <FollowingJerkmatePromoBanner previewImageUrl={bannerPreviewUrl} />
      </div>

      <section className={`order-3 ${FOLLOWING_DESKTOP_SHELL_CLASS}`}>
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

        <div className="mb-4 flex flex-wrap items-center gap-2 lg:mb-5">
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

        <div className={`${FOLLOWING_MODEL_GRID_CLASS} mb-6 w-full`}>
          {gridCards.map((performer, index) => (
            <ModelTubeCard
              key={performer.feedKey}
              performer={performer}
              gridIndex={index}
              priority={index < 6}
              enableDesktopPreview
              tileAspectClass="aspect-[4/3] lg:aspect-[16/10]"
              tileImageClass="object-cover object-top"
            />
          ))}
        </div>

        {gridCards.length === 0 ? (
          <p className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center text-sm text-zinc-400">
            No live followed models right now. Check offline list or explore new
            talent.
          </p>
        ) : null}

        <div className="border-t border-white/[0.06] pt-5 lg:pt-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Offline
          </span>
          <FollowingOfflineList items={offline} />
        </div>
      </section>
    </div>
  );
}
