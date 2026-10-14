import { NextResponse } from "next/server";
import { findPerformerByProfileSlug } from "@/lib/crackrevenue/performerLookup";
import { slugFromPerformer } from "@/lib/crackrevenue/performerCatalog";
import {
  modelPermalinkPath,
  performerProfileSlug,
} from "@/lib/profile/performerHandle";
import { profileCanonicalUrl } from "@/lib/seo/canonical";

export type PlayerRouteRedirectTarget = {
  path: string;
  canonicalUrl: string;
};

function redirectTargetForSlug(slug: string): PlayerRouteRedirectTarget {
  const safe = performerProfileSlug(slug) ?? slug.trim().toLowerCase();
  return {
    path: modelPermalinkPath(safe),
    canonicalUrl: profileCanonicalUrl(safe),
  };
}

/** Normalize legacy `/live/{id}` / `/watch/{id}` param to a canonical profile slug, if possible. */
export function extractSlugFromPlayerRouteParam(raw: string): string | null {
  try {
    return performerProfileSlug(raw);
  } catch {
    return null;
  }
}

/**
 * One-shot API lookup (no catalog scan). Never throws — falls back to param slug.
 */
export async function findPerformerByPublicId(
  id: string,
): Promise<string | null> {
  const slug = extractSlugFromPlayerRouteParam(id);
  if (!slug) return null;

  try {
    const performer = await findPerformerByProfileSlug(slug);
    if (performer) {
      const fromApi = slugFromPerformer(performer);
      if (fromApi) return fromApi;
    }
  } catch {
    /* Crak timeout / network */
  }

  return slug;
}

/**
 * Resolve legacy player deeplink → canonical `/profile/{slug}`.
 * Never throws. Returns null only when the param cannot be formatted as a slug.
 */
export async function resolvePlayerRouteRedirect(
  id: string,
): Promise<PlayerRouteRedirectTarget | null> {
  try {
    const slug = await findPerformerByPublicId(id);
    if (!slug) return null;
    return redirectTargetForSlug(slug);
  } catch {
    const slug = extractSlugFromPlayerRouteParam(id);
    if (!slug) return null;
    return redirectTargetForSlug(slug);
  }
}

export function playerLegacyRouteNotFoundResponse(): NextResponse {
  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

/** Shared GET/HEAD handler for `/live/[id]` and `/watch/[id]`. */
export async function handlePlayerLegacyRoute(
  request: Request,
  id: string,
): Promise<NextResponse> {
  try {
    const target = await resolvePlayerRouteRedirect(id);
    if (!target) {
      return playerLegacyRouteNotFoundResponse();
    }

    const destination = new URL(target.path, request.url);
    const response = NextResponse.redirect(destination, 301);
    response.headers.set("Link", `<${target.canonicalUrl}>; rel="canonical"`);
    response.headers.set("X-Robots-Tag", "noindex, follow");
    return response;
  } catch {
    const slug = extractSlugFromPlayerRouteParam(id);
    if (!slug) {
      return playerLegacyRouteNotFoundResponse();
    }
    const destination = new URL(modelPermalinkPath(slug), request.url);
    const response = NextResponse.redirect(destination, 301);
    response.headers.set(
      "Link",
      `<${profileCanonicalUrl(slug)}>; rel="canonical"`,
    );
    response.headers.set("X-Robots-Tag", "noindex, follow");
    return response;
  }
}
