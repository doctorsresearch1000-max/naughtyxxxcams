import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import {
  JERKMATE_EXPLORE_GIF_BANNER_URL,
  JERKMATE_EXPLORE_GIF_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";

type ProfileSponsorAdCardProps = {
  className?: string;
};

export function ProfileSponsorAdCard({ className = "" }: ProfileSponsorAdCardProps) {
  return (
    <JerkmateNaturalBanner
      href={JERKMATE_EXPLORE_GIF_TRACKING_URL}
      imageSrc={JERKMATE_EXPLORE_GIF_BANNER_URL}
      alt="Sponsored live cam offer"
      className={className}
    />
  );
}
