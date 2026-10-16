import "server-only";

import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";
import { findPerformerByProfileSlug } from "@/lib/crackrevenue/performerLookup";
import { performerProfileSlug } from "@/lib/profile/performerHandle";
import {
  JERKMATE_EXPLORE_GIF_TRACKING_URL,
  JERKMATE_FOLLOWING_GIF_TRACKING_URL,
  JERKMATE_MOBILE_GIF_TRACKING_URL,
  JERKMATE_TRACKING_URL,
} from "@/lib/crackrevenue/jerkmateTracking";
import type { JerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";
import { isJerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";

function resolveJerkmatePromoUrl(promo: JerkmatePromoKey): string {
  if (promo === "jerkmate-global") return JERKMATE_TRACKING_URL;
  if (promo === "jerkmate-home-wide") return JERKMATE_MOBILE_GIF_TRACKING_URL;
  if (promo === "jerkmate-home-mobile-gif") {
    return JERKMATE_MOBILE_GIF_TRACKING_URL;
  }
  if (promo === "jerkmate-following-gif") {
    return JERKMATE_FOLLOWING_GIF_TRACKING_URL;
  }
  if (promo === "jerkmate-explore-in-feed") return JERKMATE_TRACKING_URL;
  if (promo === "jerkmate-explore-gif") return JERKMATE_EXPLORE_GIF_TRACKING_URL;
  if (promo.startsWith("jerkmate-grid-")) return JERKMATE_TRACKING_URL;
  return JERKMATE_TRACKING_URL;
}

export type GoAffiliateTarget =
  | { kind: "profile"; slug: string }
  | { kind: "promo"; promo: JerkmatePromoKey };

export async function resolveGoAffiliateUrl(
  target: GoAffiliateTarget,
): Promise<string | null> {
  if (target.kind === "promo") {
    if (!isJerkmatePromoKey(target.promo)) return null;
    return resolveJerkmatePromoUrl(target.promo);
  }

  const slug = performerProfileSlug(target.slug);
  if (!slug) return null;

  try {
    const performer = await findPerformerByProfileSlug(slug);
    if (performer) {
      return buildModelAffiliateUrl(performer);
    }
  } catch {
    /* upstream miss */
  }

  const stub: CrackPerformer = {
    name: slug,
    nameClean: slug,
    itemId: slug,
    live: false,
  };
  return buildModelAffiliateUrl(stub);
}

export function profilePathForGoTarget(target: GoAffiliateTarget): string {
  if (target.kind === "profile") {
    const slug = performerProfileSlug(target.slug);
    return slug ? `/profile/${slug}` : "/";
  }
  return "/explore";
}
