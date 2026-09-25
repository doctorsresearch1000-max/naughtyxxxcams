import { cache } from "react";
import { fetchHomeFeedPerformers } from "@/lib/crackrevenue/fetchHomeFeedPerformers";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";

/**
 * Server-only bootstrap list (first API page). Deduped per request via `cache()`.
 * Called from `page.tsx` and the layout feed bridge.
 */
export const getBootstrapFeedPerformers = cache(
  async (): Promise<FeedPerformer[]> => {
    try {
      return await fetchHomeFeedPerformers({ maxPages: 1 });
    } catch {
      return [];
    }
  },
);
