import type { CSSProperties } from "react";

/** Face-safe crop (matches poster object-position). */
export const FEED_PLAYER_TRANSFORM_ORIGIN = "center 38%";

/** Slight bleed so Streamate player chrome stays outside the clip. */
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

export function feedPlayerMountStyle(_heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    width: "100%",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
    background: "#000",
    isolation: "isolate",
  };
}

export function feedEmbedRootStyle(_heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
    background: "#000",
  };
}

export function feedEmbedStageStyle(_heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
  };
}

export function measureEmbedStagePx(stage: HTMLElement): {
  widthPx: number;
  heightPx: number;
} {
  const rect = stage.getBoundingClientRect();
  return {
    widthPx: Math.max(1, Math.round(rect.width)),
    heightPx: Math.max(1, Math.round(rect.height)),
  };
}

/**
 * Uniform scale so a width-fit 16:9 iframe covers a 9:16 stage (like object-fit: cover).
 * Exact: scale = H_slide / (9/16 * W_slide) = 16·H / (9·W).
 */
export function computeFeedVerticalCoverScale(
  stageWidthPx: number,
  stageHeightPx: number,
): number {
  if (stageWidthPx <= 0 || stageHeightPx <= 0) {
    return 3.15;
  }
  const baseHeight = (stageWidthPx * 9) / 16;
  const raw = stageHeightPx / baseHeight;
  return Math.min(Math.max(raw, 1.02), 3.75);
}

/**
 * Same visual footprint as `.feed-embed-poster` (inset 0 + cover), but for the 16:9 iframe
 * we scale uniformly from the stage center so the stream fills the slide height.
 */
export function feedEmbedIframeStyle(
  stageHeightPx: number,
  stageWidthPx?: number,
): CSSProperties {
  const widthPx =
    stageWidthPx && stageWidthPx > 0
      ? Math.round(stageWidthPx)
      : Math.round((stageHeightPx * 9) / 16);
  const heightPx = Math.round((widthPx * 9) / 16);
  const scale =
    computeFeedVerticalCoverScale(widthPx, stageHeightPx) * FEED_COVER_BLEED;
  const scaleRounded = Math.round(scale * 1000) / 1000;

  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: widthPx,
    height: heightPx,
    margin: 0,
    padding: 0,
    border: "0",
    background: "#000",
    transform: `translate(-50%, -50%) scale(${scaleRounded})`,
    transformOrigin: FEED_PLAYER_TRANSFORM_ORIGIN,
    clipPath: "none",
  };
}

/** Poster: full-bleed inside embed root (same box the iframe is clipped to). */
export function feedPosterImageStyle(_heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    minHeight: 0,
    maxHeight: "none",
    objectFit: "cover",
    objectPosition: "center 38%",
  };
}
