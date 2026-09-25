import {
  feedEmbedIframeStyle,
  measureEmbedStagePx,
} from "@/lib/feed/feedPlayerStyles";

const DOCK_INLINE_PROPS = [
  "clip-path",
  "-webkit-clip-path",
  "position",
  "left",
  "right",
  "top",
  "bottom",
  "width",
  "height",
  "max-height",
  "max-width",
  "z-index",
  "opacity",
  "visibility",
  "transform",
  "transform-origin",
  "margin",
  "padding",
  "border",
  "background",
  "pointer-events",
] as const;

/** Remove viewport-dock rules before applying in-card TikTok layout. */
export function clearStreamIframeDockStyles(iframe: HTMLIFrameElement): void {
  iframe.classList.remove("feed-embed-iframe--docked");
  for (const prop of DOCK_INLINE_PROPS) {
    iframe.style.removeProperty(prop);
  }
  iframe.style.clipPath = "none";
}

export function applyStreamIframeStagePresentation(
  iframe: HTMLIFrameElement,
  slideHeightPx: number,
  _isActive: boolean,
  stageWidthPx?: number,
): void {
  clearStreamIframeDockStyles(iframe);
  iframe.className = "feed-embed-iframe pointer-events-none";

  const stage = iframe.parentElement;
  if (stage) {
    const { widthPx, heightPx } = measureEmbedStagePx(stage);
    Object.assign(
      iframe.style,
      feedEmbedIframeStyle(heightPx, widthPx),
    );
    return;
  }

  Object.assign(
    iframe.style,
    feedEmbedIframeStyle(slideHeightPx, stageWidthPx),
  );
}
