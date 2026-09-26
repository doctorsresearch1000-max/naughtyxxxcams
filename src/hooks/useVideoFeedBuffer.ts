import { useMemo } from "react";

const DEFAULT_RADIUS = 1;

/**
 * Sliding window: mount players for N and N+1 only (no N-1 retention).
 * Indices outside this range should tear down embed sources (see LiveEmbed).
 */
export function useVideoFeedBuffer(
  activeIndex: number,
  total: number,
  _radius = DEFAULT_RADIUS,
): {
  armedIndices: Set<number>;
  isArmed: (index: number) => boolean;
  prefetchIndices: Set<number>;
} {
  const { armedIndices, prefetchIndices } = useMemo(() => {
    const armed = new Set<number>();
    const prefetch = new Set<number>();
    if (total <= 0) return { armedIndices: armed, prefetchIndices: prefetch };

    const lo = activeIndex;
    const hi = Math.min(total - 1, activeIndex + 1);
    for (let i = lo; i <= hi; i += 1) {
      armed.add(i);
    }

    const next = activeIndex + 1;
    if (next <= total - 1) {
      prefetch.add(next);
    }

    return { armedIndices: armed, prefetchIndices: prefetch };
  }, [activeIndex, total]);

  const isArmed = (index: number) => armedIndices.has(index);

  return { armedIndices, isArmed, prefetchIndices };
}
