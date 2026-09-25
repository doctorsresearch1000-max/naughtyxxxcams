"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_BATCH = 30;

export function useInfiniteScrollBatch(
  totalItems: number,
  batchSize = DEFAULT_BATCH,
) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(batchSize);
  }, [totalItems, batchSize]);

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(totalItems, n + batchSize));
  }, [totalItems, batchSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= totalItems) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, visibleCount, totalItems]);

  return {
    visibleCount,
    sentinelRef,
    hasMore: visibleCount < totalItems,
    loadMore,
  };
}
