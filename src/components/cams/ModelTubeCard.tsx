"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { LiveBadge } from "@/components/cams/LiveBadge";
import { IconHeartFilled, IconHeartOutline } from "@/components/icons/LineIcons";
import { trackCardClick } from "@/lib/analytics/track";
import { resolveRoomTitle } from "@/lib/cams/roomTitleFilter";
import { uiStrings } from "@/lib/i18n/uiStrings";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import {
  camCardUsername,
  performerPrimaryLanguageCode,
} from "@/lib/media/performerCardMeta";
import { prefetchPerformerOnIntent } from "@/lib/feed/prefetchPerformerNavigation";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";
import {
  isCardFollowed,
  toggleCardFollow,
} from "@/lib/user/cardFollowStorage";

type ModelTubeCardProps = {
  performer: FeedPerformer;
  gridIndex: number;
  /** First visible row — LCP hints */
  priority?: boolean;
};

function platformLabel(performer: FeedPerformer): string | null {
  const src = performer.systemSource?.trim().toLowerCase();
  if (src === "jerkmate") return uiStrings.platformJerkmate;
  return null;
}

function genderAgeSuffix(performer: FeedPerformer): string {
  const age = performer.characteristic?.age;
  const gender = performer.characteristic?.gender?.trim();
  const parts: string[] = [];
  if (typeof age === "number" && age >= 18 && age <= 99) parts.push(String(age));
  if (gender && /^[fmt]$/i.test(gender)) parts.push(gender.toUpperCase());
  return parts.length ? ` · ${parts.join("")}` : "";
}

export function ModelTubeCard({
  performer,
  gridIndex,
  priority = false,
}: ModelTubeCardProps) {
  const href = performerProfilePathFromPerformer(performer) ?? "/explore";
  const isLive = performer.live !== false;
  const username = camCardUsername(performer);
  const roomTitle = resolveRoomTitle(performer);
  const lang = performerPrimaryLanguageCode(performer);
  const platform = platformLabel(performer);

  const [followed, setFollowed] = useState(() =>
    isCardFollowed(performer.feedKey),
  );

  const thumb =
    performer.posterUrl ||
    performer.liveSnapshotURL?.trim() ||
    performer.thumbnailUrl ||
    "";

  const onIntent = useCallback(() => {
    prefetchPerformerOnIntent(performer);
    trackCardClick(gridIndex, performer.feedKey);
  }, [gridIndex, performer]);

  const toggleFollow = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = toggleCardFollow(performer.feedKey);
      setFollowed(next);
    },
    [performer.feedKey],
  );

  return (
    <article className="min-w-0">
      <Link
        href={href}
        prefetch
        className="group block min-w-0"
        onPointerDown={onIntent}
        onTouchStart={onIntent}
      >
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[var(--nx-radius-card)] bg-zinc-900 ring-1 ring-zinc-800/80"
        >
          {thumb ? (
            <Image
              src={thumb}
              alt={username}
              fill
              sizes="(max-width: 640px) 50vw, 16vw"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={gridIndex === 0 ? "high" : priority ? "auto" : "low"}
              decoding="async"
              unoptimized
            />
          ) : null}

          <button
            type="button"
            onClick={toggleFollow}
            className="absolute left-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm"
            aria-label={followed ? "Unfollow" : "Follow"}
          >
            {followed ? (
              <IconHeartFilled size={16} className="text-[var(--nx-action)]" />
            ) : (
              <IconHeartOutline size={16} className="text-white" strokeWidth={1.5} />
            )}
          </button>

          {isLive ? (
            <span className="absolute right-1.5 top-1.5 z-10">
              <LiveBadge />
            </span>
          ) : (
            <span className="absolute right-1.5 top-1.5 z-10 rounded-md bg-zinc-800/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-300">
              {uiStrings.offline}
            </span>
          )}

          {platform ? (
            <span className="absolute bottom-1.5 right-1.5 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase text-zinc-300">
              {platform}
            </span>
          ) : null}
        </div>

        <div className="space-y-0.5 px-0.5 pb-1 pt-1.5">
          <p className="truncate text-[13px] font-bold leading-tight text-white">
            {username}
            <span className="font-semibold text-zinc-500">{genderAgeSuffix(performer)}</span>
          </p>
          <p className="text-right text-[11px] font-semibold uppercase text-zinc-400">
            {lang}
          </p>
          {roomTitle ? (
            <p className="truncate text-[11px] text-zinc-400">{roomTitle}</p>
          ) : null}
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
