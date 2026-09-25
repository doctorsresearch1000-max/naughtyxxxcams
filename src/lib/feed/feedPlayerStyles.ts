import type { CSSProperties } from "react";

/**
 * Explicit pixel height on the snap card; inner stack uses the same `heightPx`
 * (WebKit iframes do not reliably resolve height: 100% in scroll-snap feeds).
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

function feedStackLayerStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    overflow: "hidden",
    background: "#000",
  };
}

export function feedPlayerMountStyle(heightPx: number): CSSProperties {
  return {
    ...feedStackLayerStyle(heightPx),
    zIndex: 0,
  };
}

export function feedEmbedRootStyle(heightPx: number): CSSProperties {
  return feedStackLayerStyle(heightPx);
}

export function feedEmbedStageStyle(heightPx: number): CSSProperties {
  return feedStackLayerStyle(heightPx);
}

/** Fills the stage using measured pixel height (not %). */
export function feedEmbedIframeStageStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    margin: 0,
    padding: 0,
    border: "0",
    background: "#000",
    clipPath: "none",
    transform: "none",
  };
}

export function feedPosterImageStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    objectFit: "cover",
    objectPosition: "center 35%",
  };
}
