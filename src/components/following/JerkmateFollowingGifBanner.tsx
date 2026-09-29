import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import {
  JERKMATE_MOBILE_GIF_BANNER_URL,
  JERKMATE_MOBILE_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";

/** Home-origin 300×100 GIF — natural width on `/following`. */
export function JerkmateFollowingGifBanner() {
  return (
    <JerkmateNaturalBanner
      href={JERKMATE_MOBILE_GIF_TRACKING_URL}
      imageSrc={JERKMATE_MOBILE_GIF_BANNER_URL}
      alt="Jerkmate live cams offer"
      className="my-4 lg:my-5"
    />
  );
}
