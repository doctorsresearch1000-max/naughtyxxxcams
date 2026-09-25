import type { CSSProperties } from "react";

/** Face-safe crop (validated on mobile feed). */
export const FEED_PLAYER_TRANSFORM_ORIGIN = "center 38%";

/** Hides ~1–2% Streamate player chrome without over-zooming. */
export const FEED_COVER_BLEED = 1.028;

export function feedSlideBoxStyle(heightPx: number): CSSProperties {
  return {
    position: "relative",
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    flexShrink: 0,
    overflow: "hidden",
    background: "#000",
  };
}

export function feedPlayerMountStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    overflow: "hidden",
    background: "#000",
  };
}

export function feedEmbedRootStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    overflow: "hidden",
    background: "#000",
  };
}

export function feedEmbedStageStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    overflow: "hidden",
    background: "#000",
  };
}

/**
 * Uniform scale so a width-fit 16:9 iframe covers a 9:16 slide (object-fit: cover).
 * Exact: scale = 16·H / (9·W).
 */
export function computeFeedVerticalCoverScale(
  slideWidthPx: number,
  slideHeightPx: number,
): number {
  if (slideWidthPx <= 0 || slideHeightPx <= 0) {
    return 3.15;
  }
  const baseHeight = (slideWidthPx * 9) / 16;
  const raw = slideHeightPx / baseHeight;
  return Math.min(Math.max(raw, 1.02), 3.75);
}

/**
 * TikTok-style cover: 16:9 iframe sized to slide width, scaled to fill slide height.
 */
export function feedEmbedIframeStyle(
  slideHeightPx: number,
  slideWidthPx?: number,
): CSSProperties {
  const widthPx =
    slideWidthPx && slideWidthPx > 0
      ? Math.round(slideWidthPx)
      : Math.round((slideHeightPx * 9) / 16);
  const baseHeight = Math.round((widthPx * 9) / 16);
  const scale =
    computeFeedVerticalCoverScale(widthPx, slideHeightPx) * FEED_COVER_BLEED;
  const scaleRounded = Math.round(scale * 1000) / 1000;

  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: widthPx,
    height: baseHeight,
    margin: 0,
    padding: 0,
    border: "0",
    background: "#000",
    transform: `translate(-50%, -50%) scale(${scaleRounded})`,
    transformOrigin: FEED_PLAYER_TRANSFORM_ORIGIN,
    clipPath: "none",
  };
}

export function feedPosterImageStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    objectFit: "cover",
    objectPosition: "center 38%",
  };
}
