import Image from "next/image";
import { pickJerkmateNaturalBannerSrc } from "@/lib/ads/jerkmateLocalBanner";
import { JERKMATE_MOBILE_GIF_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";
import {
  SponsoredAdOverlays,
  SponsoredFreePromoLine,
} from "@/components/ads/SponsoredAdOverlays";

/** Full-bleed mobile banner — local creative only (no remote CDN error pages). */
export function JerkmateHomeMobileGifBanner() {
  const src = pickJerkmateNaturalBannerSrc(0);
  return (
    <div className="my-4 w-full overflow-hidden md:hidden">
      <a
        href={JERKMATE_MOBILE_GIF_TRACKING_URL}
        target="_blank"
        rel="nofollow noopener sponsored"
        className="block w-full overflow-hidden rounded-xl border border-pink-500/30 bg-zinc-950 shadow-md"
      >
        <div className="relative aspect-[300/100] w-full">
          <Image
            src={src}
            alt="Sponsored live cam offer"
            fill
            unoptimized
            className="object-cover object-center"
            sizes="100vw"
            loading="lazy"
            decoding="async"
          />
          <SponsoredAdOverlays badge="AD" />
        </div>
        <div className="px-2 py-1.5">
          <SponsoredFreePromoLine />
        </div>
      </a>
    </div>
  );
}
