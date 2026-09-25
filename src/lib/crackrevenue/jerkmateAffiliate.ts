import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  CRAK_LANDING_ID_RAW,
  resolveWidgetLandingId,
} from "@/lib/crackrevenue/config";

const DEFAULT_AFF_SUB5 = "SF_0060G0000041mDN";
const AFF_SUB2 = "PUB_naughtyxxxcams";
const AFF_SUB4 = "AT_0008";
const SOURCE = "naughtyxxxcams";

function replaceTrackingPlaceholders(url: string): string {
  return url
    .replace(/\{aff_sub\}/gi, "")
    .replace(/\{aff_sub2\}/gi, AFF_SUB2)
    .replace(/\{aff_sub3\}/gi, "")
    .replace(/\{aff_sub4\}/gi, AFF_SUB4)
    .replace(/\{aff_sub5\}/gi, DEFAULT_AFF_SUB5)
    .replace(/\{source\}/gi, SOURCE)
    .replace(/\{file_id\}/gi, "")
    .replace(/%7Baff_sub%7D/gi, "")
    .replace(/%7Baff_sub2%7D/gi, encodeURIComponent(AFF_SUB2))
    .replace(/%7Baff_sub3%7D/gi, "")
    .replace(/%7Baff_sub4%7D/gi, AFF_SUB4)
    .replace(/%7Baff_sub5%7D/gi, encodeURIComponent(DEFAULT_AFF_SUB5))
    .replace(/%7Bsource%7D/gi, SOURCE)
    .replace(/%7Bfile_id%7D/gi, "");
}

function applyCrakAffiliateParams(url: URL, modelName: string): void {
  url.searchParams.set("aff_sub2", AFF_SUB2);
  url.searchParams.set("aff_sub4", AFF_SUB4);
  url.searchParams.set("aff_sub5", DEFAULT_AFF_SUB5);
  url.searchParams.set("source", SOURCE);
  if (modelName) {
    url.searchParams.set("model", modelName);
    url.searchParams.set("performer", modelName);
  }
}

function modelNameFromPerformer(performer: CrackPerformer): string {
  return (performer.nameClean || performer.name || "").trim();
}

/**
 * Outbound chat / private-room URL: Jerkmate room via CrakRevenue affiliate tracking.
 */
export function buildJerkmateAffiliateUrl(performer: CrackPerformer): string {
  const modelName = modelNameFromPerformer(performer);
  const roomUrl = performer.roomUrl?.trim();

  if (roomUrl) {
    try {
      const parsed = new URL(replaceTrackingPlaceholders(roomUrl));
      applyCrakAffiliateParams(parsed, modelName);
      return parsed.toString();
    } catch {
      return replaceTrackingPlaceholders(roomUrl);
    }
  }

  const landingRaw = CRAK_LANDING_ID_RAW.trim();
  if (landingRaw.startsWith("http")) {
    try {
      const parsed = new URL(replaceTrackingPlaceholders(landingRaw));
      applyCrakAffiliateParams(parsed, modelName);
      return parsed.toString();
    } catch {
      /* fallback below */
    }
  }

  const landingId = resolveWidgetLandingId();
  const params = new URLSearchParams({
    landing_id: landingId,
    aff_sub2: AFF_SUB2,
    aff_sub4: AFF_SUB4,
    aff_sub5: DEFAULT_AFF_SUB5,
    source: SOURCE,
  });
  if (modelName) {
    params.set("model", modelName);
    params.set("performer", modelName);
  }

  return `https://go.crakrevenue.com/?${params.toString()}`;
}

/** Chat CTA when only the model display name is known. */
export function buildJerkmateAffiliateUrlByName(modelName: string): string {
  const stub: CrackPerformer = {
    name: modelName,
    nameClean: modelName.replace(/^@+/, "").replace(/\s+/g, ""),
  };
  return buildJerkmateAffiliateUrl(stub);
}

/** Opens monetized room URL in a new tab — no modals or preventDefault blockers. */
export function openAffiliateOutbound(url: string): void {
  const target = url?.trim();
  if (!target) return;
  const opened = window.open(target, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(target);
  }
}
