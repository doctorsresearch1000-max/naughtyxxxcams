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

const DEFAULT_TARGET = 36;
const MAX_PAGES = 12;
const PAGE_SIZE = 100;

/**
 * Paginates performers-ext until the home feed has enough models with a native
 * `iframeFeedURL` (hybrid purecam player), excluding promo/redirect embeds.
 */
export async function fetchHomeFeedPerformers(
  targetCount = DEFAULT_TARGET,
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

    if (filterFeedPerformers(pool).length >= targetCount) break;
    if (batch.length < PAGE_SIZE) break;
  }

  return filterFeedPerformers(pool).slice(0, targetCount);
}
