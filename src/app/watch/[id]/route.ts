import { legacyPlayerRouteRedirect } from "@/lib/http/legacyPlayerRoute";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return legacyPlayerRouteRedirect(id);
}

export async function HEAD(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return legacyPlayerRouteRedirect(id);
}
