import type { CSSProperties } from "react";

/** Face-safe crop (validated mobile feed). */
export const FEED_PLAYER_TRANSFORM_ORIGIN = "center 38%";

/**
 * Zoom inside Streamate's 16:9 iframe to kill interior letterboxing (validated).
 * Combined with geometric cover when the slide is extra tall vs width.
 */
export const FEED_PLAYER_INTERIOR_ZOOM = 3.15;

/** Hides player chrome / sub-pixel gaps at edges. */
export const FEED_COVER_BLEED = 1.04;

export function feedSlideBoxStyle(heightPx: number): CSSProperties {
  return {
    position: "relative",
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    flexShrink: 0,
    overflow: "hidden",
    background: "#000",
  };
}

export function feedPlayerMountStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    overflow: "hidden",
    background: "#000",
  };
}

export function feedEmbedRootStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    overflow: "hidden",
    background: "#000",
  };
}

export function feedEmbedStageStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    overflow: "hidden",
    background: "#000",
  };
}

/** Cover scale: validated interior zoom + geometric 9:16 cover (no hard cap). */
export function computeFeedVerticalCoverScale(
  slideWidthPx: number,
  slideHeightPx: number,
): number {
  if (slideWidthPx <= 0 || slideHeightPx <= 0) {
    return FEED_PLAYER_INTERIOR_ZOOM * FEED_COVER_BLEED;
  }
  const geometric = (16 * slideHeightPx) / (9 * slideWidthPx);
  return Math.max(FEED_PLAYER_INTERIOR_ZOOM, geometric) * FEED_COVER_BLEED;
}

/**
 * Validated TikTok layout: 16:9 surface height = slide height, centered, scaled up.
 */
export function feedEmbedIframeStyle(
  slideHeightPx: number,
  slideWidthPx?: number,
): CSSProperties {
  const heightPx = Math.round(slideHeightPx);
  const coverWidth = Math.round((heightPx * 16) / 9);
  const widthPx =
    slideWidthPx && slideWidthPx > 0
      ? slideWidthPx
      : Math.round((heightPx * 9) / 16);
  const scale =
    Math.round(
      computeFeedVerticalCoverScale(widthPx, heightPx) * 1000,
    ) / 1000;

  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: coverWidth,
    height: heightPx,
    margin: 0,
    padding: 0,
    border: "0",
    background: "#000",
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: FEED_PLAYER_TRANSFORM_ORIGIN,
    clipPath: "none",
  };
}

export function feedPosterImageStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    objectFit: "cover",
    objectPosition: "center 38%",
  };
}
