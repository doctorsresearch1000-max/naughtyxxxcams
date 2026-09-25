import {
  fetchStreamatePerformers,
  getPerformerKey,
  type CrackPerformer,
} from "@/lib/crackrevenue/api";
import {
  filterFeedPerformers,
  type FeedPerformer,
} from "@/lib/feed/filterPerformers";
import { performerHasNativeEmbedFeed } from "@/lib/feed/nativeIframeFeed";

const MAX_PAGES = 20;
const PAGE_SIZE = 100;

/**
 * Paginates performers-ext until all live models with a native `iframeFeedURL`
 * are collected (hybrid purecam player), excluding promo/redirect embeds.
 */
export async function fetchHomeFeedPerformers(
  targetCount?: number,
): Promise<FeedPerformer[]> {
  const seen = new Set<string>();
  const pool: CrackPerformer[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fetchStreamatePerformers({
      live: true,
      size: PAGE_SIZE,
      page,
    });
    const batch = data.performers ?? [];
    if (batch.length === 0) break;

    for (const performer of batch) {
      if (!performerHasNativeEmbedFeed(performer)) continue;
      const key = getPerformerKey(performer);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push(performer);
    }

    if (batch.length < PAGE_SIZE) break;
  }

  const all = filterFeedPerformers(pool);
  if (typeof targetCount === "number" && targetCount > 0) {
    return all.slice(0, targetCount);
  }
  return all;
}
