"use client";

import { useEffect, useState } from "react";

/** Bottom nav bar (matches layout `pb-16`). */
export const FEED_BOTTOM_NAV_PX = 64;

function readHeaderHeightPx(): number {
  if (typeof document === "undefined") return 60;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--app-header-height",
  );
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

/** Visible feed slide height (between header overlay and bottom nav). */
export function measureFeedSlideHeightPx(): number {
  if (typeof window === "undefined") return 640;

  const shell = document.querySelector<HTMLElement>(".feed-shell");
  if (shell) {
    const h = shell.getBoundingClientRect().height;
    if (h >= 320) return Math.round(h);
  }

  const viewport =
    window.visualViewport?.height ?? window.innerHeight ?? 640;
  const headerPx = readHeaderHeightPx();
  return Math.max(320, Math.round(viewport - FEED_BOTTOM_NAV_PX - headerPx));
}

export function useFeedViewportHeight(): number {
  const [heightPx, setHeightPx] = useState(() => measureFeedSlideHeightPx());

  useEffect(() => {
    const update = () => setHeightPx(measureFeedSlideHeightPx());
    update();

    const shell = document.querySelector(".feed-shell");
    let ro: ResizeObserver | null = null;
    if (shell) {
      ro = new ResizeObserver(() => update());
      ro.observe(shell);
    }

    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  return heightPx;
}
