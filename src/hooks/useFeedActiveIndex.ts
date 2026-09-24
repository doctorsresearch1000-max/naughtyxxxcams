"use client";

import { useEffect, useState } from "react";

const CARD_SELECTOR = "[data-slide-index]";

export function useFeedActiveIndex(
  scrollRef: React.RefObject<HTMLElement | null>,
  slideCount: number,
) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || slideCount <= 0) return;

    const clamp = (idx: number) =>
      Math.min(Math.max(idx, 0), Math.max(slideCount - 1, 0));

    const updateFromScrollTop = () => {
      const h = root.clientHeight;
      if (h <= 0) return;
      setActiveIndex(clamp(Math.round(root.scrollTop / h)));
    };

    const updateFromIntersection = () => {
      const slides = root.querySelectorAll<HTMLElement>(CARD_SELECTOR);
      let bestIdx = 0;
      let bestRatio = 0;

      slides.forEach((slide) => {
        const rect = slide.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const visible =
          Math.min(rect.bottom, rootRect.bottom) -
          Math.max(rect.top, rootRect.top);
        const ratio = visible / Math.max(rect.height, 1);
        const idx = Number(slide.dataset.slideIndex);
        if (!Number.isNaN(idx) && ratio > bestRatio) {
          bestRatio = ratio;
          bestIdx = idx;
        }
      });

      if (bestRatio >= 0.5) {
        setActiveIndex(clamp(bestIdx));
      }
    };

    const sync = () => {
      updateFromIntersection();
      updateFromScrollTop();
    };

    sync();

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(sync, 100);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("scrollend", sync);

    const fallbackTimer = window.setInterval(sync, 400);

    return () => {
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("scrollend", sync);
      if (debounceTimer) clearTimeout(debounceTimer);
      window.clearInterval(fallbackTimer);
    };
  }, [scrollRef, slideCount]);

  return { activeIndex };
}
