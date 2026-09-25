/**
 * Poster dismissal for direct api-iframe (Pure) feeds.
 * Parent cannot observe first video frame; use bounded fallback from slide activation only.
 */

/** Iframe document was already loaded when the slide became active (e.g. N+1 dock). */
export const FEED_POSTER_FALLBACK_WARM_MS = 6_000;

/** Cold start: player document not ready at activation. */
export const FEED_POSTER_FALLBACK_COLD_MS = 12_000;

export const FEED_POSTER_FALLBACK_WARM_FAST_MS = 3_000;
export const FEED_POSTER_FALLBACK_COLD_FAST_MS = 6_000;

export function feedPosterFallbackDelayMs(
  documentReadyAtActivation: boolean,
  fastReveal?: boolean,
): number {
  if (fastReveal) {
    return documentReadyAtActivation
      ? FEED_POSTER_FALLBACK_WARM_FAST_MS
      : FEED_POSTER_FALLBACK_COLD_FAST_MS;
  }
  return documentReadyAtActivation
    ? FEED_POSTER_FALLBACK_WARM_MS
    : FEED_POSTER_FALLBACK_COLD_MS;
}
