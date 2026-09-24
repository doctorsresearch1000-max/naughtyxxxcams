/**
 * Browsers only allow unmuted playback when the embed loads (or play() runs)
 * inside the same user-gesture turn as the tap. postMessage handlers run after
 * that window closes, so cross-origin widget audio never unlocks that way.
 * Reload the same-origin feed iframe with muted=0 synchronously on click.
 */
export function syncReloadFeedIframesForAudio(wantSound: boolean): void {
  const mutedParam = wantSound ? "0" : "1";
  const iframes = document.querySelectorAll<HTMLIFrameElement>(
    'iframe[data-naughty-feed-embed="true"]',
  );

  iframes.forEach((iframe) => {
    const isActive = iframe.dataset.naughtyActiveAudio === "true";
    if (!isActive) return;

    const rawSrc = iframe.getAttribute("src");
    if (!rawSrc) return;

    try {
      const url = new URL(rawSrc, window.location.origin);
      if (url.searchParams.get("muted") === mutedParam) return;
      url.searchParams.set("muted", mutedParam);
      iframe.setAttribute("src", url.toString());
    } catch {
      /* ignore malformed src */
    }
  });
}
