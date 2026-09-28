/** Seconds to cache upstream performer API responses at Cloudflare edge. */
export const EDGE_UPSTREAM_CACHE_TTL_SECONDS = 60;

export type EdgeCachedRequestInit = RequestInit & {
  cf?: {
    cacheTtl?: number;
    cacheEverything?: boolean;
  };
  next?: { revalidate?: number };
};

/**
 * Request init for external model APIs (Streamate / performers-ext).
 * Avoids `cache: "no-store"` so Workers can satisfy repeat traffic from edge cache.
 */
export function edgeCachedUpstreamInit(
  init: RequestInit = {},
): EdgeCachedRequestInit {
  const rest = { ...init };
  delete (rest as RequestInit & { cache?: RequestCache }).cache;
  return {
    ...rest,
    cf: {
      cacheTtl: EDGE_UPSTREAM_CACHE_TTL_SECONDS,
      cacheEverything: true,
    },
    next: { revalidate: EDGE_UPSTREAM_CACHE_TTL_SECONDS },
  };
}
