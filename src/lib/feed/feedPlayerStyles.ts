import type { CSSProperties } from "react";

/** Zoom inside cross-origin Streamate iframe to fill 9:16 (mobile feed framing). */
export const FEED_PLAYER_FILL_SCALE = 3.22;
/** Slightly above center so the scaled frame tucks under the header overlay. */
export const FEED_PLAYER_TRANSFORM_ORIGIN = "center 33%";
/** Nudge up after centering (covers top letterbox inside the embed). */
export const FEED_PLAYER_TRANSLATE_Y = "-52%";

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

/** 16:9 surface at slide height, centered, scaled to TikTok cover. */
export function feedEmbedIframeStyle(slideHeightPx: number): CSSProperties {
  const coverWidth = Math.round((slideHeightPx * 16) / 9);
  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: coverWidth,
    height: slideHeightPx,
    margin: 0,
    padding: 0,
    border: "0",
    background: "#000",
    transform: `translate(-50%, ${FEED_PLAYER_TRANSLATE_Y}) scale(${FEED_PLAYER_FILL_SCALE})`,
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
