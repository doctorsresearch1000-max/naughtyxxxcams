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
  return "Live now";
}

export function MobileHomeDenseCard({ performer }: MobileHomeDenseCardProps) {
  const router = useRouter();
  const href = performerProfilePathFromPerformer(performer) ?? "/explore";
  const handle = performerDisplayHandle(
    performer.nameClean || performer.name,
  ).replace(/^@/, "");
  const viewsLabel = formatCardViewLabel(performer);
  const langs = performerLanguagePills(performer).join(", ");
  const thumb =
    performer.liveSnapshotURL?.trim() ||
    performer.posterUrl ||
    performer.thumbnailUrl ||
    "";

  const warmRoute = useCallback(() => {
    prefetchPerformerOnIntent(performer, (path) => router.prefetch(path));
  }, [performer, router]);

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-zinc-800/70 bg-zinc-950/40">
      <Link
        href={href}
        prefetch
        className="block min-w-0"
        onPointerDown={warmRoute}
        onTouchStart={warmRoute}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-zinc-900">
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
            className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-950/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#39FF14]"
              aria-hidden
            />
            Live
          </span>

          <span
            className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
          >
            Streamate
          </span>
        </div>

        <div className="space-y-1 px-2 pb-2.5 pt-2">
          <p className="min-w-0 truncate text-[13px] font-bold leading-tight text-white">
            {handle}
            <span className="ml-1.5 text-[11px] font-bold text-pink-400">
              F
            </span>
          </p>
          <div className="flex min-w-0 items-center justify-between gap-2 text-[11px] text-zinc-500">
            <span className="truncate">{viewsLabel}</span>
            {langs ? (
              <span className="shrink-0 truncate uppercase">{langs}</span>
            ) : null}
          </div>
          <p className="truncate text-[10px] leading-snug text-zinc-400">
            {roomTitle(performer)}
          </p>
        </div>
      </Link>
    </article>
  );
}
