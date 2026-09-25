"use client";

import Image from "next/image";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import {
  performerMetaLine,
  performerStarRating,
} from "@/lib/desktop/desktopCatalogFilters";
import {
  estimateViewerCount,
  formatViewerCount,
} from "@/lib/feed/viewerCount";
import { warmPerformerStream } from "@/lib/feed/streamEmbedWarmup";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type DesktopLiveModelCardProps = {
  performer: FeedPerformer;
  onSelect: () => void;
};

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden className={i < full ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
      <span className="ml-0.5 font-semibold text-zinc-300">{rating.toFixed(1)}</span>
    </span>
  );
}

function hasInteractiveToy(performer: FeedPerformer): boolean {
  const blob = [
    ...(performer.autoTags ?? []),
    ...(performer.characteristicsTags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes("toy") || blob.includes("interactive");
}

function hasHd(performer: FeedPerformer): boolean {
  const blob = [
    ...(performer.autoTags ?? []),
    ...(performer.characteristicsTags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes("hd");
}

export function DesktopLiveModelCard({
  performer,
  onSelect,
}: DesktopLiveModelCardProps) {
  const handle = performerDisplayHandle(
    performer.nameClean || performer.name,
  ).replace(/^@/, "");
  const age = performer.characteristic?.age;
  const viewers = formatViewerCount(
    estimateViewerCount(performer, performer.feedKey),
  );
  const rating = performerStarRating(performer);
  const lang =
    performer.characteristic?.languages?.[0]?.slice(0, 2).toUpperCase() ||
    "EN";
  const isNew = (performer.systemScore ?? 0) < 0.22;
  const hoverSnap = performer.liveSnapshotURL || performer.posterUrl;

  const prewarm = () => {
    warmPerformerStream(performer.feedKey, performer.embedPlan);
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={prewarm}
      onFocus={prewarm}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-zinc-900 text-left ring-1 ring-zinc-800/80 transition hover:ring-[#39FF14]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-800">
        <Image
          src={performer.posterUrl}
          alt={handle}
          fill
          sizes="16vw"
          className="object-cover transition duration-300 group-hover:scale-[1.04] group-hover:opacity-0"
          unoptimized
        />
        {hoverSnap ? (
          <Image
            src={hoverSnap}
            alt=""
            fill
            sizes="16vw"
            className="object-cover opacity-0 transition duration-300 group-hover:scale-[1.04] group-hover:opacity-100"
            unoptimized
            aria-hidden
          />
        ) : null}

        <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1">
          <span className="rounded-md bg-[#39FF14] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black">
            Live
          </span>
          {isNew ? (
            <span className="rounded-md bg-zinc-950/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#39FF14] ring-1 ring-[#39FF14]/40">
              New
            </span>
          ) : null}
          {hasHd(performer) ? (
            <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
              HD
            </span>
          ) : null}
          <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
            {lang}
          </span>
          {hasInteractiveToy(performer) ? (
            <span className="rounded-md bg-zinc-950/80 px-1.5 py-0.5 text-[9px] font-bold text-[#39FF14] ring-1 ring-[#39FF14]/35">
              Toy
            </span>
          ) : null}
        </div>

        <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-[#39FF14]">
          <span aria-hidden>♥</span>
          {viewers}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-2 pb-2 pt-8">
          <p className="truncate text-sm font-bold text-white">
            {handle}
            {typeof age === "number" ? `, ${age}` : ""}
          </p>
          <div className="mt-0.5 flex items-center justify-between gap-1">
            <StarRow rating={rating} />
          </div>
          <p className="mt-1 truncate text-[10px] text-zinc-400">
            {performerMetaLine(performer)}
          </p>
        </div>
      </div>
    </button>
  );
}
