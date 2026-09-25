"use client";

import { useEffect, useState } from "react";

const CARD_SELECTOR = "[data-slide-index]";

/** Minimum visible ratio when refining via IntersectionObserver. */
const ACTIVE_VISIBILITY_THRESHOLD = 0.55;

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

    const ratios = new Map<number, number>();

    const syncFromScrollTop = () => {
      const h = root.clientHeight;
      if (h <= 0) return;
      const approx = clamp(Math.round(root.scrollTop / h));
      setActiveIndex((prev) => (prev === approx ? prev : approx));
    };

    const refineFromIntersection = () => {
      let bestIdx = 0;
      let bestRatio = 0;
      ratios.forEach((ratio, idx) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestIdx = idx;
        }
      });
      if (bestRatio >= ACTIVE_VISIBILITY_THRESHOLD) {
        setActiveIndex((prev) => {
          const next = clamp(bestIdx);
          return prev === next ? prev : next;
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const idx = Number(el.dataset.slideIndex);
          if (Number.isNaN(idx)) continue;
          ratios.set(idx, entry.intersectionRatio);
        }
        refineFromIntersection();
      },
      {
        root,
        threshold: [0, 0.35, 0.55, 0.7, 0.85, 1],
      },
    );

    const slides = root.querySelectorAll<HTMLElement>(CARD_SELECTOR);
    slides.forEach((slide) => observer.observe(slide));

    const onScroll = () => {
      syncFromScrollTop();
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("scrollend", syncFromScrollTop);
    syncFromScrollTop();

    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("scrollend", syncFromScrollTop);
    };
  }, [scrollRef, slideCount]);

  return { activeIndex };
}
