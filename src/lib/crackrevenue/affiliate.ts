import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { buildJerkmateAffiliateUrl } from "@/lib/crackrevenue/jerkmateAffiliate";

/**
 * Monetized outbound URL for chat / private room (Jerkmate via Crak affiliate).
 */
export function buildModelAffiliateUrl(performer: CrackPerformer): string {
  return buildJerkmateAffiliateUrl(performer);
}
