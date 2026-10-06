import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  buildApexRedirectUrl,
  shouldRedirectWwwToApex,
} from "@/lib/http/canonicalHost";
import { getProfileHandleFromPathname } from "@/lib/http/profileHandlePath";
import {
  API_ROUTE_CACHE_CONTROL,
  isPublicProfileHtmlPath,
  PROFILE_NOT_FOUND_CACHE_CONTROL,
  PROFILE_PAGE_CACHE_CONTROL,
} from "@/lib/http/profilePageCache";
import {
  getResolvableProfileSlugIndex,
  isHandleInResolvableProfileIndex,
} from "@/lib/http/resolvableProfileSlugIndex";

const PROFILE_ROUTE_METHODS = new Set(["GET", "HEAD"]);
const READ_METHODS = new Set(["GET", "HEAD"]);

function profileNotFoundResponse(method: string): NextResponse {
  return new NextResponse(method === "HEAD" ? null : "Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": PROFILE_NOT_FOUND_CACHE_CONTROL,
      "CDN-Cache-Control": PROFILE_NOT_FOUND_CACHE_CONTROL,
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

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
 * Canonical host, profile slug 404 guard, cache hints for HTML vs API.
 */
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  if (shouldRedirectWwwToApex(host)) {
    const destination = buildApexRedirectUrl(request.nextUrl);
    return NextResponse.redirect(destination, 308);
  }

  const { pathname } = request.nextUrl;

  const handle = getProfileHandleFromPathname(pathname);
  if (handle && PROFILE_ROUTE_METHODS.has(request.method)) {
    const slugIndex = await getResolvableProfileSlugIndex();
    if (
      slugIndex &&
      !isHandleInResolvableProfileIndex(handle, slugIndex)
    ) {
      return profileNotFoundResponse(request.method);
    }
  }

  return continueRequest(request, pathname);
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/api/:path*",
    "/auth/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|webp|svg|ico)$).*)",
  ],
};
