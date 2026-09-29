import { pickNativeIframeFeedUrl } from "@/lib/feed/nativeIframeFeed";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { resolvePerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import { getPerformerKey } from "@/lib/crackrevenue/api";

/** Client/server-safe log for profile iframe URL pipeline (always on in dev). */
export function logProfileStreamEmbedPipeline(
  slug: string,
  surface: string,
  performer: CrackPerformer | undefined,
  phase: string,
): void {
  if (!performer) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[profile-stream:${surface}] ${phase} slug=${slug} performer=missing`);
    }
    return;
  }

  const rawIframe = performer.iframeFeedURL?.trim() ?? "";
  const native = pickNativeIframeFeedUrl(performer);
  const feedKey = getPerformerKey(performer);
  const plan = resolvePerformerEmbedPlan(performer, feedKey);

  const payload = {
    phase,
    slug,
    surface,
    live: performer.live,
    rawIframeFeedURL: rawIframe ? rawIframe.slice(0, 120) : "",
    nativePick: native ? native.slice(0, 120) : null,
    playerSrcMuted: plan.playerSrcMuted?.slice(0, 120) ?? null,
    embedMode: plan.mode,
    canMount: plan.canMountInteractivePlayer,
  };

  if (process.env.NODE_ENV === "development") {
    console.info("[profile-stream]", payload);
  }

  if (typeof window !== "undefined") {
    try {
      const w = window as Window & { __NX_PROFILE_STREAM_LAST__?: unknown };
      w.__NX_PROFILE_STREAM_LAST__ = payload;
    } catch {
      /* ignore */
    }
  }
}
