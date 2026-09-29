"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `lg` (1024px). First paint is false to match mobile-first SSR. */
export function useMediaMinWidth(minWidthPx: number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidthPx}px)`);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [minWidthPx]);

  return matches;
}
