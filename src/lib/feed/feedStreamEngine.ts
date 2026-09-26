import { WIDGET_IFRAME_ALLOW } from "@/lib/feed/embedFrame";
import {
  applyStreamIframeStagePresentation,
  clearStreamIframeDockStyles,
} from "@/lib/feed/feedStreamPresentation";
import {
  postLiveIframeAudio,
  setFeedEmbedIframeAudible,
} from "@/lib/feed/liveIframeAudio";
import { injectStreamPreconnects } from "@/lib/feed/streamEmbedWarmup";

type StreamSlot = {
  feedKey: string;
  src: string;
  iframe: HTMLIFrameElement;
  loaded: boolean;
  docked: boolean;
};

const slots = new Map<string, StreamSlot>();

const FEED_EMBED_SELECTOR = 'iframe[data-naughty-feed-embed="true"]';

/** Defer pruning until the incoming active slide owns the stage (avoids claim/prune races). */
const PRUNE_HANDOFF_MAX_MS = 10_000;

let deferredKeepSet: ReadonlySet<string> | null = null;
let handoffActiveFeedKey: string | null = null;
let handoffPruneTimer: ReturnType<typeof setTimeout> | null = null;

function clearHandoffPruneTimer(): void {
  if (handoffPruneTimer !== null) {
    clearTimeout(handoffPruneTimer);
    handoffPruneTimer = null;
  }
}

function runDeferredPrune(): void {
  if (!deferredKeepSet) return;
  const keep = deferredKeepSet;
  deferredKeepSet = null;
  handoffActiveFeedKey = null;
  clearHandoffPruneTimer();
  pruneStreamSlotsImmediate(keep);
}

function scheduleHandoffPruneFallback(): void {
  clearHandoffPruneTimer();
  handoffPruneTimer = setTimeout(() => {
    runDeferredPrune();
  }, PRUNE_HANDOFF_MAX_MS);
}

/**
 * Active slide attached an iframe to its stage (claimed or created).
 * Safe to prune slots outside the current N / N+1 window.
 */
export function confirmActiveStreamStageReady(feedKey: string): void {
  if (!deferredKeepSet) return;
  if (handoffActiveFeedKey && handoffActiveFeedKey !== feedKey) return;
  runDeferredPrune();
}

export function cancelDeferredStreamPrune(): void {
  deferredKeepSet = null;
  handoffActiveFeedKey = null;
  clearHandoffPruneTimer();
}

/** Off-screen dock — no visible strip at the viewport bottom (prevents video leak under nav). */
const DOCK_STYLE: Partial<CSSStyleDeclaration> = {
  position: "fixed",
  left: "-9999px",
  top: "0",
  width: "4px",
  height: "4px",
  maxHeight: "4px",
  margin: "0",
  padding: "0",
  border: "0",
  opacity: "0",
  visibility: "hidden",
  pointerEvents: "none",
  zIndex: "-1",
  clipPath: "none",
  transform: "translateZ(0)",
  background: "transparent",
};

export function destroyFeedEmbedIframe(iframe: HTMLIFrameElement): void {
  try {
    iframe.src = "about:blank";
    iframe.removeAttribute("src");
    iframe.remove();
  } catch {
    /* ignore */
  }
}

function resolveIframeFeedKey(iframe: HTMLIFrameElement): string | null {
  const docked = iframe.getAttribute("data-feed-key-docked");
  if (docked) return docked;
  const slotKey = iframe.getAttribute("data-nx-stream-slot");
  if (slotKey) return slotKey;
  const card = iframe.closest("[data-feed-key]");
  return card?.getAttribute("data-feed-key") ?? null;
}

function purgeOrphanFeedEmbeds(keepFeedKeys: ReadonlySet<string>): void {
  if (typeof document === "undefined") return;

  for (const iframe of document.querySelectorAll(FEED_EMBED_SELECTOR)) {
    if (!(iframe instanceof HTMLIFrameElement)) continue;
    const key = resolveIframeFeedKey(iframe);
    if (key && keepFeedKeys.has(key)) continue;
    destroyFeedEmbedIframe(iframe);
    if (key) {
      slots.delete(key);
    }
  }
}

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
  slot.iframe.setAttribute("data-feed-key-docked", slot.feedKey);
  slot.docked = true;
}

function evictSlot(feedKey: string): void {
  const slot = slots.get(feedKey);
  if (!slot) return;
  destroyFeedEmbedIframe(slot.iframe);
  slots.delete(feedKey);
}

export function isStreamSlotLoaded(feedKey: string): boolean {
  return slots.get(feedKey)?.loaded ?? false;
}

export function peekStreamSlot(feedKey: string): boolean {
  return slots.has(feedKey);
}

/** In-card iframe (slide 0 or before first dock) — enables release → dock on scroll. */
export function adoptInCardStreamSlot(
  feedKey: string,
  src: string,
  iframe: HTMLIFrameElement,
  loaded: boolean,
): void {
  const existing = slots.get(feedKey);
  if (existing && existing.iframe === iframe) {
    existing.loaded = loaded || existing.loaded;
    existing.docked = false;
    return;
  }
  slots.set(feedKey, {
    feedKey,
    src,
    iframe,
    loaded,
    docked: false,
  });
}

/** Prefetch-only (N+1). Do not warm the active slide in the dock. */
export function ensureStreamWarming(feedKey: string, src: string): void {
  if (typeof document === "undefined" || !feedKey || !src) return;

  const existing = slots.get(feedKey);
  if (existing) {
    if (existing.src !== src) {
      evictSlot(feedKey);
    } else if (existing.docked) {
      return;
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
  slot.iframe.removeAttribute("data-feed-key-docked");
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

function pruneStreamSlotsImmediate(keepFeedKeys: ReadonlySet<string>): void {
  for (const key of [...slots.keys()]) {
    if (!keepFeedKeys.has(key)) {
      evictSlot(key);
    }
  }
  purgeOrphanFeedEmbeds(keepFeedKeys);
}

/** Immediate prune (tear-down, tests). Swipe handoff uses deferred prune via sync. */
export function pruneStreamSlots(keepFeedKeys: ReadonlySet<string>): void {
  pruneStreamSlotsImmediate(keepFeedKeys);
}

export function silenceAllStreamSlots(exceptFeedKey?: string): void {
  for (const [key, slot] of slots.entries()) {
    if (exceptFeedKey && key === exceptFeedKey) continue;
    setFeedEmbedIframeAudible(slot.iframe, false, undefined, "hard");
  }
}

/** Remove body-level prefetch iframes when leaving home (prevents route overlay). */
export function tearDownAllStreamSlots(): void {
  cancelDeferredStreamPrune();
  const empty = new Set<string>();
  for (const key of [...slots.keys()]) {
    evictSlot(key);
  }
  purgeOrphanFeedEmbeds(empty);
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

/** Retain only active (N) and next (N+1) stream embeds. */
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

  handoffActiveFeedKey = active?.feedKey ?? null;
  deferredKeepSet = keep;
  scheduleHandoffPruneFallback();
}
