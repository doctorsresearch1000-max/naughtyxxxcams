import { handlePlayerLegacyRoute } from "@/lib/seo/playerRouteRedirect";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return handlePlayerLegacyRoute(request, id);
}

export async function HEAD(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return handlePlayerLegacyRoute(request, id);
}
