import { NextResponse } from "next/server";
import { resolvePlayerRouteRedirect } from "@/lib/seo/playerRouteRedirect";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const target = await resolvePlayerRouteRedirect(id);
  if (!target) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const destination = new URL(target.path, request.url);
  const response = NextResponse.redirect(destination, 301);
  response.headers.set("Link", `<${target.canonicalUrl}>; rel="canonical"`);
  return response;
}

export async function HEAD(request: Request, context: RouteContext) {
  return GET(request, context);
}
