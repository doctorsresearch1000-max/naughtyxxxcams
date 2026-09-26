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

/** When in-place SM_UNMUTE fails, navigate to `playerSrcUnmuted` (legacy cf46eda path). */
const UNMUTE_SRC_FALLBACK_MS = 600;

export type FeedEmbedAudiblePolicy = "gesture" | "hard";

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
  const escaped = CSS.escape(feedKey);
  const docked =
    (document.querySelector(
      `iframe[data-nx-stream-slot="${escaped}"]`,
    ) as HTMLIFrameElement | null) ??
    (document.querySelector(
      `iframe[data-feed-key-docked="${escaped}"][data-naughty-feed-embed="true"]`,
    ) as HTMLIFrameElement | null);
  if (docked) return docked;
  return document.querySelector(
    `[data-feed-key="${escaped}"] iframe[data-naughty-feed-embed="true"]`,
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

function canonicalFeedEmbedSrc(
  raw: string,
  wantSound: boolean,
): string | null {
  try {
    return withFeedAudioParams(raw, wantSound);
  } catch {
    return null;
  }
}

function readEmbedUrlAudioFlags(raw: string): {
  muted: boolean | null;
  volumelevel: boolean | null;
} {
  try {
    const url = new URL(raw);
    const mutedParam = url.searchParams.get("muted");
    let muted: boolean | null = null;
    if (mutedParam === "0" || mutedParam === "false") muted = false;
    if (mutedParam === "1" || mutedParam === "true") muted = true;

    const volParam = url.searchParams.get("volumelevel");
    let volumelevel: boolean | null = null;
    if (volParam === "0") volumelevel = false;
    if (volParam === "1") volumelevel = true;

    return { muted, volumelevel };
  } catch {
    return { muted: null, volumelevel: null };
  }
}

/** True when the live iframe is on the unmuted player entry (audible configuration). */
function feedEmbedIsAudibleInPlace(
  current: string,
  embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
  iframe?: HTMLIFrameElement,
): boolean {
  const unmutedTarget = embedPlan?.playerSrcUnmuted
    ? embedPlan.playerSrcUnmuted
    : iframe
      ? resolveEmbedSrc(iframe, true, embedPlan)
      : null;
  if (!unmutedTarget) return false;

  if (current === unmutedTarget) return true;

  const flags = readEmbedUrlAudioFlags(current);
  if (flags.muted === false || flags.volumelevel === true) return true;

  const canonCurrent = canonicalFeedEmbedSrc(current, true);
  const canonUnmuted = canonicalFeedEmbedSrc(unmutedTarget, true);
  if (canonCurrent && canonUnmuted && canonCurrent === canonUnmuted) {
    if (flags.muted === true || flags.volumelevel === false) return false;
  }

  return false;
}

/** True when the iframe is already on the muted player URL (no navigation needed). */
export function feedEmbedIsMutedInPlace(
  iframe: HTMLIFrameElement,
  embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
): boolean {
  const mutedTarget = resolveEmbedSrc(iframe, false, embedPlan);
  if (!mutedTarget) return false;
  const current =
    iframe.getAttribute("src")?.trim() || iframe.src?.trim() || "";
  if (!current) return false;

  if (feedEmbedIsAudibleInPlace(current, embedPlan, iframe)) {
    return false;
  }

  const canonTarget = canonicalFeedEmbedSrc(mutedTarget, false);
  const canonCurrent = canonicalFeedEmbedSrc(current, false);
  if (canonTarget && canonCurrent) return canonTarget === canonCurrent;
  return current === mutedTarget;
}

/** Naiad Pure client listens for `{ name: "SM_MUTE" | "SM_UNMUTE" }`. */
export function postPurePlayerMuteState(
  iframe: HTMLIFrameElement | null,
  muted: boolean,
): void {
  if (!iframe?.contentWindow) return;
  try {
    iframe.contentWindow.postMessage(
      { name: muted ? "SM_MUTE" : "SM_UNMUTE" },
      "*",
    );
  } catch {
    /* cross-origin */
  }
}

function muteEmbedInPlace(
  iframe: HTMLIFrameElement,
  action: FeedAudioAction = "session-audio-mute",
): void {
  postPurePlayerMuteState(iframe, true);
  postLiveIframeAudio(iframe, action);
}

function unmuteEmbedInPlace(iframe: HTMLIFrameElement): void {
  postPurePlayerMuteState(iframe, false);
  postLiveIframeAudio(iframe, "session-audio-unlock");
}

/**
 * Mute via postMessage only — no `iframe.src` navigation (user toggle + active slide).
 */
export function ensureFeedEmbedMutedInPlace(
  iframe: HTMLIFrameElement | null,
  embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
): boolean {
  if (!iframe) return false;
  const current =
    iframe.getAttribute("src")?.trim() || iframe.src?.trim() || "";
  if (!current || current === "about:blank") {
    return false;
  }
  muteEmbedInPlace(iframe);
  return true;
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
    setFeedEmbedIframeAudible(iframe, false, undefined, "hard");
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
  return setFeedEmbedIframeAudible(iframe, wantSound, embedPlan, "gesture");
}

function hardNavigateEmbedAudible(
  iframe: HTMLIFrameElement,
  wantSound: boolean,
  embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
): boolean {
  const action: FeedAudioAction = wantSound
    ? "session-audio-unlock"
    : "session-audio-mute";

  let next = resolveEmbedSrc(iframe, wantSound, embedPlan);
  if (!next && !wantSound) {
    next = forceMutedPlayerSrc(iframe);
  }
  if (!next) return false;

  const current =
    iframe.getAttribute("src")?.trim() || iframe.src?.trim() || "";

  if (wantSound) {
    if (iframe.src !== next) {
      iframe.src = next;
    }
  } else if (feedEmbedIsAudibleInPlace(current, embedPlan, iframe)) {
    iframe.src = next;
  } else {
    const canonNext = canonicalFeedEmbedSrc(next, false);
    const canonCurrent = current ? canonicalFeedEmbedSrc(current, false) : null;
    const sameSrc =
      (canonNext && canonCurrent && canonNext === canonCurrent) ||
      current === next;
    if (!sameSrc) {
      iframe.src = next;
    }
  }

  postLiveIframeAudio(iframe, action);
  postPurePlayerMuteState(iframe, !wantSound);
  return true;
}

export function setFeedEmbedIframeAudible(
  iframe: HTMLIFrameElement | null,
  wantSound: boolean,
  embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
  policy: FeedEmbedAudiblePolicy = "gesture",
): boolean {
  if (!iframe) return false;

  if (policy === "hard") {
    try {
      return hardNavigateEmbedAudible(iframe, wantSound, embedPlan);
    } catch {
      return false;
    }
  }

  try {
    if (!wantSound) {
      // Phase 1: user mute — never reload the player document.
      muteEmbedInPlace(iframe);
      return true;
    }

    // Phase 2: try in-place unmute first (same document / muted entry URL).
    unmuteEmbedInPlace(iframe);

    const next = resolveEmbedSrc(iframe, true, embedPlan);
    if (!next) return false;

    const current =
      iframe.getAttribute("src")?.trim() || iframe.src?.trim() || "";
    if (
      current === next ||
      feedEmbedIsAudibleInPlace(current, embedPlan, iframe)
    ) {
      return true;
    }

    const unmutedTarget = next;
    window.setTimeout(() => {
      if (!iframe.isConnected) return;
      const cur =
        iframe.getAttribute("src")?.trim() || iframe.src?.trim() || "";
      if (feedEmbedIsAudibleInPlace(cur, embedPlan, iframe)) {
        return;
      }
      if (iframe.src !== unmutedTarget) {
        iframe.src = unmutedTarget;
      }
      postLiveIframeAudio(iframe, "session-audio-unlock");
      postPurePlayerMuteState(iframe, false);
    }, UNMUTE_SRC_FALLBACK_MS);

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
