import type { FeedPerformer } from "@/lib/feed/filterPerformers";

type FeedCachePayload = {
  performers: FeedPerformer[];
  complete: boolean;
  fetchedAt: number;
};

const CACHE_TTL_MS = 90_000;
let memoryCache: FeedCachePayload | null = null;
let bootstrapPromise: Promise<FeedCachePayload> | null = null;
let fullPromise: Promise<FeedCachePayload> | null = null;

function isFresh(cache: FeedCachePayload | null): boolean {
  if (!cache) return false;
  return Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}

export function readFeedPerformersCache(): FeedCachePayload | null {
  if (!isFresh(memoryCache)) return null;
  return memoryCache;
}

async function fetchPerformersJson(
  query: string,
): Promise<FeedPerformer[]> {
  const res = await fetch(`/api/performers${query}`, { cache: "no-store" });
  const json = (await res.json()) as { performers?: FeedPerformer[] };
  return Array.isArray(json.performers) ? json.performers : [];
}

/** First page only — targets sub-second TTFB for slide 0 (LCP). */
export async function fetchFeedBootstrapPerformers(): Promise<FeedCachePayload> {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const performers = await fetchPerformersJson("?bootstrap=1");
    const payload: FeedCachePayload = {
      performers,
      complete: false,
      fetchedAt: Date.now(),
    };
    memoryCache = payload;
    return payload;
  })().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}

/** Full catalog for long scroll sessions (background). */
export async function fetchFeedFullPerformers(): Promise<FeedCachePayload> {
  if (fullPromise) return fullPromise;

  fullPromise = (async () => {
    const performers = await fetchPerformersJson("");
    const payload: FeedCachePayload = {
      performers,
      complete: true,
      fetchedAt: Date.now(),
    };
    memoryCache = payload;
    return payload;
  })().finally(() => {
    fullPromise = null;
  });

  return fullPromise;
}

export function prefetchHomeFeedPerformers(): void {
  if (readFeedPerformersCache()?.performers.length) return;
  void fetchFeedBootstrapPerformers().catch(() => {});
}
