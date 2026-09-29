"use client";

import Image from "next/image";
import { JERKMATE_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";
import { pickJerkmateGridCreative } from "@/lib/ads/jerkmateGridCreatives";

type JerkmateTubeAdCardProps = {
  adSlotIndex: number;
};

/**
 * In-grid Jerkmate slot — same footprint as ModelTubeCard, image only + highlight border.
 */
export function JerkmateTubeAdCard({ adSlotIndex }: JerkmateTubeAdCardProps) {
  const src = pickJerkmateGridCreative(adSlotIndex);

  return (
    <article className="min-w-0">
      <a
        href={JERKMATE_TRACKING_URL}
        target="_blank"
        rel="nofollow noopener sponsored"
        className="group block min-w-0"
        aria-label="Sponsored Jerkmate offer"
      >
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[var(--nx-radius-card)] bg-zinc-950 p-[2px] shadow-[0_0_20px_rgba(236,72,153,0.28)] ring-2 ring-pink-500 ring-offset-1 ring-offset-black transition duration-300 group-hover:shadow-[0_0_26px_rgba(34,211,238,0.35)] group-hover:ring-cyan-400"
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-[calc(var(--nx-radius-card)-3px)] bg-zinc-900"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 16vw"
              className="object-cover object-center transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:group-hover:scale-100"
              loading="lazy"
              decoding="async"
              unoptimized
            />
          </div>
        </div>
      </a>
    </article>
  );
}
