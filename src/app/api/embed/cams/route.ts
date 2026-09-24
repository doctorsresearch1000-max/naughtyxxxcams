import {
  buildWidgetScriptSrc,
  buildWidgetSrcDoc,
} from "@/lib/feed/widgetSrcDoc";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instance = searchParams.get("instance") ?? "default";

  const scriptSrc = buildWidgetScriptSrc({
    cols: Number(searchParams.get("cols")) || 1,
    rows: Number(searchParams.get("rows")) || 1,
    number: Number(searchParams.get("number")) || 1,
    ratio: Number(searchParams.get("ratio")) || 0.5625,
    useFeed: Number(searchParams.get("useFeed")) || 0,
    animateFeed: Number(searchParams.get("animateFeed")) || 0,
    smoothAnimation: Number(searchParams.get("smoothAnimation")) || 0,
    embedInstanceId: instance,
  });

  const html = buildWidgetSrcDoc(scriptSrc, {
    blockAffiliateNavigation: true,
    enableAutoplayKickstart: true,
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
