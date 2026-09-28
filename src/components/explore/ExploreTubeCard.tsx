"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { formatExploreViews } from "@/lib/explore/exploreGrid";
import {
  estimateViewerCount,
  formatViewerCount,
} from "@/lib/feed/viewerCount";
import { useDebouncedHover } from "@/hooks/useDebouncedHover";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type ExploreTubeCardProps = {
  performer: FeedPerformer;
  onSelect: () => void;
};

function performerLanguages(performer: FeedPerformer): string {
  const langs = performer.characteristic?.languages ?? [];
  if (langs.length === 0) return "en";
  return langs
    .slice(0, 2)
    .map((lang) => lang.trim().slice(0, 2).toLowerCase())
    .filter(Boolean)
    .join(", ");
}

function hasHdTag(performer: FeedPerformer): boolean {
  const blob = [
    ...(performer.autoTags ?? []),
    ...(performer.characteristicsTags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes("hd");
}

export function ExploreTubeCard({ performer, onSelect }: ExploreTubeCardProps) {
  const [finePointerHover, setFinePointerHover] = useState(false);
  const { active: hoverPreview, onPointerEnter, onPointerLeave } =
    useDebouncedHover(150);

  const handle = performerDisplayHandle(
    performer.nameClean || performer.name,
  ).replace(/^@/, "");
  const views = formatExploreViews(performer);
  const viewers = formatViewerCount(
    estimateViewerCount(performer, performer.feedKey),
  );
  const isLive = performer.live !== false;
  const hoverStill =
    performer.liveSnapshotURL?.trim() || performer.posterUrl || "";
  const showHoverPreview =
    finePointerHover && hoverPreview && Boolean(hoverStill);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointerHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lg bg-[#141416] ring-1 ring-white/[0.05] transition hover:ring-[#39FF14]/35"
    >
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={finePointerHover ? onPointerEnter : undefined}
        onMouseLeave={finePointerHover ? onPointerLeave : undefined}
        className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 text-left"
      >
        <Image
          src={performer.posterUrl}
          alt={handle}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className={`object-cover transition-opacity duration-200 ${
            showHoverPreview ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
          decoding="async"
          unoptimized
        />

        {finePointerHover && hoverStill ? (
          <Image
            src={hoverStill}
            alt=""
            fill
            sizes="20vw"
            aria-hidden
            className={`pointer-events-none object-cover transition-opacity duration-200 ${
              showHoverPreview ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            decoding="async"
            unoptimized
          />
        ) : null}

        {isLive ? (
          <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#39FF14]" />
            Live
          </span>
        ) : null}

        {hasHdTag(performer) ? (
          <span className="absolute left-1.5 top-8 rounded bg-zinc-950/80 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-[#39FF14] ring-1 ring-[#39FF14]/30">
            HD
          </span>
        ) : null}

        <span className="absolute right-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-[#39FF14]">
          {viewers}
        </span>

        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-200">
          Streamate
        </span>
      </button>

      <div className="px-2 py-2">
        <p className="truncate text-sm font-extrabold text-white">
          {handle}
          <span className="ml-1 text-[10px] font-black text-[#39FF14]">F</span>
        </p>
        <p className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span>{views} views</span>
          <span className="shrink-0 uppercase">{performerLanguages(performer)}</span>
        </p>
      </div>
    </article>
  );
}
