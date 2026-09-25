import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { getPerformerKey } from "@/lib/crackrevenue/api";
import { imageUrlBaseKey } from "@/lib/media/imageDedupe";
import {
  resolvePerformerEmbedPlan,
  type PerformerEmbedPlan,
} from "@/lib/feed/performerEmbed";

export type FeedPerformer = CrackPerformer & {
  feedKey: string;
  posterUrl: string;
  embedPlan: PerformerEmbedPlan;
};

function isHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function posterBaseKey(url: string): string {
  return imageUrlBaseKey(url);
}

/**
 * Póster estático por modelo: prioriza thumbnail (único por performer).
 * liveSnapshotURL suele rotar o repetirse en CDN — solo como respaldo.
 */
export function pickFeedPosterUrl(performer: CrackPerformer): string | null {
  const id =
    performer.itemId ||
    performer.nameClean ||
    performer.name ||
    "model";

  const thumb = performer.thumbnailUrl?.trim();
  const snap = performer.liveSnapshotURL?.trim();

  let base: string | null = null;
  if (thumb && isHttpsUrl(thumb)) base = thumb;
  else if (snap && isHttpsUrl(snap)) base = snap;

  if (!base) return null;

  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}nx_feed=${encodeURIComponent(id)}`;
}

/** Home feed: Streamate + póster HTTPS único por tarjeta. */
export function filterFeedPerformers(
  performers: CrackPerformer[],
): FeedPerformer[] {
  const seenKeys = new Set<string>();
  const seenPosterBases = new Set<string>();
  const out: FeedPerformer[] = [];

  for (const p of performers) {
    if (p.live === false) continue;

    const feedKey = getPerformerKey(p);
    if (seenKeys.has(feedKey)) continue;

    const posterUrl = pickFeedPosterUrl(p);
    if (!posterUrl) continue;

    const base = posterBaseKey(posterUrl);
    if (seenPosterBases.has(base)) {
      const alt = p.thumbnailUrl?.trim();
      const snap = p.liveSnapshotURL?.trim();
      const onlySnap =
        alt && snap && isHttpsUrl(snap) && posterBaseKey(snap) !== base
          ? `${snap}${snap.includes("?") ? "&" : "?"}nx_feed=${encodeURIComponent(feedKey)}`
          : null;
      if (!onlySnap || seenPosterBases.has(posterBaseKey(onlySnap))) continue;
      seenPosterBases.add(posterBaseKey(onlySnap));
      seenKeys.add(feedKey);
      const embedPlan = resolvePerformerEmbedPlan(p, feedKey);
      out.push({ ...p, feedKey, posterUrl: onlySnap, embedPlan });
      continue;
    }

    seenPosterBases.add(base);
    seenKeys.add(feedKey);
    const embedPlan = resolvePerformerEmbedPlan(p, feedKey);
    out.push({ ...p, feedKey, posterUrl, embedPlan });
  }

  return out;
}
