"use client";

import Image from "next/image";
import { uiStrings } from "@/lib/i18n/uiStrings";
import {
  JERKMATE_MOBILE_GIF_BANNER_URL,
  JERKMATE_MOBILE_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";
import { pickJerkmateHomeAdCopy } from "@/lib/ads/jerkmateHomeAdCopy";

type JerkmateTubeAdCardProps = {
  adSlotIndex: number;
};

/**
 * In-grid Jerkmate promo — mirrors {@link ModelTubeCard} layout for visual cohesion.
 */
export function JerkmateTubeAdCard({ adSlotIndex }: JerkmateTubeAdCardProps) {
  const copy = pickJerkmateHomeAdCopy(adSlotIndex);

  return (
    <article className="min-w-0">
      <a
        href={JERKMATE_MOBILE_GIF_TRACKING_URL}
        target="_blank"
        rel="nofollow noopener sponsored"
        className="group block min-w-0"
      >
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[var(--nx-radius-card)] bg-zinc-900 ring-1 ring-zinc-800/80"
        >
          <Image
            src={JERKMATE_MOBILE_GIF_BANNER_URL}
            alt={copy.brandLine}
            fill
            sizes="(max-width: 640px) 50vw, 16vw"
            className="object-cover object-center transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:group-hover:scale-100"
            loading="lazy"
            decoding="async"
            unoptimized
          />

          <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-zinc-200">
            {uiStrings.adLabel}
          </span>

          <span className="absolute right-1.5 top-1.5 z-10 rounded-md bg-[var(--nx-action)]/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">
            Partner
          </span>

          <span className="absolute bottom-1.5 right-1.5 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase text-zinc-300">
            {uiStrings.platformJerkmate}
          </span>
        </div>

        <div className="space-y-0.5 px-0.5 pb-1 pt-1.5">
          <p className="truncate text-[13px] font-bold leading-tight text-white">
            {copy.brandLine}
          </p>
          <p className="text-right text-[11px] font-semibold uppercase text-zinc-400">
            {copy.ctaLine}
          </p>
          <p className="truncate text-[11px] text-zinc-400">{copy.subtitle}</p>
        </div>
      </a>
    </article>
  );
}
