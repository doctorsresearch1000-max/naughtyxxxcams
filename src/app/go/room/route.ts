import { NextResponse } from "next/server";
import { verifyAndConsumeGoToken } from "@/lib/go/goToken";
import {
  profilePathForGoTarget,
  resolveGoAffiliateUrl,
} from "@/lib/go/resolveGoAffiliateUrl";

export const dynamic = "force-dynamic";

const NOINDEX_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store, max-age=0",
};

function redirectToProfile(request: Request, path: string): NextResponse {
  const url = new URL(path, request.url);
  const response = NextResponse.redirect(url, 302);
  for (const [key, value] of Object.entries(NOINDEX_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("t") ?? searchParams.get("token") ?? "";

  const verified = token ? verifyAndConsumeGoToken(token) : null;
  if (!verified) {
    const slug = searchParams.get("slug");
    const fallbackPath = slug
      ? `/profile/${slug}`
      : profilePathForGoTarget({ kind: "promo", promo: "jerkmate-global" });
    console.warn("[go/room] invalid_or_missing_token", {
      hasToken: Boolean(token),
      fallbackPath,
    });
    return redirectToProfile(request, fallbackPath);
  }

  const outbound = await resolveGoAffiliateUrl(verified.target);
  if (!outbound) {
    return redirectToProfile(
      request,
      profilePathForGoTarget(verified.target),
    );
  }

  const response = NextResponse.redirect(outbound, 302);
  for (const [key, value] of Object.entries(NOINDEX_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}
