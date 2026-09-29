"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CardBookmarkButton } from "@/components/cams/CardBookmarkButton";
import { CamCardMeta } from "@/components/cams/CamCardMeta";
import { LiveBadge } from "@/components/cams/LiveBadge";
import { PlatformBadgePill } from "@/components/cams/PlatformBadgePill";
import { CamCardImage } from "@/components/media/CamCardImage";
import { trackCardClick } from "@/lib/analytics/track";
import { uiStrings } from "@/lib/i18n/uiStrings";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { prefetchPerformerOnIntent } from "@/lib/feed/prefetchPerformerNavigation";
import { warmPerformerStream } from "@/lib/feed/streamEmbedWarmup";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";
import { useDebouncedHover } from "@/hooks/useDebouncedHover";

type ModelTubeCardProps = {
  performer: FeedPerformer;
  gridIndex: number;
  /** First visible row — LCP hints */
  priority?: boolean;
  /** Desktop quick-view modal (immersive room). */
  onQuickView?: (performer: FeedPerformer) => void;
  enableDesktopPreview?: boolean;
};

export function ModelTubeCard({
  performer,
  gridIndex,
  priority = false,
  onQuickView,
  enableDesktopPreview = false,
}: ModelTubeCardProps) {
  const href = performerProfilePathFromPerformer(performer) ?? "/explore";
  const isLive = performer.live !== false;
  const username =
    performer.nameClean || performer.name || "model";

  const [finePointerHover, setFinePointerHover] = useState(false);
  const { active: hoverPreview, onPointerEnter, onPointerLeave } =
    useDebouncedHover(180);

  const thumb =
    performer.posterUrl ||
    performer.liveSnapshotURL?.trim() ||
    performer.thumbnailUrl ||
    "";
  const hoverStill =
    performer.liveSnapshotURL?.trim() || performer.posterUrl || "";
  const showHoverPreview =
    enableDesktopPreview &&
    finePointerHover &&
    hoverPreview &&
    Boolean(hoverStill) &&
    isLive;

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointerHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!showHoverPreview) return;
    warmPerformerStream(performer.feedKey, performer.embedPlan, { pin: true });
  }, [showHoverPreview, performer.feedKey, performer.embedPlan]);

  const onIntent = useCallback(() => {
    prefetchPerformerOnIntent(performer);
    trackCardClick(gridIndex, performer.feedKey);
  }, [gridIndex, performer]);

  const openQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      prefetchPerformerOnIntent(performer);
      onQuickView?.(performer);
    },
    [onQuickView, performer],
  );

  return (
    <article className="min-w-0">
      <Link
        href={href}
        prefetch
        className="group block min-w-0"
        onPointerDown={onIntent}
        onTouchStart={onIntent}
        onClick={(e) => {
          if (onQuickView && (e.metaKey || e.ctrlKey || e.shiftKey)) {
            e.preventDefault();
            onQuickView(performer);
          }
        }}
        onMouseEnter={
          enableDesktopPreview && finePointerHover
            ? () => {
                onPointerEnter();
                prefetchPerformerOnIntent(performer);
              }
            : undefined
        }
        onMouseLeave={
          enableDesktopPreview && finePointerHover ? onPointerLeave : undefined
        }
      >
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[var(--nx-radius-card)] bg-zinc-900 ring-1 ring-zinc-800/80 lg:[content-visibility:auto] lg:[contain-intrinsic-size:300px]"
        >
          {thumb ? (
            <CamCardImage
              src={thumb}
              alt={username}
              priority={priority}
              fetchPriority={priority ? "high" : "low"}
              desktopWidths={enableDesktopPreview}
              hoverSrc={hoverStill}
              showHoverLayer={showHoverPreview}
              className="object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:group-hover:scale-100"
            />
          ) : null}

          {onQuickView && enableDesktopPreview ? (
            <button
              type="button"
              onClick={openQuickView}
              className="absolute bottom-2 left-2 z-10 hidden rounded-md bg-black/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white opacity-0 ring-1 ring-white/10 transition group-hover:opacity-100 lg:block"
            >
              Quick view
            </button>
          ) : null}

          <CardBookmarkButton performer={performer} />

          {isLive ? (
            <span className="absolute right-1.5 top-1.5 z-10">
              <LiveBadge />
            </span>
          ) : (
            <span className="absolute right-1.5 top-1.5 z-10 rounded-md bg-zinc-800/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-300">
              {uiStrings.offline}
            </span>
          )}

          <PlatformBadgePill performer={performer} />
        </div>

        <div className="px-0.5 pb-1 pt-1.5">
          <CamCardMeta performer={performer} variant="tube" />
        </div>
      </Link>
      {!isLive ? (
        <button
          type="button"
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 py-1 text-[10px] font-bold text-zinc-200"
          onClick={() => {
            /* TODO: Telegram notify bot */
          }}
        >
          {uiStrings.notifyWhenLive}
        </button>
      ) : null}
    </article>
  );
}
