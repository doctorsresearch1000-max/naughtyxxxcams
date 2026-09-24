/**
 * Synchronous registry for the active feed iframe. useEffect registration runs
 * too late for user-gesture audio unlock; callback refs must register here.
 */

export type FeedAudioHandle = {
  iframe: HTMLIFrameElement;
  embedKey: string;
};

let activeHandle: FeedAudioHandle | null = null;

export function registerFeedAudioHandle(handle: FeedAudioHandle | null): void {
  activeHandle = handle;
}

export function getActiveFeedAudioHandle(): FeedAudioHandle | null {
  return activeHandle;
}

function readEmbedMutedParam(iframe: HTMLIFrameElement): string | null {
  const raw = iframe.src || iframe.getAttribute("src") || "";
  if (!raw) return null;
  try {
    return new URL(raw, window.location.origin).searchParams.get("muted");
  } catch {
    return null;
  }
}

export function navigateActiveFeedEmbedMuted(wantSound: boolean): boolean {
  const handle = activeHandle;
  if (!handle?.iframe) return false;

  const mutedParam = wantSound ? "0" : "1";
  const iframe = handle.iframe;
  const current = readEmbedMutedParam(iframe);
  if (current === mutedParam) {
    return true;
  }

  const raw = iframe.src || iframe.getAttribute("src") || "";
  if (!raw) return false;

  try {
    const url = new URL(raw, window.location.origin);
    url.searchParams.set("muted", mutedParam);
    iframe.src = url.toString();
    return true;
  } catch {
    return false;
  }
}

export function isActiveEmbedUnmuted(): boolean {
  const iframe = activeHandle?.iframe;
  if (!iframe) return false;
  return readEmbedMutedParam(iframe) === "0";
}
