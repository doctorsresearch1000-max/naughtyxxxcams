import type { CSSProperties } from "react";

/** Zoom inside cross-origin Streamate iframe to fill 9:16 (validated before dock engine). */
export const FEED_PLAYER_FILL_SCALE = 3.15;
export const FEED_PLAYER_TRANSFORM_ORIGIN = "center 35%";

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
    isolation: "isolate",
  };
}

export function feedEmbedRootStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    overflow: "hidden",
  };
}

/** 16:9 surface at slide height, centered, scaled to TikTok cover. */
export function feedEmbedIframeStyle(heightPx: number): CSSProperties {
  const coverWidth = Math.round((heightPx * 16) / 9);
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
    transform: `translate(-50%, -50%) scale(${FEED_PLAYER_FILL_SCALE})`,
    transformOrigin: FEED_PLAYER_TRANSFORM_ORIGIN,
    clipPath: "none",
  };
}

export function feedPosterImageStyle(heightPx: number): CSSProperties {
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: heightPx,
    minHeight: heightPx,
    maxHeight: heightPx,
    objectFit: "cover",
    objectPosition: "center 35%",
  };
}
