/**
 * TeleHub-style feed audio bridge: never rewrite iframe src for volume.
 * Unlock/mute via synchronous postMessage bundles + timed retries.
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

/**
 * TeleHub `postLiveIframeAudio`: postMessage burst with retries.
 * @param force When true (user gesture), send even if stream not revealed yet.
 */
export function postLiveIframeAudio(
  wantSound: boolean,
  options?: { force?: boolean },
): void {
  const target = activeTarget;
  const win = target?.contentWindow;
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

/** Synchronous bundle for pointerdown (0ms only in gesture stack). */
export function postLiveIframeAudioSync(wantSound: boolean): void {
  const target = activeTarget;
  const win = target?.contentWindow;
  if (!target || !win) return;

  const action = wantSound ? FeedAudioAction.unlock : FeedAudioAction.mute;
  try {
    postToEmbedWindow(win, action);
  } catch {
    /* detached */
  }
}

/** TeleHub `setFeedCardAudio`: UI-facing mute without session lock reset. */
export function setFeedCardAudio(wantSound: boolean, gesture: boolean): void {
  if (gesture) {
    resumeBrowserAudioContext();
    postLiveIframeAudioSync(wantSound);
    postLiveIframeAudio(wantSound, { force: gesture });
    return;
  }
  postLiveIframeAudio(wantSound);
}
