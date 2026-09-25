import type { CSSProperties } from "react";

/**
 * Single source of slide height: the snap card (`feedSlideBoxStyle`).
 * Every layer below uses `feedPlayerFillStyle` (100% of that box).
 */

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

/** Fills the slide card edge-to-edge (parent must have explicit height). */
export function feedPlayerFillStyle(): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    minHeight: "100%",
    overflow: "hidden",
    background: "#000",
  };
}

export function feedPlayerMountStyle(_heightPx: number): CSSProperties {
  return feedPlayerFillStyle();
}

export function feedEmbedRootStyle(_heightPx: number): CSSProperties {
  return feedPlayerFillStyle();
}

export function feedEmbedStageStyle(_heightPx: number): CSSProperties {
  return feedPlayerFillStyle();
}

/** Stage iframes use `.feed-embed-iframe--stage` in CSS (100% × 100%). */
export function feedEmbedIframeStageInlineStyle(): CSSProperties {
  return {
    clipPath: "none",
  };
}

export function feedPosterImageStyle(_heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    minHeight: "100%",
    maxHeight: "none",
    objectFit: "cover",
    objectPosition: "center 35%",
  };
}
