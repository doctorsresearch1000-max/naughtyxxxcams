import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";
import {
  isNativeEmbeddableIframeFeedUrl,
  pickNativeIframeFeedUrl,
} from "@/lib/feed/nativeIframeFeed";
import { buildWidgetFrameSrc } from "@/lib/feed/widgetSrcDoc";

export type PerformerEmbedMode = "api-iframe" | "widget" | "poster-only";

export type PerformerEmbedPlan = {
  mode: PerformerEmbedMode;
  /** Direct cross-origin player URL (boot muted). User gesture reloads playerSrcUnmuted. */
  outerEmbedSrc: string | null;
  playerSrcMuted: string | null;
  playerSrcUnmuted: string | null;
  roomAffiliateUrl: string;
  canMountInteractivePlayer: boolean;
  /** @deprecated use playerSrcMuted */
  apiIframeFeedUrl: string | null;
};

/** @deprecated use isNativeEmbeddableIframeFeedUrl */
export function isAllowedIframeFeedHost(url: string): boolean {
  return isNativeEmbeddableIframeFeedUrl(url);
}

export function withFeedAudioParams(rawUrl: string, wantSound: boolean): string {
  const url = new URL(rawUrl);
  url.searchParams.set("widescreen", "true");
  url.searchParams.set("volumelevel", wantSound ? "1" : "0");
  url.searchParams.set("muted", wantSound ? "0" : "1");
  url.searchParams.set("volume", wantSound ? "1" : "0");
  return url.toString();
}

/** Performers-ext `iframeFeedURL` — muted autoplay entry point. */
export function normalizeApiIframeFeedUrl(rawUrl: string): string {
  return withFeedAudioParams(rawUrl, false);
}

function buildWidgetPair(feedKey: string, performerNameClean: string) {
  const base = {
    embedInstanceId: feedKey,
    performerNameClean,
    useFeed: 0,
    cols: 1,
    rows: 1,
    number: 1,
    ratio: 0.5625,
  };
  return {
    muted: buildWidgetFrameSrc({ ...base, muted: 1 }),
    unmuted: buildWidgetFrameSrc({ ...base, muted: 0 }),
  };
}

export function resolvePerformerEmbedPlan(
  performer: CrackPerformer,
  feedKey: string,
): PerformerEmbedPlan {
  const roomAffiliateUrl = buildModelAffiliateUrl(performer);
  const isLive = performer.live !== false;
  const rawFeed = pickNativeIframeFeedUrl(performer) ?? "";

  if (!isLive) {
    return {
      mode: "poster-only",
      outerEmbedSrc: null,
      playerSrcMuted: null,
      playerSrcUnmuted: null,
      roomAffiliateUrl,
      canMountInteractivePlayer: false,
      apiIframeFeedUrl: null,
    };
  }

  if (rawFeed && isNativeEmbeddableIframeFeedUrl(rawFeed)) {
    const playerSrcMuted = normalizeApiIframeFeedUrl(rawFeed);
    const playerSrcUnmuted = withFeedAudioParams(rawFeed, true);
    return {
      mode: "api-iframe",
      outerEmbedSrc: playerSrcMuted,
      playerSrcMuted,
      playerSrcUnmuted,
      roomAffiliateUrl,
      canMountInteractivePlayer: true,
      apiIframeFeedUrl: playerSrcMuted,
    };
  }

  const nameClean = performer.nameClean || performer.name;
  if (!nameClean?.trim()) {
    return {
      mode: "poster-only",
      outerEmbedSrc: null,
      playerSrcMuted: null,
      playerSrcUnmuted: null,
      roomAffiliateUrl,
      canMountInteractivePlayer: false,
      apiIframeFeedUrl: null,
    };
  }

  const widget = buildWidgetPair(feedKey, nameClean.trim());
  return {
    mode: "widget",
    outerEmbedSrc: widget.muted,
    playerSrcMuted: widget.muted,
    playerSrcUnmuted: widget.unmuted,
    roomAffiliateUrl,
    canMountInteractivePlayer: true,
    apiIframeFeedUrl: null,
  };
}
