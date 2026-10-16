import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import { pickJerkmateNaturalBannerSrc } from "@/lib/ads/jerkmateLocalBanner";

type ProfileSponsorAdCardProps = {
  className?: string;
};

export function ProfileSponsorAdCard({ className = "" }: ProfileSponsorAdCardProps) {
  return (
    <JerkmateNaturalBanner
      promo="jerkmate-explore-gif"
      imageSrc={pickJerkmateNaturalBannerSrc(1)}
      alt="Sponsored live cam offer"
      className={className}
    />
  );
}
