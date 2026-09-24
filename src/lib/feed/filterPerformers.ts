import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { getPerformerKey, pickCoverUrl } from "@/lib/crackrevenue/api";

export type FeedPerformer = CrackPerformer & {
  feedKey: string;
  posterUrl: string;
};

function isHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Home feed: solo Streamate (API ya filtra brand) + póster HTTPS válido. */
export function filterFeedPerformers(
  performers: CrackPerformer[],
): FeedPerformer[] {
  const seen = new Set<string>();

  return performers
    .filter((p) => p.live !== false)
    .map((p) => {
      const posterUrl = pickCoverUrl(p);
      if (!posterUrl || !isHttpsUrl(posterUrl)) return null;
      const feedKey = getPerformerKey(p);
      if (seen.has(feedKey)) return null;
      seen.add(feedKey);
      return { ...p, feedKey, posterUrl };
    })
    .filter((p): p is FeedPerformer => p !== null);
}
