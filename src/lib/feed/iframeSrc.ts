import { buildCamsEmbedUrl } from "@/lib/feed/embedFrame";

/**
 * Stable feed embed URL — always boots muted. Volume changes must never alter src.
 */
export function buildStableFeedEmbedSrc(
  embedInstanceId: string,
  options?: {
    performerNameClean?: string;
    cols?: number;
    rows?: number;
    number?: number;
    ratio?: number;
    useFeed?: number;
    roomAffiliateUrl?: string;
  },
): string {
  return buildCamsEmbedUrl(embedInstanceId, {
    cols: options?.cols ?? 1,
    rows: options?.rows ?? 1,
    number: options?.number ?? 1,
    ratio: options?.ratio ?? 0.5625,
    useFeed: options?.useFeed ?? 0,
    performerNameClean: options?.performerNameClean,
    roomAffiliateUrl: options?.roomAffiliateUrl,
    muted: 1,
  });
}
