import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";

/** Build an absolute URL on the site apex for HTTP 301 redirects. */
export function absoluteSiteUrl(path: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function movedPermanently(
  pathOrUrl: string,
  headers?: HeadersInit,
): NextResponse {
  const target = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : absoluteSiteUrl(pathOrUrl);
  return NextResponse.redirect(target, {
    status: 301,
    headers,
  });
}
