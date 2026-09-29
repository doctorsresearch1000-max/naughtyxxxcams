type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

/** Lightweight analytics hook — swap for GA/dataLayer later. */
export function trackEvent(name: string, payload?: AnalyticsPayload): void {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, payload ?? {});
  }
  try {
    const w = window as Window & { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer ?? [];
    w.dataLayer.push({ event: name, ...payload });
  } catch {
    /* SSR / private mode */
  }
}

export function trackCardClick(gridIndex: number, feedKey: string): void {
  trackEvent("card_click", { grid_index: gridIndex, feed_key: feedKey });
}

export function trackModelPageView(slug: string): void {
  trackEvent("model_page_view", { profile_slug: slug });
}

export function trackCtaClickOut(
  origin: "primary" | "sticky" | "end_card" | "quickview",
  slug: string,
): void {
  trackEvent("cta_click_out", { origin, profile_slug: slug });
}
