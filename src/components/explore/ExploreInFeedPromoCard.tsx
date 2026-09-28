"use client";

import Image from "next/image";
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
      className="group flex flex-col overflow-hidden rounded-lg bg-[#141416] ring-1 ring-pink-500/25 transition hover:ring-pink-400/45"
    >
      <a
        href={promo.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
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

        <span className="absolute left-1.5 top-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-pink-200 ring-1 ring-pink-400/35">
          Promoted
        </span>

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
        <p className="mt-0.5 text-[11px] font-medium text-zinc-300">
          {promo.subtitle}
        </p>
      </div>
    </article>
  );
}
