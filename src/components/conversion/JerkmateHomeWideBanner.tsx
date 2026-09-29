import Image from "next/image";
import { pickJerkmateNaturalBannerSrc } from "@/lib/ads/jerkmateLocalBanner";
import { JERKMATE_MOBILE_GIF_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";
import {
  SponsoredAdOverlays,
  SponsoredFreePromoLine,
} from "@/components/ads/SponsoredAdOverlays";

/** Full-width responsive leaderboard — home catalog (local creative). */
export function JerkmateHomeWideBanner() {
  const src = pickJerkmateNaturalBannerSrc(4);
  return (
    <div className="mb-2 hidden w-full justify-center overflow-hidden px-2 pt-0 md:flex">
      <a
        href={JERKMATE_MOBILE_GIF_TRACKING_URL}
        target="_blank"
        rel="nofollow noopener sponsored"
        className="block w-full max-w-[970px] overflow-hidden rounded-lg border border-pink-500/30 shadow-lg transition-all hover:border-pink-400/45"
      >
        <div className="relative aspect-[300/100] w-full">
          <Image
            src={src}
            alt="Sponsored live cam offer"
            fill
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 970px"
            loading="lazy"
            decoding="async"
          />
          <SponsoredAdOverlays badge="SPONSORED" />
        </div>
        <div className="bg-zinc-950 px-2 py-1">
          <SponsoredFreePromoLine />
        </div>
      </a>
    </div>
  );
}
