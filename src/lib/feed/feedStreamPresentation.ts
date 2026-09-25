import { feedEmbedIframeStageInlineStyle } from "@/lib/feed/feedPlayerStyles";

const DOCK_INLINE_KEYS = [
  "position",
  "left",
  "right",
  "top",
  "bottom",
  "width",
  "height",
  "max-height",
  "margin",
  "padding",
  "border",
  "opacity",
  "visibility",
  "pointer-events",
  "z-index",
  "clip-path",
  "transform",
  "transform-origin",
  "background",
] as const;

/** Strip dock-only inline rules; stage layout is CSS class + minimal inline. */
export function clearStreamIframeDockStyles(iframe: HTMLIFrameElement): void {
  iframe.classList.remove("feed-embed-iframe--docked");
  for (const key of DOCK_INLINE_KEYS) {
    iframe.style.removeProperty(key);
  }
  iframe.style.clipPath = "none";
}

export function applyStreamIframeStagePresentation(
  iframe: HTMLIFrameElement,
  isActive: boolean,
): void {
  clearStreamIframeDockStyles(iframe);
  iframe.className = `feed-embed-iframe feed-embed-iframe--stage ${
    isActive ? "pointer-events-auto" : "pointer-events-none"
  }`;
  Object.assign(iframe.style, feedEmbedIframeStageInlineStyle());
}
