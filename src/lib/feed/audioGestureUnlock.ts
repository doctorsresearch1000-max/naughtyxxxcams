/**
 * Cross-origin widget audio requires the embed navigation to start inside the
 * user-gesture turn. React state updates that remount or change iframe `key`
 * fire a second load without gesture and keep the stream muted.
 */
let activeFeedIframe: HTMLIFrameElement | null = null;

export function setActiveFeedIframeElement(
  iframe: HTMLIFrameElement | null,
): void {
  activeFeedIframe = iframe;
}

function applyMutedToIframe(
  iframe: HTMLIFrameElement,
  wantSound: boolean,
): void {
  const mutedParam = wantSound ? "0" : "1";
  const rawSrc = iframe.src || iframe.getAttribute("src") || "";
  if (!rawSrc) return;

  try {
    const url = new URL(rawSrc, window.location.origin);
    if (url.searchParams.get("muted") === mutedParam) return;
    url.searchParams.set("muted", mutedParam);
    const next = url.toString();
    iframe.src = next;
  } catch {
    /* ignore malformed src */
  }
}

export function syncReloadFeedIframesForAudio(wantSound: boolean): void {
  if (activeFeedIframe) {
    applyMutedToIframe(activeFeedIframe, wantSound);
    return;
  }

  document
    .querySelectorAll<HTMLIFrameElement>('iframe[data-naughty-feed-embed="true"]')
    .forEach((iframe) => {
      if (iframe.dataset.naughtyActiveAudio !== "true") return;
      applyMutedToIframe(iframe, wantSound);
    });
}
