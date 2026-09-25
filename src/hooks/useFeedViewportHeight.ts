"use client";

/** Bottom nav bar (matches layout `pb-16`); overlays the feed, not subtracted from slide height. */
export const FEED_BOTTOM_NAV_PX = 64;

/** Full visual viewport — slides are edge-to-edge; chrome floats on top. */
export function measureFeedSlideHeightPx(): number {
  if (typeof window === "undefined") return 640;
  const viewport =
    window.visualViewport?.height ?? window.innerHeight ?? 640;
  return Math.max(320, Math.round(viewport));
}
