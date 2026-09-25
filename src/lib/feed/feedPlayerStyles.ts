import type { CSSProperties } from "react";

export const FEED_PLAYER_TRANSFORM_ORIGIN = "center 38%";

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

/** Video layer — stays below overlay chrome (z-index on card). */
export function feedPlayerMountStyle(): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    background: "#000",
    isolation: "isolate",
  };
}

export function feedEmbedRootStyle(): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    background: "#000",
  };
}

export function feedEmbedStageStyle(): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    background: "#000",
  };
}

/** Stage iframe: fill the stage edge-to-edge (no transform scale). */
export function feedEmbedIframeStyle(): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    padding: 0,
    border: "0",
    background: "#000",
    transform: "none",
    clipPath: "none",
  };
}

export function feedPosterImageStyle(): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center 38%",
  };
}
