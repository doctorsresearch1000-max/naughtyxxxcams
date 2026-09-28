import {
  fetchStreamatePerformers,
  getPerformerKey,
  type CrackPerformer,
} from "@/lib/crackrevenue/api";
import {
  filterFeedPerformers,
  type FeedPerformer,
} from "@/lib/feed/filterPerformers";
import { resolvePerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import {
  HOME_FEED_MAX_PAGES_CEILING,
  HOME_FEED_MAX_PAGES_DEFAULT,
  HOME_FEED_PAGE_SIZE,
} from "@/lib/feed/feedLimits";

const PAGE_SIZE = HOME_FEED_PAGE_SIZE;

/**
 * Paginates performers-ext until all live models with a native `iframeFeedURL`
 * are collected (hybrid purecam player), excluding promo/redirect embeds.
 */
export type FetchHomeFeedOptions = {
  /** Stop after this many API pages (1 = fast bootstrap for mobile LCP). */
  maxPages?: number;
  targetCount?: number;
};

export async function fetchHomeFeedPerformers(
  options?: number | FetchHomeFeedOptions,
): Promise<FeedPerformer[]> {
  const opts: FetchHomeFeedOptions =
    typeof options === "number" ? { targetCount: options } : (options ?? {});
  const maxPages = Math.min(
    Math.max(opts.maxPages ?? HOME_FEED_MAX_PAGES_DEFAULT, 1),
    HOME_FEED_MAX_PAGES_CEILING,
  );
  const targetCount = opts.targetCount;

  const seen = new Set<string>();
  const pool: CrackPerformer[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const data = await fetchStreamatePerformers({
      live: true,
      size: PAGE_SIZE,
      page,
    });
    const batch = data.performers ?? [];
    if (batch.length === 0) break;

    for (const performer of batch) {
      if (performer.live === false) continue;
      const key = getPerformerKey(performer);
      const plan = resolvePerformerEmbedPlan(performer, key);
      if (!plan.canMountInteractivePlayer) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push(performer);
    }

    if (
      typeof targetCount === "number" &&
      targetCount > 0 &&
      filterFeedPerformers(pool).length >= targetCount
    ) {
      break;
    }

    if (batch.length < PAGE_SIZE) break;
  }

  const all = filterFeedPerformers(pool);
  if (typeof targetCount === "number" && targetCount > 0) {
    return all.slice(0, targetCount);
  }
  return all;
}

