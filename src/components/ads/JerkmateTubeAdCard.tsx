"use client";

import { useEffect, useState } from "react";
import type { JerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";
import { pickJerkmateGridCreative } from "@/lib/ads/jerkmateGridCreatives";
import {
  SponsoredAdOverlays,
  SponsoredFreePromoLine,
} from "@/components/ads/SponsoredAdOverlays";
import { getSyntheticViewsLabel } from "@/lib/media/getSyntheticViews";
import { SecureAffiliateLink } from "@/components/conversion/SecureAffiliateLink";

type JerkmateTubeAdCardProps = {
  adSlotIndex: number;
  /** First viewport / first in-grid promo slot */
  priority?: boolean;
  /** Match adjacent ModelTubeCard aspect (desktop grid alignment). */
  tileAspectClass?: string;
};

/**
 * In-grid Jerkmate slot — same footprint as ModelTubeCard + sponsored metadata.
 */
export function JerkmateTubeAdCard({
  adSlotIndex,
  priority = false,
  tileAspectClass = "aspect-[4/3]",
}: JerkmateTubeAdCardProps) {
  const promo = `jerkmate-grid-${adSlotIndex}` as JerkmatePromoKey;
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
      <SecureAffiliateLink
        promo={promo}
        className="group block min-w-0"
      >
        <div
          className={`relative overflow-hidden rounded-[var(--nx-radius-card)] bg-zinc-950 p-[2px] shadow-[0_0_20px_rgba(236,72,153,0.28)] ring-2 ring-pink-500 ring-offset-1 ring-offset-black transition duration-300 group-hover:shadow-[0_0_26px_rgba(34,211,238,0.35)] group-hover:ring-cyan-400 ${tileAspectClass}`}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[calc(var(--nx-radius-card)-2px)] bg-zinc-900">
            <img
              src={src}
              alt="Sponsored Jerkmate offer"
              loading={loadingAttr}
              fetchPriority={fetchPri}
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={onError}
              className={`h-full w-full object-cover transition duration-500 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {!loaded ? (
              <div
                className="absolute inset-0 animate-pulse bg-zinc-800"
                aria-hidden
              />
            ) : null}
            <SponsoredAdOverlays badge="AD" />
          </div>
        </div>
        <div className="mt-1.5 px-0.5">
          <p className="truncate text-[13px] font-extrabold text-white">
            Jerkmate
            <span className="ml-1 text-[9px] font-black uppercase text-pink-300">
              Partner
            </span>
          </p>
          <div className="flex items-center justify-between gap-2">
            <SponsoredFreePromoLine className="min-w-0 flex-1" />
            <span className="shrink-0 text-[10px] font-semibold text-zinc-500">
              {getSyntheticViewsLabel(`jerkmate-ad-${adSlotIndex}`)}
            </span>
          </div>
        </div>
      </SecureAffiliateLink>
    </article>
  );
}
