import { feedEmbedIframeStyle } from "@/lib/feed/feedPlayerStyles";

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

export function clearStreamIframeDockStyles(iframe: HTMLIFrameElement): void {
  iframe.classList.remove("feed-embed-iframe--docked");
  for (const prop of DOCK_INLINE_PROPS) {
    iframe.style.removeProperty(prop);
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
  Object.assign(iframe.style, feedEmbedIframeStyle());
}
