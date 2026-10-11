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
  "hide-scrollbar flex max-h-[104px] snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden scroll-smooth py-1 pl-0.5 pr-2 lg:max-h-[110px] lg:gap-3.5 xl:gap-4";

export function ExploreLiveStoriesRow({ performers }: ExploreLiveStoriesRowProps) {
  if (performers.length === 0) return null;

  return (
    <section
      className="relative z-10 w-full shrink-0"
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
            <div className="flex w-[80px] shrink-0 snap-start flex-col items-center gap-1.5 lg:w-20 xl:w-24">
              <StoryAvatarRing>
                <div
                  className="relative aspect-square h-[72px] w-[72px] overflow-hidden rounded-[22px] bg-[#1C1C1E] lg:h-20 lg:w-20 lg:rounded-2xl xl:h-24 xl:w-24"
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
              <span className="max-w-[80px] truncate text-center text-[10px] font-bold text-zinc-100 lg:max-w-20 lg:text-xs xl:max-w-24">
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
