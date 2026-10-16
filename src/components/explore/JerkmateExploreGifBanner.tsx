import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import { pickJerkmateNaturalBannerSrc } from "@/lib/ads/jerkmateLocalBanner";

/** Natural-width sponsor strip — `/explore`, below live story avatars. */
export function JerkmateExploreGifBanner() {
  return (
    <JerkmateNaturalBanner
      promo="jerkmate-explore-gif"
      imageSrc={pickJerkmateNaturalBannerSrc(5)}
      alt="Sponsored live cam offer"
      className="my-3 lg:my-2"
    />
  );
}
