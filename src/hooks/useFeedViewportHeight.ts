"use client";

import { useEffect, useState } from "react";

/** Bottom nav bar (matches layout `pb-16`). */
export const FEED_BOTTOM_NAV_PX = 64;

function fallbackSlideHeightPx(): number {
  if (typeof window === "undefined") return 640;
  const viewport =
    window.visualViewport?.height ?? window.innerHeight ?? 640;
  return Math.max(320, Math.round(viewport - FEED_BOTTOM_NAV_PX));
}

/** Prefer the live feed scrollport — matches what the user actually sees. */
export function measureFeedSlideHeightPx(): number {
  if (typeof document === "undefined") return 640;

  const scroll = document.querySelector<HTMLElement>(".feed-scroll");
  if (scroll) {
    const h = scroll.getBoundingClientRect().height;
    if (h >= 200) return Math.round(h);
  }

  const shell = document.querySelector<HTMLElement>(".feed-shell");
  if (shell) {
    const h = shell.getBoundingClientRect().height;
    if (h >= 200) return Math.round(h);
  }

  return fallbackSlideHeightPx();
}

export function useFeedViewportHeight(): number {
  const [heightPx, setHeightPx] = useState(() => fallbackSlideHeightPx());

  useEffect(() => {
    const update = () => {
      setHeightPx(measureFeedSlideHeightPx());
    };

    update();

    const observed =
      document.querySelector<HTMLElement>(".feed-scroll") ??
      document.querySelector<HTMLElement>(".feed-shell");

    let ro: ResizeObserver | null = null;
    if (observed) {
      ro = new ResizeObserver(update);
      ro.observe(observed);
    }

    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);

    const t = window.setTimeout(update, 0);
    const t2 = window.setTimeout(update, 120);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  return heightPx;
}
