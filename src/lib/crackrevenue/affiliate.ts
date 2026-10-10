import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ensureAffiliateSubid } from "@/lib/crackrevenue/crak-subid";
import { buildJerkmateAffiliateUrl } from "@/lib/crackrevenue/jerkmateAffiliate";

export {
  CRAK_SUBID_PARAM,
  CRAK_SUBID_VALUE,
  ensureAffiliateSubid,
  isCrakRevenueAffiliateUrl,
  withCrakSubid,
} from "@/lib/crackrevenue/crak-subid";

/**
 * Monetized outbound URL for chat / private room (Jerkmate via Crak affiliate).
 */
export function buildModelAffiliateUrl(performer: CrackPerformer): string {
  return ensureAffiliateSubid(buildJerkmateAffiliateUrl(performer));
}
