/** Max models exposed on first SSR paint (home layout bridge). */
export const HOME_SSR_PERFORMER_CAP = 30;

/** API pages fetched for bootstrap (`maxPages: 1` + cap after filter). */
export const HOME_BOOTSTRAP_TARGET = HOME_SSR_PERFORMER_CAP;

/** Default pages for client “full” home catalog (was 20 — caused Worker 1102). */
export const HOME_FEED_MAX_PAGES_DEFAULT = 3;

/** Hard ceiling when callers pass `maxPages` query param. */
export const HOME_FEED_MAX_PAGES_CEILING = 8;

export const HOME_FEED_PAGE_SIZE = 100;
