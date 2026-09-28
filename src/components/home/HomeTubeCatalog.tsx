"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExploreTubeGrid } from "@/components/explore/ExploreTubeGrid";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import {
  fetchFeedFullPerformers,
  readFeedPerformersCache,
  seedFeedPerformersCache,
} from "@/lib/feed/feedClientCache";

type HomeTubeCatalogProps = {
  initialPerformers: FeedPerformer[];
};

export function HomeTubeCatalog({ initialPerformers }: HomeTubeCatalogProps) {
  const [performers, setPerformers] = useState<FeedPerformer[]>(
    () => initialPerformers,
  );
  const [ready, setReady] = useState(() => initialPerformers.length > 0);

  useEffect(() => {
    seedFeedPerformersCache(initialPerformers);
    const cached = readFeedPerformersCache();
    if (cached?.performers.length) {
      setPerformers(cached.performers);
      setReady(true);
    }

    let cancelled = false;
    (async () => {
      try {
        const payload = await fetchFeedFullPerformers();
        if (cancelled) return;
        setPerformers(payload.performers);
        setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialPerformers]);

  const liveCount = performers.filter((p) => p.live !== false).length;

  return (
    <main
      className="mx-auto min-h-[var(--feed-viewport-height,100dvh)] w-full max-w-md flex-1 overflow-y-auto bg-[#0d0d0f] pb-24 text-white [-webkit-overflow-scrolling:touch] lg:max-w-[1800px] lg:pb-12 lg:pt-2"
      data-home-tube="v1"
    >
      <div className="px-3.5 pt-3 lg:px-6 lg:pt-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-xl font-black tracking-tight lg:text-2xl">
              Live cams
            </h1>
            <p className="text-[11px] text-zinc-500 lg:text-sm">
              Browse live models · Tap a card for profile · Desktop opens theater
            </p>
          </div>
          <span className="rounded-full bg-[#39FF14]/15 px-2.5 py-1 text-xs font-bold text-[#39FF14]">
            {liveCount} live
          </span>
        </div>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/explore"
            className="shrink-0 rounded-full bg-white px-3.5 py-2 text-[11px] font-bold text-black shadow-sm"
          >
            Explore all
          </Link>
          <Link
            href="/explore?cat=trending"
            className="shrink-0 rounded-full bg-[#1a1a1e] px-3.5 py-2 text-[11px] font-bold text-zinc-300 ring-1 ring-white/[0.06]"
          >
            Trending
          </Link>
          <Link
            href="/explore?cat=latina"
            className="shrink-0 rounded-full bg-[#1a1a1e] px-3.5 py-2 text-[11px] font-bold text-zinc-300 ring-1 ring-white/[0.06]"
          >
            Latina
          </Link>
          <Link
            href="/explore?cat=milf"
            className="shrink-0 rounded-full bg-[#1a1a1e] px-3.5 py-2 text-[11px] font-bold text-zinc-300 ring-1 ring-white/[0.06]"
          >
            MILF
          </Link>
        </div>
      </div>

      {!ready ? (
        <ExplorePerformerGridSkeleton />
      ) : (
        <ExploreTubeGrid performers={performers} />
      )}
    </main>
  );
}
