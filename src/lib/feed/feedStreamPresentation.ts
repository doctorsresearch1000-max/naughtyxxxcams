import { feedEmbedIframeStyle } from "@/components/feed/feedPlayerStyles";

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
  "margin",
  "padding",
  "border",
  "background",
  "pointer-events",
] as const;

/** Strip viewport-dock presentation before mounting in the slide stage. */
export function clearStreamIframeDockStyles(iframe: HTMLIFrameElement): void {
  iframe.classList.remove("feed-embed-iframe--docked");
  for (const prop of DOCK_INLINE_PROPS) {
    iframe.style.removeProperty(prop);
  }
  iframe.style.clipPath = "none";
}

export function applyStreamIframeStageLayout(
  iframe: HTMLIFrameElement,
  slideHeightPx: number,
): void {
  clearStreamIframeDockStyles(iframe);
  Object.assign(iframe.style, feedEmbedIframeStyle(slideHeightPx));
}
