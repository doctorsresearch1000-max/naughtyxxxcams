"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FollowingLiveGrid } from "@/components/following/FollowingLiveGrid";
import { FollowingOfflineList } from "@/components/following/FollowingOfflineList";
import { LiveNearbyCarousel } from "@/components/following/LiveNearbyCarousel";
import type { FollowingPageData } from "@/lib/following/followingPageData";

type FollowingPageViewProps = FollowingPageData;

function formatUpdatedLabel(updatedAt: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));
  if (sec < 8) return "Actualizado ahora";
  if (sec < 60) return `Actualizado hace ${sec}s`;
  return `Actualizado hace ${Math.floor(sec / 60)} min`;
}

export function FollowingPageView({
  nearby,
  liveCards,
  offline,
  liveCount,
  followedTotal,
}: FollowingPageViewProps) {
  const router = useRouter();
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [, setClockTick] = useState(0);

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
      ? "Ninguna de tus modelos está en directo ahora"
      : liveCount === 1
        ? "1 de tus modelos está transmitiendo ahora"
        : `${liveCount} de tus ${followedTotal} modelos están en directo`;

  return (
    <>
      <section className="mb-6">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#39FF14]">
          TRANSMISIONES CERCANAS
        </span>
        <div className="mt-2">
          <LiveNearbyCarousel items={nearby} />
        </div>
      </section>

      <section>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#39FF14]">
          SIGUIENDO
        </span>
        <div className="mb-1 mt-1 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black tracking-tight text-white">
            Tus Modelos
          </h1>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-[#1C1C1E] text-sm text-[#39FF14] transition hover:border-[#39FF14]/40 hover:bg-zinc-900 disabled:opacity-60"
            aria-label="Actualizar lista"
          >
            <span className={refreshing ? "inline-block animate-spin" : ""}>
              🔄
            </span>
          </button>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-zinc-400">{subtitle}</p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#39FF14]/35 bg-[#39FF14]/10 px-2.5 py-1 text-[10px] font-bold text-[#39FF14]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF14] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39FF14]" />
            </span>
            LIVE · {liveCount}
          </span>
          <span className="text-[11px] font-medium text-zinc-500">
            {formatUpdatedLabel(updatedAt)}
          </span>
        </div>

        <div className="mb-8">
          <FollowingLiveGrid cards={liveCards} />
        </div>
      </section>

      <section>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Desconectadas
        </span>
        <FollowingOfflineList items={offline} />
      </section>
    </>
  );
}
