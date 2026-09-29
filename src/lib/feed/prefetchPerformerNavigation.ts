import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { injectStreamPreconnects, warmPerformerStream } from "@/lib/feed/streamEmbedWarmup";
import {
  rememberCatalogScroll,
  type CatalogScrollRoute,
} from "@/lib/navigation/catalogScrollRestore";
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

  const path = window.location.pathname;
  const catalogRoute: CatalogScrollRoute | null =
    path === "/"
      ? "home"
      : path === "/explore" || path.startsWith("/explore/")
        ? "explore"
        : null;
  if (catalogRoute) {
    rememberCatalogScroll(catalogRoute);
  }

  try {
    sessionStorage.setItem(
      "nx-last-warm-feed-key",
      JSON.stringify({
        feedKey: performer.feedKey,
        at: Date.now(),
      }),
    );
  } catch {
    /* private mode */
  }

  const profilePath = performerProfilePathFromPerformer(performer);
  if (profilePath) {
    if (routerPrefetch) {
      routerPrefetch(profilePath);
    }
    try {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = profilePath;
      link.as = "document";
      document.head.appendChild(link);
    } catch {
      /* ignore */
    }
  }
}
