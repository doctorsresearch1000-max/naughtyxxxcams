/**
 * TeleHub-style feed audio bridge: outer iframe src stays stable; unlock/mute via postMessage.
 * Embed shell rewrites inner Crak feed URL params (volumelevel) on unlock for cross-origin players.
 */

export const FEED_AUDIO_SOURCE = "naughty-feed";

export const FeedAudioAction = {
  unlock: "session-audio-unlock",
  mute: "session-audio-mute",
} as const;

export type FeedAudioActionType =
  (typeof FeedAudioAction)[keyof typeof FeedAudioAction];

export const FEED_AUDIO_RETRY_MS = [0, 120, 480] as const;

export type ActiveFeedAudioTarget = {
  iframe: HTMLIFrameElement;
  cardRoot: HTMLElement;
  contentWindow: Window | null;
  embedKey: string;
};

let activeTarget: ActiveFeedAudioTarget | null = null;
let retryTimers: number[] = [];

function clearRetryTimers(): void {
  retryTimers.forEach((id) => window.clearTimeout(id));
  retryTimers = [];
}

export function registerActiveFeedAudioTarget(
  target: ActiveFeedAudioTarget | null,
): void {
  activeTarget = target;
}

export function getActiveFeedAudioTarget(): ActiveFeedAudioTarget | null {
  return activeTarget;
}

export function isStreamRevealed(cardRoot: HTMLElement | null | undefined): boolean {
  return cardRoot?.getAttribute("data-stream-revealed") === "1";
}

/**
 * Fallback when React ref registration lags behind the user gesture.
 */
export function resolveActiveFeedAudioTargetFromDom(): ActiveFeedAudioTarget | null {
  if (activeTarget?.contentWindow) return activeTarget;

  const root = document.querySelector(
    '[data-feed-card-root][data-stream-revealed="1"]',
  ) as HTMLElement | null;
  if (!root) return null;

  const iframe = root.querySelector(
    'iframe[data-naughty-feed-embed="true"]',
  ) as HTMLIFrameElement | null;
  if (!iframe?.contentWindow) return null;

  const embedKey =
    root.getAttribute("data-feed-key") ||
    iframe.getAttribute("data-embed-key") ||
    "active";

  const target: ActiveFeedAudioTarget = {
    iframe,
    cardRoot: root,
    contentWindow: iframe.contentWindow,
    embedKey,
  };
  activeTarget = target;
  return target;
}

export function resumeBrowserAudioContext(): void {
  try {
    type ACtor = typeof AudioContext;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: ACtor }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    void ctx.resume();
  } catch {
    /* unsupported */
  }
}

function postToEmbedWindow(win: Window, action: FeedAudioActionType): void {
  win.postMessage(
    {
      source: FEED_AUDIO_SOURCE,
      action,
    },
    "*",
  );
}

function getTargetWindow(): Window | null {
  const target =
    activeTarget?.contentWindow ??
    resolveActiveFeedAudioTargetFromDom()?.contentWindow ??
    null;
  return target;
}

export function postLiveIframeAudio(
  wantSound: boolean,
  options?: { force?: boolean },
): void {
  const target = activeTarget ?? resolveActiveFeedAudioTargetFromDom();
  const win = target?.contentWindow ?? getTargetWindow();
  if (!target || !win) return;

  if (!options?.force && !isStreamRevealed(target.cardRoot)) {
    return;
  }

  const action = wantSound ? FeedAudioAction.unlock : FeedAudioAction.mute;
  clearRetryTimers();

  FEED_AUDIO_RETRY_MS.forEach((delay) => {
    const id = window.setTimeout(() => {
      try {
        postToEmbedWindow(win, action);
      } catch {
        /* detached */
      }
    }, delay);
    retryTimers.push(id);
  });
}

export function postLiveIframeAudioSync(wantSound: boolean): void {
  const target = activeTarget ?? resolveActiveFeedAudioTargetFromDom();
  const win = target?.contentWindow ?? getTargetWindow();
  if (!win) return;

  const action = wantSound ? FeedAudioAction.unlock : FeedAudioAction.mute;
  try {
    postToEmbedWindow(win, action);
  } catch {
    /* detached */
  }
}

export function setFeedCardAudio(wantSound: boolean, gesture: boolean): void {
  if (gesture) {
    resumeBrowserAudioContext();
    resolveActiveFeedAudioTargetFromDom();
    postLiveIframeAudioSync(wantSound);
    postLiveIframeAudio(wantSound, { force: gesture });
    return;
  }
  postLiveIframeAudio(wantSound);
}

/** Enable hit-testing on the outer feed iframe after session unlock. */
export function setActiveFeedIframePointerEvents(enabled: boolean): void {
  const iframe =
    activeTarget?.iframe ??
    (document.querySelector(
      '[data-feed-card-root][data-stream-revealed="1"] iframe[data-naughty-feed-embed="true"]',
    ) as HTMLIFrameElement | null);
  if (!iframe) return;
  iframe.style.pointerEvents = enabled ? "auto" : "none";
}
