import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import { pickJerkmateNaturalBannerSrc } from "@/lib/ads/jerkmateLocalBanner";
import { JERKMATE_EXPLORE_GIF_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";

type ProfileSponsorAdCardProps = {
  className?: string;
};

export function ProfileSponsorAdCard({ className = "" }: ProfileSponsorAdCardProps) {
  return (
    <JerkmateNaturalBanner
      href={JERKMATE_EXPLORE_GIF_TRACKING_URL}
      imageSrc={pickJerkmateNaturalBannerSrc(1)}
      alt="Sponsored live cam offer"
      className={className}
    />
  );
}
