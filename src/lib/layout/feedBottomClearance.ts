/** Shared bottom chrome metrics (MobileBottomChrome + slide overlays). */

export const FEED_BOTTOM_CLEARANCE_CSS_VAR = "--feed-bottom-clearance";

/** Nav pill (54px) + margin + safe-area. */
export const FEED_BOTTOM_NAV_BLOCK =
  "calc(3.625rem + 0.25rem + max(0.5rem, env(safe-area-inset-bottom, 0px)))";

/** Conversion CTA (min 56px) + spacing above nav. */
export const FEED_BOTTOM_CTA_EXTRA =
  "calc(3.5rem + 0.5rem)";

export function syncFeedBottomClearanceCss(showConversionCta: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(
    "--feed-bottom-cta-extra",
    showConversionCta ? FEED_BOTTOM_CTA_EXTRA : "0px",
  );
}

export function resetFeedBottomClearanceCss(): void {
  syncFeedBottomClearanceCss(false);
}
