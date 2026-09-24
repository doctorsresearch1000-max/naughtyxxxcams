import {
  CRACKREVENUE_API_KEY,
  CRACKREVENUE_TOKEN,
} from "@/lib/crackrevenue/config";
import {
  buildWidgetFrameSrc,
  buildWidgetSrcDoc,
} from "@/lib/feed/widgetSrcDoc";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instance = searchParams.get("instance") ?? "default";
  const performer =
    searchParams.get("performer") ??
    searchParams.get("performerNameClean") ??
    "";

  const mutedParam = searchParams.get("muted");
  const muted =
    mutedParam === "0" || mutedParam === "false" ? 0 : 1;

  const frameSrc = buildWidgetFrameSrc({
    cols: Number(searchParams.get("cols")) || 1,
    rows: Number(searchParams.get("rows")) || 1,
    number: Number(searchParams.get("number")) || 1,
    ratio: Number(searchParams.get("ratio")) || 0.5625,
    useFeed: Number(searchParams.get("useFeed")) || 0,
    animateFeed: Number(searchParams.get("animateFeed")) || 0,
    smoothAnimation: Number(searchParams.get("smoothAnimation")) || 0,
    embedInstanceId: instance,
    performerNameClean: performer || undefined,
    muted,
  });

  const html = buildWidgetSrcDoc(frameSrc, {
    blockAffiliateNavigation: true,
    embedInstanceId: instance,
  });

  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Frame-Options": "SAMEORIGIN",
    "Permissions-Policy": "autoplay=(self), encrypted-media=(self)",
  };

  if (!CRACKREVENUE_TOKEN || !CRACKREVENUE_API_KEY) {
    headers["X-Embed-Warning"] = "missing-crack-credentials";
  }

  return new Response(html, { headers });
}
