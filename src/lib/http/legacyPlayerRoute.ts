import type { Metadata } from "next";
import { profileCanonicalUrl } from "@/lib/seo/canonical";
import { modelPermalinkPath } from "@/lib/seo/modelPermalink";
import { resolvePlayerRouteSlug } from "@/lib/profile/resolvePlayerRouteSlug";
import { movedPermanently } from "@/lib/http/movedPermanently";

export async function legacyPlayerRouteMetadata(
  rawId: string,
): Promise<Metadata> {
  const slug = await resolvePlayerRouteSlug(rawId);
  if (!slug) {
    return {
      robots: { index: false, follow: true },
    };
  }

  const canonical = profileCanonicalUrl(slug);
  return {
    robots: { index: false, follow: true },
    alternates: { canonical },
  };
}

export async function legacyPlayerRouteRedirect(
  rawId: string,
): Promise<Response> {
  const slug = await resolvePlayerRouteSlug(rawId);
  if (!slug) {
    return new Response("Not Found", {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  const path = modelPermalinkPath(slug);
  const canonical = profileCanonicalUrl(slug);
  return movedPermanently(path, {
    "X-Robots-Tag": "noindex, follow",
    Link: `<${canonical}>; rel="canonical"`,
  });
}
