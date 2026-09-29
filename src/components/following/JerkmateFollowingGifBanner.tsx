import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import { pickJerkmateNaturalBannerSrc } from "@/lib/ads/jerkmateLocalBanner";
import { JERKMATE_MOBILE_GIF_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";

/** Home-origin 300×100 GIF — natural width on `/following`. */
export function JerkmateFollowingGifBanner() {
  return (
    <JerkmateNaturalBanner
      href={JERKMATE_MOBILE_GIF_TRACKING_URL}
      imageSrc={pickJerkmateNaturalBannerSrc(2)}
      alt="Jerkmate live cams offer"
      className="my-4 lg:my-5"
    />
  );
}
