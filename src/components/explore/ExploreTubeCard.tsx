"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import {
  formatCardViewLabel,
  performerLanguagePills,
} from "@/lib/media/performerCardMeta";
import { warmPerformerStream } from "@/lib/feed/streamEmbedWarmup";
import { useDebouncedHover } from "@/hooks/useDebouncedHover";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type ExploreTubeCardProps = {
  performer: FeedPerformer;
  onSelect: () => void;
};

function roomTitle(performer: FeedPerformer): string {
  const custom = performer.customTags?.[0]?.trim();
  if (custom) return custom;
  const auto = performer.autoTags?.find((t) => t.length > 8)?.trim();
  if (auto) return auto;
  return "Live now";
}

export function ExploreTubeCard({ performer, onSelect }: ExploreTubeCardProps) {
  const [finePointerHover, setFinePointerHover] = useState(false);
  const { active: hoverPreview, onPointerEnter, onPointerLeave } =
    useDebouncedHover(150);

  const handle = performerDisplayHandle(
    performer.nameClean || performer.name,
  ).replace(/^@/, "");
  const viewsLabel = formatCardViewLabel(performer);
  const langs = performerLanguagePills(performer).join(" · ");
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

  return (
    <article className="group min-w-0 overflow-hidden bg-transparent">
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={finePointerHover ? onPointerEnter : undefined}
        onMouseLeave={finePointerHover ? onPointerLeave : undefined}
        className="relative block w-full min-w-0 text-left"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900">
          <Image
            src={performer.posterUrl}
            alt={handle}
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
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
            <span
              className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
              Live
            </span>
          ) : null}

          <span
            className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-zinc-300 backdrop-blur-sm"
          >
            Streamate
          </span>
        </div>

        <div className="space-y-0.5 bg-transparent px-0.5 pb-1 pt-1.5">
          <div className="flex min-w-0 items-center justify-between gap-1">
            <p className="min-w-0 truncate text-xs font-semibold text-white">
              {handle}
            </p>
            <span className="shrink-0 text-[10px] font-bold text-[#39FF14]">
              F
            </span>
          </div>
          <p className="truncate text-[11px] text-zinc-400">
            {viewsLabel}
            {langs ? ` · ${langs}` : ""}
          </p>
          <p className="truncate text-[10px] text-zinc-500">
            {roomTitle(performer)}
          </p>
        </div>
      </button>
    </article>
  );
}
