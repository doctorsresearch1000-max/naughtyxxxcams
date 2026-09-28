"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import {
  formatCardViewLabel,
  performerLanguagePills,
} from "@/lib/media/performerCardMeta";
import { prefetchPerformerOnIntent } from "@/lib/feed/prefetchPerformerNavigation";
import {
  performerDisplayHandle,
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";

type MobileHomeDenseCardProps = {
  performer: FeedPerformer;
};

function roomTitle(performer: FeedPerformer): string {
  const custom = performer.customTags?.[0]?.trim();
  if (custom) return custom;
  const auto = performer.autoTags?.find((t) => t.length > 8)?.trim();
  if (auto) return auto;
  return "Live now — tap to watch";
}

export function MobileHomeDenseCard({ performer }: MobileHomeDenseCardProps) {
  const router = useRouter();
  const href = performerProfilePathFromPerformer(performer) ?? "/explore";
  const handle = performerDisplayHandle(
    performer.nameClean || performer.name,
  ).replace(/^@/, "");
  const viewsLabel = formatCardViewLabel(performer);
  const langs = performerLanguagePills(performer).join(" · ");
  const thumb =
    performer.liveSnapshotURL?.trim() ||
    performer.posterUrl ||
    performer.thumbnailUrl ||
    "";

  const warmRoute = useCallback(() => {
    prefetchPerformerOnIntent(performer, (path) => router.prefetch(path));
  }, [performer, router]);

  return (
    <article className="min-w-0 overflow-hidden bg-transparent">
      <Link
        href={href}
        prefetch
        className="block min-w-0"
        onPointerDown={warmRoute}
        onTouchStart={warmRoute}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900">
          {thumb ? (
            <Image
              src={thumb}
              alt={handle}
              fill
              sizes="50vw"
              className="object-cover"
              loading="lazy"
              decoding="async"
              unoptimized
            />
          ) : null}

          <span
            className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            Live
          </span>

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
      </Link>
    </article>
  );
}
