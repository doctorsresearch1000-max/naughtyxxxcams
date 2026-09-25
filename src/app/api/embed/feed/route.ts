import {
  isAllowedIframeFeedHost,
  normalizeApiIframeFeedUrl,
} from "@/lib/feed/performerEmbed";
import { buildStreamEmbedSrcDoc } from "@/lib/feed/embedShell";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instance = searchParams.get("instance") ?? "default";
  const rawUrl = searchParams.get("u")?.trim() ?? "";
  const room = searchParams.get("room")?.trim() ?? "";
  const mutedParam = searchParams.get("muted");
  const muted =
    mutedParam === "0" || mutedParam === "false" ? 0 : 1;

  if (!rawUrl || !isAllowedIframeFeedHost(rawUrl)) {
    return new Response("Invalid feed URL", { status: 400 });
  }

  const innerSrc = normalizeApiIframeFeedUrl(rawUrl);
  const html = buildStreamEmbedSrcDoc(innerSrc, {
    embedInstanceId: instance,
    widgetMuted: muted,
    roomAffiliateUrl: room || undefined,
    blockAffiliateNavigation: true,
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
      "Permissions-Policy": "autoplay=(self), encrypted-media=(self)",
    },
  });
}
