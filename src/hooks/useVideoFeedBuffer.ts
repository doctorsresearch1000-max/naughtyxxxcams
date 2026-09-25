import { useMemo } from "react";

const DEFAULT_RADIUS = 1;

/**
 * Sliding window: mount players for N-1, N, N+1 only.
 * Indices outside this range should tear down embed sources (see LiveEmbed).
 */
export function useVideoFeedBuffer(
  activeIndex: number,
  total: number,
  radius = DEFAULT_RADIUS,
): {
  armedIndices: Set<number>;
  isArmed: (index: number) => boolean;
  prefetchIndices: Set<number>;
} {
  const { armedIndices, prefetchIndices } = useMemo(() => {
    const armed = new Set<number>();
    const prefetch = new Set<number>();
    if (total <= 0) return { armedIndices: armed, prefetchIndices: prefetch };

    const lo = Math.max(0, activeIndex - radius);
    const hi = Math.min(total - 1, activeIndex + radius);
    for (let i = lo; i <= hi; i += 1) {
      armed.add(i);
    }

    const next = activeIndex + 1;
    if (next <= total - 1) {
      prefetch.add(next);
    }

    return { armedIndices: armed, prefetchIndices: prefetch };
  }, [activeIndex, total, radius]);

  const isArmed = (index: number) => armedIndices.has(index);

  return { armedIndices, isArmed, prefetchIndices };
}
