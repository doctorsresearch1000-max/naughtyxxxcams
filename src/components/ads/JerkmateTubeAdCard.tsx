"use client";

import { useEffect, useState } from "react";
import { JERKMATE_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";
import { pickJerkmateGridCreative } from "@/lib/ads/jerkmateGridCreatives";
import {
  SponsoredAdOverlays,
  SponsoredFreePromoLine,
} from "@/components/ads/SponsoredAdOverlays";
import { PlatformBadgePill } from "@/components/cams/PlatformBadgePill";
import { getSyntheticViewsLabel } from "@/lib/media/getSyntheticViews";

type JerkmateTubeAdCardProps = {
  adSlotIndex: number;
  /** First viewport / first in-grid promo slot */
  priority?: boolean;
};

/**
 * In-grid Jerkmate slot — same footprint as ModelTubeCard + sponsored metadata.
 */
export function JerkmateTubeAdCard({
  adSlotIndex,
  priority = false,
}: JerkmateTubeAdCardProps) {
  const [src, setSrc] = useState(() => pickJerkmateGridCreative(adSlotIndex));
  const [loaded, setLoaded] = useState(false);
  const [triedAlternate, setTriedAlternate] = useState(false);

  useEffect(() => {
    setSrc(pickJerkmateGridCreative(adSlotIndex));
    setLoaded(false);
    setTriedAlternate(false);
  }, [adSlotIndex]);

  const onError = () => {
    if (!triedAlternate) {
      setTriedAlternate(true);
      setSrc(pickJerkmateGridCreative(adSlotIndex + 7));
      return;
    }
    setLoaded(true);
  };

  const loadingAttr = priority ? "eager" : "lazy";
  const fetchPri = priority ? "high" : "auto";

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
            {!loaded ? (
              <div
                className="pointer-events-none absolute inset-0 -z-10 animate-pulse bg-zinc-800/90"
                aria-hidden
              />
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              width={320}
              height={240}
              decoding="async"
              loading={loadingAttr}
              fetchPriority={fetchPri}
              onLoad={() => setLoaded(true)}
              onError={onError}
              className="absolute inset-0 z-0 h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:group-hover:scale-100"
            />
            <SponsoredAdOverlays badge="AD" />
            <PlatformBadgePill jerkmate />
          </div>
        </div>

        <div className="space-y-0.5 px-0.5 pb-1 pt-1.5">
          <p className="truncate font-bold text-white text-xs md:text-sm">
            Jerkmate Live
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-zinc-400">
              {getSyntheticViewsLabel(`jerkmate-ad-${adSlotIndex}`)}
            </span>
            <span className="shrink-0 text-[11px] font-semibold uppercase text-zinc-400">
              EN
            </span>
          </div>
          <SponsoredFreePromoLine />
        </div>
      </a>
    </article>
  );
}
