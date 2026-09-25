/**
 * Cross-origin Crak players only unlock audio when navigation/play is tied to a
 * real user gesture. Parent-page postMessage cannot substitute that.
 * We reload the direct player iframe `src` synchronously inside pointerdown handlers.
 */

import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";

export const FEED_AUDIO_SOURCE = "naughty-feed";

const ACTIVE_IFRAME_SELECTOR =
  '[data-feed-card-root][data-feed-active="1"] iframe[data-naughty-feed-embed="true"]';

const ALL_FEED_IFRAMES_SELECTOR = 'iframe[data-naughty-feed-embed="true"]';

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

export function setFeedEmbedIframeAudible(
  iframe: HTMLIFrameElement | null,
  wantSound: boolean,
  embedPlan?: Pick<
    PerformerEmbedPlan,
    "playerSrcMuted" | "playerSrcUnmuted"
  > | null,
): boolean {
  if (!iframe) return false;
  const next = resolveEmbedSrc(iframe, wantSound, embedPlan);
  if (!next) return false;

  try {
    if (iframe.src !== next) {
      iframe.src = next;
    }
    return true;
  } catch {
    return false;
  }
}

export function getActiveFeedPlayerIframe(): HTMLIFrameElement | null {
  return document.querySelector(
    ACTIVE_IFRAME_SELECTOR,
  ) as HTMLIFrameElement | null;
}

/** Force every mounted feed player back to muted `src` (stops scroll overlap). */
export function muteAllFeedEmbedIframes(): void {
  const nodes = document.querySelectorAll(ALL_FEED_IFRAMES_SELECTOR);
  nodes.forEach((node) => {
    setFeedEmbedIframeAudible(node as HTMLIFrameElement, false);
  });
}

/** Mute prefetch / inactive cards without reloading the active player `src`. */
export function muteInactiveFeedEmbedIframes(): void {
  const active = getActiveFeedPlayerIframe();
  const nodes = document.querySelectorAll(ALL_FEED_IFRAMES_SELECTOR);
  nodes.forEach((node) => {
    if (node === active) return;
    setFeedEmbedIframeAudible(node as HTMLIFrameElement, false);
  });
}

/**
 * Gesture-initiated player navigation (must run synchronously in pointerdown/click).
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

/** @deprecated Cross-origin feeds ignore parent postMessage for audio. */
export function setFeedCardAudio(wantSound: boolean, gesture: boolean): void {
  if (!gesture) return;
  resumeBrowserAudioContext();
  applyDirectPlayerAudioFromGesture(wantSound);
}

/** @deprecated No-op — pointer events are managed on each LiveEmbed iframe. */
export function setActiveFeedIframePointerEvents(): void {}

export function getActiveFeedAudioTarget(): null {
  return null;
}

/** @deprecated No-op — direct cross-origin embed per card. */
export function registerActiveFeedAudioTarget(): void {}

/** @deprecated No-op — use setFeedEmbedIframeAudible / applyDirectPlayerAudioFromGesture. */
export function postLiveIframeAudio(): void {}
