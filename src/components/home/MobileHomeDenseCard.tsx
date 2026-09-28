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
  const langPills = performerLanguagePills(performer);
  const thumb =
    performer.liveSnapshotURL?.trim() ||
    performer.posterUrl ||
    performer.thumbnailUrl ||
    "";

  const warmRoute = useCallback(() => {
    prefetchPerformerOnIntent(performer, (path) => router.prefetch(path));
  }, [performer, router]);

  return (
    <article className="mb-1 overflow-hidden rounded-md bg-zinc-950 ring-1 ring-white/[0.06]">
      <Link
        href={href}
        prefetch
        className="block"
        onPointerDown={warmRoute}
        onTouchStart={warmRoute}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-900">
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

          <span className="absolute right-1 top-1 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#39FF14]" />
            Live
          </span>

          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-zinc-200">
            Streamate
          </span>
        </div>

        <div className="space-y-1 px-2 pb-2.5 pt-1.5">
          <div className="flex items-center justify-between gap-1">
            <p className="min-w-0 truncate text-sm font-medium text-white">
              {handle}
            </p>
            <span className="shrink-0 text-[10px] font-black text-[#39FF14]">
              F
            </span>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs text-zinc-400">{viewsLabel}</span>
            <div className="flex shrink-0 gap-1">
              {langPills.map((code) => (
                <span
                  key={code}
                  className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-300 ring-1 ring-white/10"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-zinc-400">
            {roomTitle(performer)}
          </p>
        </div>
      </Link>
    </article>
  );
}
