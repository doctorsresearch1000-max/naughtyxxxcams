import type { CSSProperties } from "react";

/** Full-height iframe already fills 9:16; extra scale only crops quality. */
export const FEED_PLAYER_FILL_SCALE = 1;
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

/** Fills the snap slide; height comes from the slide box. */
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

/** Legacy inline cover (desktop shells); mobile stage uses `.feed-embed-iframe--stage` in CSS. */
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
    objectFit: "cover",
    objectPosition: "center 35%",
  };
}
