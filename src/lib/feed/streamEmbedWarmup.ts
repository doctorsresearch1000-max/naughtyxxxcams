import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import { WIDGET_IFRAME_ALLOW } from "@/lib/feed/embedFrame";

const PRECONNECT_ORIGINS = [
  "https://hybridclient.naiadsystems.com",
  "https://www.streamate.com",
  "https://streamate.com",
  "https://www.streamateaccess.com",
] as const;

type WarmEntry = {
  iframe: HTMLIFrameElement;
  loaded: boolean;
  src: string;
};

const warmPool = new Map<string, WarmEntry>();
const MAX_WARM_POOL = 5;
let preconnectInjected = false;

export function injectStreamPreconnects(): void {
  if (typeof document === "undefined" || preconnectInjected) return;
  preconnectInjected = true;

  for (const href of PRECONNECT_ORIGINS) {
    if (document.querySelector(`link[data-nx-preconnect="${href}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = href;
    link.crossOrigin = "anonymous";
    link.setAttribute("data-nx-preconnect", href);
    document.head.appendChild(link);

    const dns = document.createElement("link");
    dns.rel = "dns-prefetch";
    dns.href = href;
    document.head.appendChild(dns);
  }
}

function evictOldestWarmEntry(): void {
  for (const key of warmPool.keys()) {
    if (pinnedWarmKeys.has(key)) continue;
    const entry = warmPool.get(key);
    entry?.iframe.remove();
    warmPool.delete(key);
    return;
  }
}

export function peekWarmStream(feedKey: string): boolean {
  return warmPool.has(feedKey);
}

/** Pin warm iframe for LCP slide — not evicted by the LRU pool cap. */
const pinnedWarmKeys = new Set<string>();

export function warmPerformerStream(
  feedKey: string,
  embedPlan: PerformerEmbedPlan,
  options?: { pin?: boolean },
): void {
  if (typeof document === "undefined") return;

  const src = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;
  if (!embedPlan.canMountInteractivePlayer || !src) return;

  injectStreamPreconnects();

  const existing = warmPool.get(feedKey);
  if (existing?.src === src) return;

  if (existing) {
    existing.iframe.remove();
    warmPool.delete(feedKey);
  }

  while (warmPool.size >= MAX_WARM_POOL) {
    evictOldestWarmEntry();
  }

  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = `Warm stream ${feedKey}`;
  iframe.allow = WIDGET_IFRAME_ALLOW;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.setAttribute("data-nx-warm-stream", feedKey);
  iframe.style.cssText =
    "position:fixed;width:1px;height:1px;left:0;top:0;opacity:0.001;pointer-events:none;border:0;z-index:-1";

  const entry: WarmEntry = { iframe, loaded: false, src };
  iframe.addEventListener(
    "load",
    () => {
      entry.loaded = true;
    },
    { once: true },
  );

  document.body.appendChild(iframe);
  warmPool.set(feedKey, entry);
  if (options?.pin) {
    pinnedWarmKeys.add(feedKey);
  }
}

export type ClaimedWarmIframe = {
  iframe: HTMLIFrameElement;
  loaded: boolean;
};

export function claimWarmStreamIframe(
  feedKey: string,
): ClaimedWarmIframe | null {
  const entry = warmPool.get(feedKey);
  if (!entry) return null;
  pinnedWarmKeys.delete(feedKey);
  warmPool.delete(feedKey);
  entry.iframe.removeAttribute("data-nx-warm-stream");
  return { iframe: entry.iframe, loaded: entry.loaded };
}
