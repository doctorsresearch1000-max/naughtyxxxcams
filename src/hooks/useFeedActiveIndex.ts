"use client";

import { useEffect, useState } from "react";

const CARD_SELECTOR = "[data-slide-index]";
/** Minimum visible ratio to treat a slide as active (TikTok-style snap). */
const ACTIVE_VISIBILITY_THRESHOLD = 0.7;

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

    const pickActiveFromRatios = () => {
      let bestIdx = 0;
      let bestRatio = 0;
      ratios.forEach((ratio, idx) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestIdx = idx;
        }
      });
      if (bestRatio >= ACTIVE_VISIBILITY_THRESHOLD) {
        setActiveIndex(clamp(bestIdx));
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
        pickActiveFromRatios();
      },
      {
        root,
        threshold: [0, 0.25, 0.5, 0.7, 0.85, 1],
      },
    );

    const slides = root.querySelectorAll<HTMLElement>(CARD_SELECTOR);
    slides.forEach((slide) => observer.observe(slide));

    const onScroll = () => {
      const h = root.clientHeight;
      if (h <= 0) return;
      const approx = clamp(Math.round(root.scrollTop / h));
      setActiveIndex((prev) => (prev === approx ? prev : approx));
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("scrollend", onScroll);
    onScroll();

    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("scrollend", onScroll);
    };
  }, [scrollRef, slideCount]);

  return { activeIndex };
}
