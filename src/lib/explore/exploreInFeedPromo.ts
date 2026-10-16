import { IN_FEED_AD_EVERY_N_CARDS } from "@/lib/cams/inFeedAdConfig";
import type { JerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";

export type ExploreInFeedPromo = {
  promo: JerkmatePromoKey;
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

export function buildExploreInFeedPromo(): ExploreInFeedPromo {
  return {
    promo: "jerkmate-explore-in-feed",
    coverUrl: null,
    title: "Jerkmate",
    subtitle: "Free pass — top live models",
    ctaLabel: "CLAIM FREE PASS",
  };
}
