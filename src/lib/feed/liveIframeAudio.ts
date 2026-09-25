/**
 * Cross-origin Crak players only unlock audio when navigation/play is tied to a
 * real user gesture. Parent-page postMessage cannot substitute that.
 * We reload the direct player iframe `src` synchronously inside pointerdown handlers.
 */

import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";

export const FEED_AUDIO_SOURCE = "naughty-feed";

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

function getActivePlayerIframe(): HTMLIFrameElement | null {
  return document.querySelector(
    '[data-feed-card-root][data-stream-revealed="1"] iframe[data-naughty-feed-embed="true"]',
  ) as HTMLIFrameElement | null;
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
  const iframe = getActivePlayerIframe();
  if (!iframe) return false;

  const mutedSrc =
    embedPlan?.playerSrcMuted ??
    iframe.getAttribute("data-player-src-muted") ??
    "";
  const unmutedSrc =
    embedPlan?.playerSrcUnmuted ??
    iframe.getAttribute("data-player-src-unmuted") ??
    "";

  const next = wantSound ? unmutedSrc : mutedSrc;
  if (!next) return false;

  try {
    if (iframe.src !== next) {
      iframe.src = next;
    }
    iframe.style.pointerEvents = "auto";
    return true;
  } catch {
    return false;
  }
}

/** @deprecated Cross-origin feeds ignore parent postMessage for audio. */
export function setFeedCardAudio(wantSound: boolean, gesture: boolean): void {
  if (!gesture) return;
  resumeBrowserAudioContext();
  applyDirectPlayerAudioFromGesture(wantSound);
}

export function setActiveFeedIframePointerEvents(enabled: boolean): void {
  const iframe = getActivePlayerIframe();
  if (!iframe) return;
  iframe.style.pointerEvents = enabled ? "auto" : "auto";
}

export function getActiveFeedAudioTarget(): null {
  return null;
}

export function registerActiveFeedAudioTarget(_target?: unknown): void {
  /* no-op: direct cross-origin embed */
}

export function postLiveIframeAudio(
  _wantSound?: boolean,
  _options?: { force?: boolean },
): void {
  /* no-op */
}
