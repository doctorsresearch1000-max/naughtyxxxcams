import { WIDGET_IFRAME_ALLOW } from "@/lib/feed/embedFrame";
import {
  applyStreamIframeStagePresentation,
  clearStreamIframeDockStyles,
} from "@/lib/feed/feedStreamPresentation";
import { postLiveIframeAudio } from "@/lib/feed/liveIframeAudio";
import { injectStreamPreconnects } from "@/lib/feed/streamEmbedWarmup";

type StreamSlot = {
  feedKey: string;
  src: string;
  iframe: HTMLIFrameElement;
  loaded: boolean;
  docked: boolean;
};

const slots = new Map<string, StreamSlot>();

/** Viewport dock — opaque with a 4px strip (avoids background media throttle). */
const DOCK_STYLE: Partial<CSSStyleDeclaration> = {
  position: "fixed",
  left: "0",
  bottom: "0",
  width: "100vw",
  height: "100dvh",
  maxHeight: "100dvh",
  margin: "0",
  padding: "0",
  border: "0",
  opacity: "1",
  visibility: "visible",
  pointerEvents: "none",
  zIndex: "1",
  clipPath: "inset(calc(100% - 4px) 0 0 0)",
  transform: "translateZ(0)",
  background: "#000",
};

function createSlot(feedKey: string, src: string): StreamSlot {
  injectStreamPreconnects();
  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = `Stream ${feedKey}`;
  iframe.allow = WIDGET_IFRAME_ALLOW;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.setAttribute("loading", "eager");
  iframe.setAttribute("data-nx-stream-slot", feedKey);
  iframe.setAttribute("data-naughty-feed-embed", "true");

  const slot: StreamSlot = {
    feedKey,
    src,
    iframe,
    loaded: false,
    docked: false,
  };

  iframe.addEventListener(
    "load",
    () => {
      slot.loaded = true;
    },
    { once: true },
  );

  return slot;
}

function dockSlot(slot: StreamSlot): void {
  postLiveIframeAudio(slot.iframe, "session-audio-mute");
  clearStreamIframeDockStyles(slot.iframe);
  Object.assign(slot.iframe.style, DOCK_STYLE);
  slot.iframe.className = "feed-embed-iframe feed-embed-iframe--docked";
  if (slot.iframe.parentElement && slot.iframe.parentElement !== document.body) {
    slot.iframe.remove();
  }
  if (!document.body.contains(slot.iframe)) {
    document.body.appendChild(slot.iframe);
  }
  slot.docked = true;
}

function evictSlot(feedKey: string): void {
  const slot = slots.get(feedKey);
  if (!slot) return;
  try {
    slot.iframe.src = "";
    slot.iframe.remove();
  } catch {
    /* ignore */
  }
  slots.delete(feedKey);
}

export function isStreamSlotLoaded(feedKey: string): boolean {
  return slots.get(feedKey)?.loaded ?? false;
}

export function peekStreamSlot(feedKey: string): boolean {
  return slots.has(feedKey);
}

/** Prefetch-only (N±1). Do not warm the active slide in the dock. */
export function ensureStreamWarming(feedKey: string, src: string): void {
  if (typeof document === "undefined" || !feedKey || !src) return;

  const existing = slots.get(feedKey);
  if (existing) {
    if (existing.src !== src) {
      evictSlot(feedKey);
    } else {
      return;
    }
  }

  const slot = createSlot(feedKey, src);
  slots.set(feedKey, slot);
  dockSlot(slot);
}

export type ClaimedStreamSlot = {
  iframe: HTMLIFrameElement;
  loaded: boolean;
};

export function claimStreamForStage(
  feedKey: string,
  stage: HTMLElement,
  applyLayout: (iframe: HTMLIFrameElement) => void,
): ClaimedStreamSlot | null {
  const slot = slots.get(feedKey);
  if (!slot) return null;

  slot.docked = false;
  clearStreamIframeDockStyles(slot.iframe);
  if (slot.iframe.parentElement !== stage) {
    stage.appendChild(slot.iframe);
  }
  void stage.offsetHeight;
  applyLayout(slot.iframe);
  return { iframe: slot.iframe, loaded: slot.loaded };
}

export function refreshStreamStageLayout(
  feedKey: string,
  slideHeightPx: number,
  isActive: boolean,
): void {
  const slot = slots.get(feedKey);
  if (!slot || slot.docked) return;
  applyStreamIframeStagePresentation(slot.iframe, slideHeightPx, isActive);
}

export function releaseStreamSlot(feedKey: string, keepAlive: boolean): void {
  const slot = slots.get(feedKey);
  if (!slot) return;

  if (keepAlive) {
    dockSlot(slot);
    return;
  }

  evictSlot(feedKey);
}

export function pruneStreamSlots(keepFeedKeys: ReadonlySet<string>): void {
  for (const key of slots.keys()) {
    if (!keepFeedKeys.has(key)) {
      evictSlot(key);
    }
  }
}

export function silenceAllStreamSlots(exceptFeedKey?: string): void {
  for (const [key, slot] of slots.entries()) {
    if (exceptFeedKey && key === exceptFeedKey) continue;
    postLiveIframeAudio(slot.iframe, "session-audio-mute");
  }
}

function performerSrc(performer: {
  feedKey: string;
  embedPlan: {
    playerSrcMuted?: string | null;
    outerEmbedSrc?: string | null;
    canMountInteractivePlayer: boolean;
  };
}): string | null {
  if (!performer.embedPlan.canMountInteractivePlayer) return null;
  return (
    performer.embedPlan.playerSrcMuted ??
    performer.embedPlan.outerEmbedSrc ??
    null
  );
}

export function syncFeedStreamNeighbors(
  slides: Array<{
    feedKey: string;
    embedPlan: {
      playerSrcMuted?: string | null;
      outerEmbedSrc?: string | null;
      canMountInteractivePlayer: boolean;
    };
  }>,
  activeIndex: number,
): void {
  const keep = new Set<string>();

  const active = slides[activeIndex];
  if (active) keep.add(active.feedKey);

  const prefetch = slides[activeIndex + 1];
  const prefetchSrc = prefetch ? performerSrc(prefetch) : null;
  if (prefetch && prefetchSrc) {
    keep.add(prefetch.feedKey);
    ensureStreamWarming(prefetch.feedKey, prefetchSrc);
  }

  const retain = slides[activeIndex - 1];
  const retainSrc = retain ? performerSrc(retain) : null;
  if (retain && retainSrc) {
    keep.add(retain.feedKey);
    ensureStreamWarming(retain.feedKey, retainSrc);
  }

  pruneStreamSlots(keep);
}
