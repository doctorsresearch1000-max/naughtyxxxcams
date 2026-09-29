import { getPerformerKey } from "@/lib/crackrevenue/api";
import { findPerformerByProfileSlug } from "@/lib/crackrevenue/performerLookup";
import { performerProfileSlug } from "@/lib/profile/performerHandle";
import { resolvePerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import { pickNativeIframeFeedUrl } from "@/lib/feed/nativeIframeFeed";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug: raw } = await context.params;
  const slug = performerProfileSlug(raw);
  if (!slug) {
    return Response.json({ error: "invalid_slug" }, { status: 400 });
  }

  const t0 = Date.now();
  const performer = await findPerformerByProfileSlug(slug, { fresh: true });
  const ms = Date.now() - t0;

  if (!performer) {
    return Response.json(
      { status: "offline" as const, performer: null, ms, embedMode: null },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const feedKey = getPerformerKey(performer);
  const embedPlan = resolvePerformerEmbedPlan(performer, feedKey);
  const nativeIframe = pickNativeIframeFeedUrl(performer);
  const rawIframe = performer.iframeFeedURL?.trim() ?? "";

  if (!nativeIframe || !embedPlan.playerSrcMuted) {
    console.warn("[profile-live]", {
      slug,
      ms,
      live: performer.live,
      rawIframe: rawIframe.slice(0, 160),
      nativeIframe: nativeIframe?.slice(0, 160) ?? null,
      embedMode: embedPlan.mode,
      canMount: embedPlan.canMountInteractivePlayer,
    });
  }

  return Response.json(
    {
      status: performer.live === false ? "offline" : "live",
      performer,
      ms,
      embedMode: embedPlan.mode,
      canMountInteractivePlayer: embedPlan.canMountInteractivePlayer,
      hasNativeIframe: Boolean(nativeIframe),
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
