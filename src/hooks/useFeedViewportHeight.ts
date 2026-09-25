"use client";

/** Bottom nav bar (matches layout `pb-16`). */
export const FEED_BOTTOM_NAV_PX = 64;

/** Initial estimate until `.feed-scroll` reports `clientHeight`. */
export function measureFeedSlideHeightPx(): number {
  if (typeof window === "undefined") return 640;
  const viewport =
    window.visualViewport?.height ?? window.innerHeight ?? 640;
  return Math.max(320, Math.round(viewport - FEED_BOTTOM_NAV_PX));
}
