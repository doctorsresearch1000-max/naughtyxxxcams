import {
  getActiveFeedAudioHandle,
  navigateActiveFeedEmbedMuted,
} from "@/lib/feed/feedAudioRegistry";

/** @deprecated use navigateActiveFeedEmbedMuted */
export function setActiveFeedIframeElement(_iframe: HTMLIFrameElement | null): void {
  /* kept for transitional imports — registration is via registerFeedAudioHandle */
}

export function syncReloadFeedIframesForAudio(wantSound: boolean): void {
  if (navigateActiveFeedEmbedMuted(wantSound)) {
    return;
  }

  const handle = getActiveFeedAudioHandle();
  if (handle?.iframe) {
    navigateActiveFeedEmbedMuted(wantSound);
    return;
  }

  document
    .querySelectorAll<HTMLIFrameElement>('iframe[data-naughty-feed-embed="true"]')
    .forEach((iframe) => {
      if (iframe.dataset.naughtyActiveAudio !== "true") return;
      const mutedParam = wantSound ? "0" : "1";
      const raw = iframe.src || iframe.getAttribute("src") || "";
      if (!raw) return;
      try {
        const url = new URL(raw, window.location.origin);
        if (url.searchParams.get("muted") === mutedParam) return;
        url.searchParams.set("muted", mutedParam);
        iframe.src = url.toString();
      } catch {
        /* ignore */
      }
    });
}
