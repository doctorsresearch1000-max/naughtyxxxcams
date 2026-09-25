import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";
import { buildStableFeedEmbedSrc } from "@/lib/feed/iframeSrc";

export type PerformerEmbedMode = "api-iframe" | "widget" | "poster-only";

export type PerformerEmbedPlan = {
  mode: PerformerEmbedMode;
  /** Outer iframe `src` (our srcdoc proxy). Never changes for mute/volume. */
  outerEmbedSrc: string | null;
  roomAffiliateUrl: string;
  canMountInteractivePlayer: boolean;
  /** Normalized performers-ext feed URL (when mode === api-iframe). */
  apiIframeFeedUrl: string | null;
};

const ALLOWED_FEED_HOST_SUFFIXES = [
  "streamate.com",
  "streamate.net",
  "streamateaccess.com",
  "pcvdaa.com",
  "crxcr2.com",
  "crakrevenue.com",
];

export function isAllowedIframeFeedHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return ALLOWED_FEED_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}

/**
 * Performers-ext feed URL with API-recommended defaults (muted / widescreen).
 * @see performers-ext `iframeFeedURL` + `volumelevel` / `widescreen`
 */
export function normalizeApiIframeFeedUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.searchParams.set("volumelevel", "0");
  url.searchParams.set("widescreen", "true");
  url.searchParams.set("muted", "1");
  url.searchParams.set("volume", "0");
  return url.toString();
}

export function buildProxiedApiFeedEmbedSrc(
  instanceId: string,
  apiIframeFeedUrl: string,
  roomAffiliateUrl: string,
): string {
  const params = new URLSearchParams({
    instance: instanceId,
    u: apiIframeFeedUrl,
    room: roomAffiliateUrl,
    muted: "1",
  });
  return `/api/embed/feed?${params.toString()}`;
}

export function resolvePerformerEmbedPlan(
  performer: CrackPerformer,
  feedKey: string,
): PerformerEmbedPlan {
  const roomAffiliateUrl = buildModelAffiliateUrl(performer);
  const isLive = performer.live !== false;
  const rawFeed = performer.iframeFeedURL?.trim() ?? "";

  if (!isLive) {
    return {
      mode: "poster-only",
      outerEmbedSrc: null,
      roomAffiliateUrl,
      canMountInteractivePlayer: false,
      apiIframeFeedUrl: null,
    };
  }

  if (rawFeed && isAllowedIframeFeedHost(rawFeed)) {
    const apiIframeFeedUrl = normalizeApiIframeFeedUrl(rawFeed);
    return {
      mode: "api-iframe",
      outerEmbedSrc: buildProxiedApiFeedEmbedSrc(
        feedKey,
        apiIframeFeedUrl,
        roomAffiliateUrl,
      ),
      roomAffiliateUrl,
      canMountInteractivePlayer: true,
      apiIframeFeedUrl,
    };
  }

  const nameClean = performer.nameClean || performer.name;
  if (!nameClean?.trim()) {
    return {
      mode: "poster-only",
      outerEmbedSrc: null,
      roomAffiliateUrl,
      canMountInteractivePlayer: false,
      apiIframeFeedUrl: null,
    };
  }

  return {
    mode: "widget",
    outerEmbedSrc: buildStableFeedEmbedSrc(feedKey, {
      performerNameClean: nameClean,
      useFeed: 0,
      roomAffiliateUrl,
    }),
    roomAffiliateUrl,
    canMountInteractivePlayer: true,
    apiIframeFeedUrl: null,
  };
}
