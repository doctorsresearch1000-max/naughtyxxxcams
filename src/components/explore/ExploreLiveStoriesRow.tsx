"use client";

import Image from "next/image";
import Link from "next/link";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { pickCoverUrl } from "@/lib/crackrevenue/api";
import { LiveBadge } from "@/components/cams/LiveBadge";
import { StoryAvatarRing } from "@/components/cams/StoryAvatarRing";
import {
  performerDisplayHandle,
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";

type ExploreLiveStoriesRowProps = {
  performers: CrackPerformer[];
};

const SCROLL_CLASS =
  "hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scroll-smooth px-0.5 py-4 lg:gap-4";

const AVATAR_INNER =
  "relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-[#1C1C1E] lg:h-20 lg:w-20 lg:rounded-full xl:h-24 xl:w-24";

export function ExploreLiveStoriesRow({ performers }: ExploreLiveStoriesRowProps) {
  if (performers.length === 0) return null;

  return (
    <section
      className="relative z-10 w-full max-w-full shrink-0 overflow-visible"
      aria-label="Live stories"
    >
      <div className={SCROLL_CLASS}>
        {performers.map((performer) => {
          const path = performerProfilePathFromPerformer(performer);
          const handle = performerDisplayHandle(
            performer.nameClean || performer.name,
          );
          const thumb = pickCoverUrl(performer);
          const inner = (
            <div className="flex w-[76px] shrink-0 snap-start flex-col items-center gap-2 lg:w-20 xl:w-24">
              <StoryAvatarRing>
                <div className={AVATAR_INNER}>
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={handle}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1280px) 80px, 96px"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-800" />
                  )}
                  <span className="absolute bottom-1 right-1 z-10">
                    <LiveBadge
                      size="sm"
                      className="!px-1.5 !py-0.5 !text-[10px] !font-bold shadow-lg ring-1 ring-black/40"
                    />
                  </span>
                </div>
              </StoryAvatarRing>
              <span
                className="max-w-[90px] truncate text-center text-xs font-medium text-zinc-300"
              >
                {handle.replace(/^@/, "")}
              </span>
            </div>
          );
          return path ? (
            <Link
              key={performer.itemId ?? handle}
              href={path}
              className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
            >
              {inner}
            </Link>
          ) : (
            <div key={performer.itemId ?? handle} className="shrink-0">
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
