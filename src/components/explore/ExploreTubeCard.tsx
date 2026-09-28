"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import {
  formatCardViewLabel,
  performerLanguagePills,
} from "@/lib/media/performerCardMeta";
import {
  estimateViewerCount,
  formatViewerCount,
} from "@/lib/feed/viewerCount";
import { warmPerformerStream } from "@/lib/feed/streamEmbedWarmup";
import { useDebouncedHover } from "@/hooks/useDebouncedHover";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type ExploreTubeCardProps = {
  performer: FeedPerformer;
  onSelect: () => void;
};

function EyeIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 opacity-90"
    >
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
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
  const viewsLabel = formatCardViewLabel(performer);
  const langPills = performerLanguagePills(performer);
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

  useEffect(() => {
    if (!showHoverPreview) return;
    warmPerformerStream(performer.feedKey, performer.embedPlan);
  }, [showHoverPreview, performer.feedKey, performer.embedPlan]);

  const handlePointerEnter = () => {
    if (finePointerHover) onPointerEnter();
  };

  const handlePointerLeave = () => {
    if (finePointerHover) onPointerLeave();
  };

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lg bg-[#141416] ring-1 ring-white/[0.05] transition hover:ring-[#39FF14]/35"
    >
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 text-left lg:aspect-[4/5]"
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
            } ${showHoverPreview ? "lg:animate-pulse" : ""}`}
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

        <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
          <EyeIcon />
          {viewers}
        </span>

        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-200">
          Streamate
        </span>
      </button>

      <div className="px-2 py-2">
        <p className="truncate text-sm font-extrabold text-white lg:font-medium">
          {handle}
          <span className="ml-1 text-[10px] font-black text-[#39FF14]">F</span>
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-zinc-400 lg:text-zinc-300">
            {viewsLabel}
          </span>
          <div className="flex shrink-0 gap-1">
            {langPills.slice(0, 2).map((code) => (
              <span
                key={code}
                className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-300 ring-1 ring-white/10"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
