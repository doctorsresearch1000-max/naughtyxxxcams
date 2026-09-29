import { cache } from "react";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { fetchHomeFeedPerformers } from "@/lib/crackrevenue/fetchHomeFeedPerformers";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import {
  HOME_BOOTSTRAP_TARGET,
  HOME_SSR_PERFORMER_CAP,
} from "@/lib/feed/feedLimits";

async function loadBootstrapPerformers(): Promise<FeedPerformer[]> {
  const list = await fetchHomeFeedPerformers({
    maxPages: 1,
    targetCount: HOME_BOOTSTRAP_TARGET,
  });
  return list.slice(0, HOME_SSR_PERFORMER_CAP);
}

const getCachedBootstrapPerformers = unstable_cache(
  loadBootstrapPerformers,
  ["nx-home-bootstrap-performers-v2"],
  { revalidate: 120 },
);

/**
 * Server-only bootstrap list (first API page). Deduped per request via `cache()`.
 * Edge-cached 120s to avoid Worker 1102 on traffic spikes.
 */
export const getBootstrapFeedPerformers = cache(
  async (): Promise<FeedPerformer[]> => {
    try {
      return await getCachedBootstrapPerformers();
    } catch {
      return [];
    }
  },
);

/** True when SSR should hydrate the home catalog (not on /explore, /profile, etc.). */
export async function shouldServerBootstrapHomeFeed(): Promise<boolean> {
  const h = await headers();
  const pathname = h.get("x-nx-pathname") ?? "";
  return pathname === "/";
}
