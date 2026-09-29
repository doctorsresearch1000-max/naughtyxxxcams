"use client";

import Image from "next/image";
import type { ExploreInFeedPromo } from "@/lib/explore/exploreInFeedPromo";
import { pickJerkmateGridCreative } from "@/lib/ads/jerkmateGridCreatives";
import {
  SponsoredAdOverlays,
  SponsoredFreePromoLine,
} from "@/components/ads/SponsoredAdOverlays";
import { PlatformBadgePill } from "@/components/cams/PlatformBadgePill";

type ExploreInFeedPromoCardProps = {
  promo: ExploreInFeedPromo;
};

export function ExploreInFeedPromoCard({ promo }: ExploreInFeedPromoCardProps) {
  const cover = pickJerkmateGridCreative(0);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lg bg-[#141416] ring-1 ring-pink-500/25 transition hover:ring-pink-400/45"
    >
      <a
        href={promo.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-900 text-left"
      >
        <Image
          src={cover}
          alt={promo.title}
          fill
          sizes="(max-width: 1024px) 33vw, 20vw"
          className="object-cover"
          unoptimized
        />

        <SponsoredAdOverlays badge="AD" />
        <PlatformBadgePill jerkmate />

        <span className="absolute inset-x-2 bottom-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg shadow-pink-500/30">
          {promo.ctaLabel}
        </span>
      </a>

      <div className="px-2 py-2">
        <p className="truncate text-sm font-extrabold text-white">
          {promo.title}
          <span className="ml-1 text-[9px] font-black uppercase text-pink-300">
            Partner
          </span>
        </p>
        <SponsoredFreePromoLine className="mt-0.5" />
      </div>
    </article>
  );
}
