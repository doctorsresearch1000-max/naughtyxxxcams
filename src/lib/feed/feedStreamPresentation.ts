import { feedEmbedIframeStageStyle } from "@/lib/feed/feedPlayerStyles";

/** Remove every dock inline rule so fixed/clip-path cannot leak into the stage. */
export function clearStreamIframeDockStyles(iframe: HTMLIFrameElement): void {
  iframe.style.cssText = "";
  iframe.classList.remove("feed-embed-iframe--docked");
}

export function applyStreamIframeStagePresentation(
  iframe: HTMLIFrameElement,
  stageHeightPx: number,
  isActive: boolean,
): void {
  clearStreamIframeDockStyles(iframe);
  iframe.className = `feed-embed-iframe feed-embed-iframe--stage ${
    isActive ? "pointer-events-auto" : "pointer-events-none"
  }`;
  Object.assign(iframe.style, feedEmbedIframeStageStyle(stageHeightPx));
}
