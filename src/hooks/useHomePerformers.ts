"use client";

import { useEffect, useState } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import {
  fetchFeedFullPerformers,
  readFeedPerformersCache,
  seedFeedPerformersCache,
} from "@/lib/feed/feedClientCache";

export function useHomePerformers(initialPerformers: FeedPerformer[]) {
  const [performers, setPerformers] = useState<FeedPerformer[]>(
    () => initialPerformers,
  );
  const [ready, setReady] = useState(() => initialPerformers.length > 0);

  useEffect(() => {
    seedFeedPerformersCache(initialPerformers);
    const cached = readFeedPerformersCache();
    if (cached?.performers.length) {
      setPerformers(cached.performers);
      setReady(true);
    }

    let cancelled = false;
    (async () => {
      try {
        const payload = await fetchFeedFullPerformers();
        if (cancelled) return;
        setPerformers(payload.performers);
        setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialPerformers]);

  return { performers, ready };
}
