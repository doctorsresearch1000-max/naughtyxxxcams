import { useMemo } from "react";
import {
  FEED_BUFFER_AHEAD,
  FEED_BUFFER_BEHIND,
} from "@/lib/feed/feedBufferConstants";

/**
 * Sliding window: mount players for [active - BEHIND … active + AHEAD].
 * Default keeps at most 3 embeds armed (mobile RAM).
 */
export function useVideoFeedBuffer(
  activeIndex: number,
  total: number,
): {
  armedIndices: Set<number>;
  isArmed: (index: number) => boolean;
  prefetchIndices: Set<number>;
} {
  const { armedIndices, prefetchIndices } = useMemo(() => {
    const armed = new Set<number>();
    const prefetch = new Set<number>();
    if (total <= 0) return { armedIndices: armed, prefetchIndices: prefetch };

    const lo = Math.max(0, activeIndex - FEED_BUFFER_BEHIND);
    const hi = Math.min(total - 1, activeIndex + FEED_BUFFER_AHEAD);
    for (let i = lo; i <= hi; i += 1) {
      armed.add(i);
    }

    for (let i = 1; i <= FEED_BUFFER_AHEAD; i += 1) {
      const next = activeIndex + i;
      if (next <= total - 1) prefetch.add(next);
    }

    return { armedIndices: armed, prefetchIndices: prefetch };
  }, [activeIndex, total]);

  const isArmed = (index: number) => armedIndices.has(index);

  return { armedIndices, isArmed, prefetchIndices };
}
