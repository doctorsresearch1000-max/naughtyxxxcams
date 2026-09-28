import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { getPerformerKey } from "@/lib/crackrevenue/api";
import {
  filterFeedPerformers,
  pickFeedPosterUrl,
  type FeedPerformer,
} from "@/lib/feed/filterPerformers";

/**
 * Home mobile grid: keep embed-capable live models with unique feed keys.
 * Skips aggressive poster dedupe so the grid shows more visual diversity.
 */
export function filterHomeMobilePerformers(
  performers: CrackPerformer[],
): FeedPerformer[] {
  const strict = filterFeedPerformers(performers);
  if (strict.length >= 24) return strict;

  const seenKeys = new Set<string>();
  const out: FeedPerformer[] = [...strict];
  for (const p of out) seenKeys.add(p.feedKey);

  for (const p of performers) {
    if (p.live === false) continue;
    const feedKey = getPerformerKey(p);
    if (seenKeys.has(feedKey)) continue;
    const posterUrl = pickFeedPosterUrl(p);
    if (!posterUrl) continue;
    const fromStrict = filterFeedPerformers([p]);
    if (fromStrict[0]) {
      out.push(fromStrict[0]);
      seenKeys.add(feedKey);
    }
  }

  return out;
}
