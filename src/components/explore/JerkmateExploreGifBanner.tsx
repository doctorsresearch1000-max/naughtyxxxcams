import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import { pickJerkmateNaturalBannerSrc } from "@/lib/ads/jerkmateLocalBanner";
import { JERKMATE_EXPLORE_GIF_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";

/** Natural-width sponsor strip — `/explore`, below live story avatars. */
export function JerkmateExploreGifBanner() {
  return (
    <JerkmateNaturalBanner
      href={JERKMATE_EXPLORE_GIF_TRACKING_URL}
      imageSrc={pickJerkmateNaturalBannerSrc(5)}
      alt="Sponsored live cam offer"
      className="my-3 lg:my-2"
    />
  );
}
