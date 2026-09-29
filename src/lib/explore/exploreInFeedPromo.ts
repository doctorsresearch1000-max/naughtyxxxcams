import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { JERKMATE_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";
import { IN_FEED_AD_EVERY_N_CARDS } from "@/lib/cams/inFeedAdConfig";

export type ExploreInFeedPromo = {
  affiliateUrl: string;
  coverUrl: string | null;
  title: string;
  subtitle: string;
  ctaLabel: string;
};

/** Insert native ad after every N cards (0-based index). */
export function resolveInFeedPromoIndex(visibleCount: number): number | null {
  if (visibleCount < 3) return null;
  const slot = IN_FEED_AD_EVERY_N_CARDS - 1;
  if (visibleCount > slot) return slot;
  return Math.min(2, visibleCount - 1);
}

export function buildExploreInFeedPromo(
  coverModel?: CrackPerformer | null,
): ExploreInFeedPromo {
  const coverUrl =
    coverModel?.liveSnapshotURL?.trim() ||
    coverModel?.thumbnailUrl?.trim() ||
    null;

  return {
    affiliateUrl: JERKMATE_TRACKING_URL,
    coverUrl,
    title: "Jerkmate",
    subtitle: "Free pass — top live models",
    ctaLabel: "CLAIM FREE PASS",
  };
}
