"use client";

import { useEffect, useState } from "react";

/** Bottom nav bar (matches layout `pb-16`). */
export const FEED_BOTTOM_NAV_PX = 64;

export function measureFeedSlideHeightPx(): number {
  if (typeof window === "undefined") return 640;
  const viewport =
    window.visualViewport?.height ?? window.innerHeight ?? 640;
  return Math.max(320, Math.round(viewport - FEED_BOTTOM_NAV_PX));
}

export function useFeedViewportHeight(): number {
  const [heightPx, setHeightPx] = useState(() => measureFeedSlideHeightPx());

  useEffect(() => {
    const update = () => setHeightPx(measureFeedSlideHeightPx());
    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  return heightPx;
}
