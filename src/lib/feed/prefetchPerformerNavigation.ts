import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { injectStreamPreconnects, warmPerformerStream } from "@/lib/feed/streamEmbedWarmup";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";

let lastPrefetchKey = "";
let lastPrefetchAt = 0;

export function prefetchPerformerOnIntent(
  performer: FeedPerformer,
  routerPrefetch?: (href: string) => void,
): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (
    lastPrefetchKey === performer.feedKey &&
    now - lastPrefetchAt < 400
  ) {
    return;
  }
  lastPrefetchKey = performer.feedKey;
  lastPrefetchAt = now;

  injectStreamPreconnects();
  warmPerformerStream(performer.feedKey, performer.embedPlan, { pin: true });

  const path = performerProfilePathFromPerformer(performer);
  if (path && routerPrefetch) {
    routerPrefetch(path);
  }
}
