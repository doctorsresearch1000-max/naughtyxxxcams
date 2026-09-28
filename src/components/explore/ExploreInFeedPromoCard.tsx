"use client";

import Image from "next/image";
import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";
import type { ExploreInFeedPromo } from "@/lib/explore/exploreInFeedPromo";

type ExploreInFeedPromoCardProps = {
  promo: ExploreInFeedPromo;
};

export function ExploreInFeedPromoCard({ promo }: ExploreInFeedPromoCardProps) {
  const cover =
    promo.coverUrl ||
    "https://www.imglnky.com/8780/PMKT-1157_DESIGN-16618_BannersWebinar_AmyPose_300100.gif";

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lg bg-[#141416] ring-1 ring-amber-400/20 transition hover:ring-amber-300/45"
    >
      <AffiliateOutboundLink
        href={promo.affiliateUrl}
        className="relative block aspect-[3/4] w-full overflow-hidden bg-zinc-900 text-left lg:aspect-[4/5]"
      >
        <Image
          src={cover}
          alt={promo.title}
          fill
          sizes="(max-width: 1024px) 33vw, 20vw"
          className="object-cover"
          unoptimized
        />

        <span className="absolute left-1.5 top-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-200 ring-1 ring-amber-400/30">
          Partner
        </span>

        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-200">
          Jerkmate
        </span>
      </AffiliateOutboundLink>

      <div className="px-2 py-2">
        <p className="truncate text-sm font-extrabold text-white">
          {promo.title}
          <span className="ml-1 text-[9px] font-black uppercase text-amber-300">
            Ad
          </span>
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-zinc-300">
          {promo.subtitle}
        </p>
      </div>
    </article>
  );
}
