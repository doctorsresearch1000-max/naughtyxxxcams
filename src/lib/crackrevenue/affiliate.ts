import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { CRAK_LANDING_ID_RAW, resolveWidgetLandingId } from "@/lib/crackrevenue/config";

const DEFAULT_AFF_SUB5 = "SF_0060G0000041mDN";

function replaceTrackingPlaceholders(url: string): string {
  return url
    .replace(/\{aff_sub\}/gi, "")
    .replace(/\{aff_sub2\}/gi, "PUB_naughtyxxxcams")
    .replace(/\{aff_sub3\}/gi, "")
    .replace(/\{aff_sub4\}/gi, "AT_0008")
    .replace(/\{aff_sub5\}/gi, DEFAULT_AFF_SUB5)
    .replace(/\{source\}/gi, "naughtyxxxcams")
    .replace(/\{file_id\}/gi, "")
    .replace(/%7Baff_sub%7D/gi, "")
    .replace(/%7Baff_sub2%7D/gi, encodeURIComponent("PUB_naughtyxxxcams"))
    .replace(/%7Baff_sub3%7D/gi, "")
    .replace(/%7Baff_sub4%7D/gi, "AT_0008")
    .replace(/%7Baff_sub5%7D/gi, encodeURIComponent(DEFAULT_AFF_SUB5))
    .replace(/%7Bsource%7D/gi, "naughtyxxxcams")
    .replace(/%7Bfile_id%7D/gi, "");
}

/**
 * URL de sala Streamate por modelo (roomUrl de performers-ext) con tracking CrakRevenue.
 */
export function buildModelAffiliateUrl(performer: CrackPerformer): string {
  const modelName = (performer.nameClean || performer.name || "").trim();
  const roomUrl = performer.roomUrl?.trim();

  if (roomUrl) {
    try {
      const parsed = new URL(replaceTrackingPlaceholders(roomUrl));
      if (modelName) {
        parsed.searchParams.set("model", modelName);
      }
      return parsed.toString();
    } catch {
      return replaceTrackingPlaceholders(roomUrl);
    }
  }

  const landingId = resolveWidgetLandingId();
  const trackingBase = CRAK_LANDING_ID_RAW.trim();

  if (trackingBase.startsWith("http")) {
    try {
      const parsed = new URL(trackingBase);
      if (modelName) parsed.searchParams.set("model", modelName);
      return parsed.toString();
    } catch {
      /* fallback */
    }
  }

  const params = new URLSearchParams({
    landing_id: landingId,
  });
  if (modelName) params.set("model", modelName);
  params.set("aff_sub5", DEFAULT_AFF_SUB5);

  return `https://go.crakrevenue.com/?${params.toString()}`;
}
