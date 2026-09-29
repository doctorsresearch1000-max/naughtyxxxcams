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
  "hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scroll-smooth py-1 pl-0.5 pr-2 lg:gap-4";

export function ExploreLiveStoriesRow({ performers }: ExploreLiveStoriesRowProps) {
  if (performers.length === 0) return null;

  return (
    <section
      className="relative z-10 w-full min-h-[104px] shrink-0 lg:min-h-[112px]"
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
            <div className="flex w-[80px] shrink-0 snap-start flex-col items-center gap-2 lg:w-[88px]">
              <StoryAvatarRing>
                <div
                  className="relative h-[72px] w-[72px] overflow-hidden rounded-[22px] bg-[#1C1C1E] lg:h-[76px] lg:w-[76px] lg:rounded-[20px]"
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={handle}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-800" />
                  )}
                  <span
                    className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/85 to-transparent pb-0.5 pt-3"
                  >
                    <LiveBadge size="sm" className="scale-[0.85] origin-bottom" />
                  </span>
                </div>
              </StoryAvatarRing>
              <span className="max-w-[80px] truncate text-center text-[10px] font-bold text-zinc-100 lg:max-w-[88px] lg:text-[11px]">
                {handle.replace(/^@/, "")}
              </span>
            </div>
          );
          return path ? (
            <Link
              key={performer.itemId ?? handle}
              href={path}
              className="shrink-0"
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
