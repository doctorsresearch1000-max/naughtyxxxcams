import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import {
  ensureStreamWarming,
  isStreamSlotLoaded,
  peekStreamSlot,
} from "@/lib/feed/feedStreamEngine";

const PRECONNECT_ORIGINS = [
  "https://hybridclient.naiadsystems.com",
  "https://www.streamate.com",
  "https://streamate.com",
  "https://www.streamateaccess.com",
] as const;

const pinnedWarmKeys = new Set<string>();
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

export function peekWarmStream(feedKey: string): boolean {
  return peekStreamSlot(feedKey);
}

export function warmPerformerStream(
  feedKey: string,
  embedPlan: PerformerEmbedPlan,
  options?: { pin?: boolean },
): void {
  if (typeof document === "undefined") return;

  const src = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;
  if (!embedPlan.canMountInteractivePlayer || !src) return;

  injectStreamPreconnects();
  ensureStreamWarming(feedKey, src);
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
  if (!peekStreamSlot(feedKey)) return null;
  pinnedWarmKeys.delete(feedKey);
  const iframe = document.querySelector(
    `iframe[data-nx-stream-slot="${CSS.escape(feedKey)}"]`,
  ) as HTMLIFrameElement | null;
  if (!iframe) return null;
  return { iframe, loaded: isStreamSlotLoaded(feedKey) };
}
