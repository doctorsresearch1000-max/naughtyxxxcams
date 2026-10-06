import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  buildApexRedirectUrl,
  shouldRedirectWwwToApex,
} from "@/lib/http/canonicalHost";
import {
  API_ROUTE_CACHE_CONTROL,
  isPublicProfileHtmlPath,
  PROFILE_PAGE_CACHE_CONTROL,
} from "@/lib/http/profilePageCache";

const READ_METHODS = new Set(["GET", "HEAD"]);

function continueRequest(
  request: NextRequest,
  pathname: string,
): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nx-pathname", pathname);
  const profileCache =
    READ_METHODS.has(request.method) && isPublicProfileHtmlPath(pathname);
  const apiNoStore =
    pathname.startsWith("/api/") || pathname.startsWith("/auth/");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
    headers: profileCache
      ? {
          "Cache-Control": PROFILE_PAGE_CACHE_CONTROL,
          "CDN-Cache-Control": PROFILE_PAGE_CACHE_CONTROL,
        }
      : apiNoStore
        ? { "Cache-Control": API_ROUTE_CACHE_CONTROL }
        : undefined,
  });

  if (profileCache) {
    response.headers.set("Cache-Control", PROFILE_PAGE_CACHE_CONTROL);
    response.headers.set("CDN-Cache-Control", PROFILE_PAGE_CACHE_CONTROL);
    response.headers.set(
      "x-nx-profile-edge-cache",
      PROFILE_PAGE_CACHE_CONTROL,
    );
  }

  if (apiNoStore) {
    response.headers.set("Cache-Control", API_ROUTE_CACHE_CONTROL);
  }

  return response;
}

/**
 * Edge: canonical host + cache hints only.
 * Profile existence is resolved at request time in RSC (`resolveModelProfile` + `notFound()`).
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  if (shouldRedirectWwwToApex(host)) {
    return NextResponse.redirect(buildApexRedirectUrl(request.nextUrl), 308);
  }

  return continueRequest(request, request.nextUrl.pathname);
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/api/:path*",
    "/auth/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|webp|svg|ico)$).*)",
  ],
};
