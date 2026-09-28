"use client";

import Image from "next/image";
import Link from "next/link";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { formatExploreViews } from "@/lib/explore/exploreGrid";
import {
  performerDisplayHandle,
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";

type MobileHomeDenseCardProps = {
  performer: FeedPerformer;
};

function performerLanguages(performer: FeedPerformer): string {
  const langs = performer.characteristic?.languages ?? [];
  if (langs.length === 0) return "en";
  return langs
    .slice(0, 3)
    .map((lang) => lang.trim().slice(0, 2).toLowerCase())
    .filter(Boolean)
    .join(", ");
}

function roomTitle(performer: FeedPerformer): string {
  const custom = performer.customTags?.[0]?.trim();
  if (custom) return custom;
  const auto = performer.autoTags?.find((t) => t.length > 8)?.trim();
  if (auto) return auto;
  return "Live now — tap to watch";
}

export function MobileHomeDenseCard({ performer }: MobileHomeDenseCardProps) {
  const href = performerProfilePathFromPerformer(performer) ?? "/explore";
  const handle = performerDisplayHandle(
    performer.nameClean || performer.name,
  ).replace(/^@/, "");
  const views = formatExploreViews(performer);
  const thumb =
    performer.liveSnapshotURL?.trim() ||
    performer.posterUrl ||
    performer.thumbnailUrl ||
    "";

  return (
    <article className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5">
      <Link href={href} prefetch className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-200">
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

          <span className="absolute bottom-1 right-1 rounded bg-black px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-white">
            Streamate
          </span>
        </div>

        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between gap-1">
            <p className="min-w-0 truncate text-[12px] font-extrabold text-black">
              {handle}
            </p>
            <span className="shrink-0 text-[10px] font-black text-pink-600">
              F
            </span>
          </div>
          <p className="mt-0.5 flex items-center justify-between gap-1 text-[9px] text-zinc-500">
            <span>{views} views</span>
            <span className="uppercase">{performerLanguages(performer)}</span>
          </p>
          <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-snug text-zinc-800">
            {roomTitle(performer)}
          </p>
        </div>
      </Link>
    </article>
  );
}
