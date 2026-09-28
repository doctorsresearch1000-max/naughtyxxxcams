import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { buildJerkmateAffiliateUrlByName } from "@/lib/crackrevenue/jerkmateAffiliate";

export type ExploreInFeedPromo = {
  affiliateUrl: string;
  coverUrl: string | null;
  title: string;
  subtitle: string;
};

/** Insert at 5th slot when possible, else 3rd (0-based indices 4 / 2). */
export function resolveInFeedPromoIndex(visibleCount: number): number | null {
  if (visibleCount >= 5) return 4;
  if (visibleCount >= 3) return 2;
  if (visibleCount >= 1) return Math.min(1, visibleCount - 1);
  return null;
}

export function buildExploreInFeedPromo(
  coverModel?: CrackPerformer | null,
): ExploreInFeedPromo {
  const coverUrl =
    coverModel?.liveSnapshotURL?.trim() ||
    coverModel?.thumbnailUrl?.trim() ||
    null;

  return {
    affiliateUrl: buildJerkmateAffiliateUrlByName("Jerkmate"),
    coverUrl,
    title: "Jerkmate",
    subtitle: "Watch free with top models",
  };
}
