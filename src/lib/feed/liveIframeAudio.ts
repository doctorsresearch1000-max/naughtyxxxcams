/**
 * Feed audio: cross-origin Streamate players are controlled via postMessage.
 * Never change iframe `src` for mute/unmute — that reloads the stream.
 */

import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";

export const FEED_AUDIO_SOURCE = "naughty-feed";

export type FeedAudioAction = "session-audio-mute" | "session-audio-unlock";

const ACTIVE_IFRAME_SELECTOR =
  '[data-feed-card-root][data-feed-active="1"] iframe[data-naughty-feed-embed="true"]';

const ALL_FEED_IFRAMES_SELECTOR = 'iframe[data-naughty-feed-embed="true"]';

const AUDIO_RETRY_MS = [0, 40, 120, 320] as const;

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

function buildPostMessagePayloads(
  action: FeedAudioAction,
): Record<string, unknown>[] {
  const unlock = action === "session-audio-unlock";
  return [
    { source: FEED_AUDIO_SOURCE, action },
    { source: FEED_AUDIO_SOURCE, action, volumelevel: unlock ? 1 : 0 },
    { type: unlock ? "unmute" : "mute" },
    { command: unlock ? "unmute" : "mute" },
    { event: "volume", volume: unlock ? 1 : 0, muted: !unlock },
    { method: "setVolume", args: [unlock ? 100 : 0] },
    { action: unlock ? "soundOn" : "soundOff" },
    { msg: unlock ? "unmute" : "mute" },
    { mute: !unlock },
    { muted: !unlock },
  ];
}

/** Post mute/unmute into a player iframe (no navigation / no src change). */
export function postLiveIframeAudio(
  iframe: HTMLIFrameElement | null,
  action: FeedAudioAction,
): void {
  if (!iframe) return;
  const payloads = buildPostMessagePayloads(action);

  const send = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    for (const data of payloads) {
      try {
        win.postMessage(data, "*");
      } catch {
        /* cross-origin */
      }
    }
  };

  send();
  for (const ms of AUDIO_RETRY_MS) {
    if (ms === 0) continue;
    window.setTimeout(send, ms);
  }
}

export function getActiveFeedPlayerIframe(): HTMLIFrameElement | null {
  return document.querySelector(
    ACTIVE_IFRAME_SELECTOR,
  ) as HTMLIFrameElement | null;
}

export function getAllFeedPlayerIframes(): HTMLIFrameElement[] {
  return Array.from(
    document.querySelectorAll(ALL_FEED_IFRAMES_SELECTOR),
  ) as HTMLIFrameElement[];
}

/**
 * Hard silence every feed player except optional active iframe (slide change).
 */
export function silenceAllFeedEmbedIframes(
  exceptIframe?: HTMLIFrameElement | null,
): void {
  for (const iframe of getAllFeedPlayerIframes()) {
    if (exceptIframe && iframe === exceptIframe) continue;
    postLiveIframeAudio(iframe, "session-audio-mute");
  }
}

export function silenceInactiveFeedEmbedIframes(): void {
  const active = getActiveFeedPlayerIframe();
  silenceAllFeedEmbedIframes(active);
}

/**
 * User-gesture audio toggle on the active slide only (no src rewrite).
 */
export function applyDirectPlayerAudioFromGesture(
  wantSound: boolean,
  embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
): boolean {
  const iframe = getActiveFeedPlayerIframe();
  if (!iframe) return false;
  void embedPlan;
  postLiveIframeAudio(
    iframe,
    wantSound ? "session-audio-unlock" : "session-audio-mute",
  );
  return true;
}

/** @deprecated Use postLiveIframeAudio — src changes reload the player. */
export function setFeedEmbedIframeAudible(
  iframe: HTMLIFrameElement | null,
  wantSound: boolean,
  _embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
): boolean {
  if (!iframe) return false;
  postLiveIframeAudio(
    iframe,
    wantSound ? "session-audio-unlock" : "session-audio-mute",
  );
  return true;
}

/** @deprecated Use silenceAllFeedEmbedIframes */
export function muteAllFeedEmbedIframes(): void {
  silenceAllFeedEmbedIframes();
}

/** @deprecated Use silenceInactiveFeedEmbedIframes */
export function muteInactiveFeedEmbedIframes(): void {
  silenceInactiveFeedEmbedIframes();
}

export function setFeedCardAudio(wantSound: boolean, gesture: boolean): void {
  if (!gesture) return;
  resumeBrowserAudioContext();
  applyDirectPlayerAudioFromGesture(wantSound);
}

export function setActiveFeedIframePointerEvents(): void {}

export function getActiveFeedAudioTarget(): null {
  return null;
}

export function registerActiveFeedAudioTarget(): void {}
