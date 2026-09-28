"use client";

import { useEffect, useState } from "react";

const CARD_SELECTOR = "[data-slide-index]";

/** Pick the slide with the largest visible intersection ratio (passive IO only). */
const ACTIVE_VISIBILITY_THRESHOLD = 0.6;

const IO_THRESHOLDS = [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1] as const;

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

    const syncActiveFromRatios = () => {
      let bestIdx = 0;
      let bestRatio = 0;
      ratios.forEach((ratio, idx) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestIdx = idx;
        }
      });
      if (bestRatio < ACTIVE_VISIBILITY_THRESHOLD) return;
      setActiveIndex((prev) => {
        const next = clamp(bestIdx);
        return prev === next ? prev : next;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const idx = Number(el.dataset.slideIndex);
          if (Number.isNaN(idx)) continue;
          ratios.set(idx, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        syncActiveFromRatios();
      },
      {
        root,
        threshold: [...IO_THRESHOLDS],
      },
    );

    const slides = root.querySelectorAll<HTMLElement>(CARD_SELECTOR);
    slides.forEach((slide) => observer.observe(slide));

    return () => {
      observer.disconnect();
      ratios.clear();
    };
  }, [scrollRef, slideCount]);

  return { activeIndex };
}
