import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  isIndexableProfileHandlePath,
  PROFILE_PAGE_CACHE_CONTROL,
} from "@/lib/http/profilePageCache";

/** Lets RSC skip heavy home catalog fetch on non-home routes (Worker CPU). */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nx-pathname", pathname);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (request.method === "GET" && isIndexableProfileHandlePath(pathname)) {
    response.headers.set("Cache-Control", PROFILE_PAGE_CACHE_CONTROL);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|webp|svg|ico)$).*)",
  ],
};
