/**
 * Feed audio: dock/slide silencing uses postMessage. User-gesture unmute on the
 * active direct player reloads `playerSrcUnmuted` / `playerSrcMuted` (see performerEmbed).
 */

import {
  type PerformerEmbedPlan,
  withFeedAudioParams,
} from "@/lib/feed/performerEmbed";

export const FEED_AUDIO_SOURCE = "naughty-feed";

export type FeedAudioAction = "session-audio-mute" | "session-audio-unlock";

const ACTIVE_IFRAME_SELECTOR =
  '[data-feed-card-root][data-feed-active="1"] iframe[data-naughty-feed-embed="true"]';

const ALL_FEED_IFRAMES_SELECTOR = 'iframe[data-naughty-feed-embed="true"]';

const AUDIO_RETRY_MS = [0, 40, 120, 320] as const;

function resolveEmbedSrc(
  iframe: HTMLIFrameElement,
  wantSound: boolean,
  embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
): string | null {
  const mutedSrc =
    embedPlan?.playerSrcMuted ??
    iframe.getAttribute("data-player-src-muted") ??
    "";
  const unmutedSrc =
    embedPlan?.playerSrcUnmuted ??
    iframe.getAttribute("data-player-src-unmuted") ??
    "";
  const next = wantSound ? unmutedSrc : mutedSrc;
  return next || null;
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

/** Resolve feed player iframe for a slide (stage or body dock). */
export function getFeedPlayerIframeForKey(
  feedKey: string,
): HTMLIFrameElement | null {
  const docked = document.querySelector(
    `iframe[data-nx-stream-slot="${feedKey}"]`,
  ) as HTMLIFrameElement | null;
  if (docked) return docked;
  return document.querySelector(
    `[data-feed-key="${feedKey}"] iframe[data-naughty-feed-embed="true"]`,
  ) as HTMLIFrameElement | null;
}

function forceMutedPlayerSrc(iframe: HTMLIFrameElement): string | null {
  const raw = iframe.getAttribute("src")?.trim() || iframe.src?.trim() || "";
  if (!raw) return null;
  try {
    return withFeedAudioParams(raw, false);
  } catch {
    return null;
  }
}

/**
 * Hard silence feed players (muted `src` + postMessage). Streamate ignores
 * parent postMessage after gesture-unmute; src swap is required.
 */
export function silenceAllFeedEmbedIframes(
  exceptIframe?: HTMLIFrameElement | null,
): void {
  for (const iframe of getAllFeedPlayerIframes()) {
    if (exceptIframe && iframe === exceptIframe) continue;
    setFeedEmbedIframeAudible(iframe, false);
  }
}

export function silenceInactiveFeedEmbedIframes(): void {
  const active = getActiveFeedPlayerIframe();
  silenceAllFeedEmbedIframes(active);
}

/**
 * User-gesture audio on the active slide (sync inside click / pointerdown).
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
  return setFeedEmbedIframeAudible(iframe, wantSound, embedPlan);
}

export function setFeedEmbedIframeAudible(
  iframe: HTMLIFrameElement | null,
  wantSound: boolean,
  embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
): boolean {
  if (!iframe) return false;

  const action: FeedAudioAction = wantSound
    ? "session-audio-unlock"
    : "session-audio-mute";

  let next = resolveEmbedSrc(iframe, wantSound, embedPlan);
  if (!next && !wantSound) {
    next = forceMutedPlayerSrc(iframe);
  }
  if (!next) return false;

  try {
    if (iframe.src !== next) {
      iframe.src = next;
    }
    postLiveIframeAudio(iframe, action);
    return true;
  } catch {
    return false;
  }
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
