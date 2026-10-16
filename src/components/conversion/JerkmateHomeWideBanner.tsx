import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import { pickJerkmateNaturalBannerSrc } from "@/lib/ads/jerkmateLocalBanner";

export function JerkmateHomeWideBanner() {
  return (
    <JerkmateNaturalBanner
      promo="jerkmate-home-wide"
      imageSrc={pickJerkmateNaturalBannerSrc(2)}
      alt="Sponsored live cam offer"
      className="my-4 hidden md:block"
    />
  );
}
