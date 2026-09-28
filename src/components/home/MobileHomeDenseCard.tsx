"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { CamCardMeta } from "@/components/cams/CamCardMeta";
import { prefetchPerformerOnIntent } from "@/lib/feed/prefetchPerformerNavigation";
import {
  performerDisplayHandle,
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";

type MobileHomeDenseCardProps = {
  performer: FeedPerformer;
};

export function MobileHomeDenseCard({ performer }: MobileHomeDenseCardProps) {
  const router = useRouter();
  const href = performerProfilePathFromPerformer(performer) ?? "/explore";
  const handle = performerDisplayHandle(
    performer.nameClean || performer.name,
  ).replace(/^@/, "");
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

        </div>

        <div className="px-2 pb-2.5 pt-2">
          <CamCardMeta performer={performer} variant="home" />
        </div>
      </Link>
    </article>
  );
}
