/** Remove only dock-specific inline rules; stage layout comes from CSS classes. */
export function clearStreamIframeDockStyles(iframe: HTMLIFrameElement): void {
  iframe.classList.remove("feed-embed-iframe--docked");
  iframe.style.removeProperty("clip-path");
  iframe.style.removeProperty("-webkit-clip-path");
  iframe.style.clipPath = "none";

  if (iframe.style.position === "fixed") {
    iframe.style.removeProperty("position");
  }
  if (iframe.style.width?.includes("vw") || iframe.style.height?.includes("vh")) {
    iframe.style.removeProperty("width");
    iframe.style.removeProperty("height");
    iframe.style.removeProperty("max-height");
  }
  iframe.style.removeProperty("left");
  iframe.style.removeProperty("bottom");
  iframe.style.removeProperty("z-index");
}

export function applyStreamIframeStagePresentation(
  iframe: HTMLIFrameElement,
  isActive: boolean,
): void {
  clearStreamIframeDockStyles(iframe);
  iframe.className = `feed-embed-iframe feed-embed-iframe--stage ${
    isActive ? "pointer-events-auto" : "pointer-events-none"
  }`;
}
