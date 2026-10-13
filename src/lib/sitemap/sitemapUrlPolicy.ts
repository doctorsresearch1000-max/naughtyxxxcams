import type { MetadataRoute } from "next";
import { sanitizeModelSlug } from "@/lib/profile/performerHandle";
import { profileCanonicalUrl } from "@/lib/seo/canonical";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";

/** Indexable public profile slug (hyphenated lowercase, no legacy noise). */
export const CANONICAL_PROFILE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const BLOCKED_SITEMAP_PATH =
  /^\/(live|watch)\/|\/profile\/[^/]+\/(vip|leaks)\/?$/i;

export function isPublicIndexableProfileSlug(slug: string): boolean {
  const trimmed = slug.trim();
  if (!trimmed) return false;
  if (trimmed.includes("_")) return false;
  if (trimmed !== trimmed.toLowerCase()) return false;
  const sanitized = sanitizeModelSlug(trimmed);
  if (!sanitized || sanitized !== trimmed) return false;
  return CANONICAL_PROFILE_SLUG_PATTERN.test(sanitized);
}

export function filterCanonicalProfileSlugsForSitemap(slugs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of slugs) {
    const sanitized = sanitizeModelSlug(raw);
    if (!sanitized || !isPublicIndexableProfileSlug(sanitized)) continue;
    if (seen.has(sanitized)) continue;
    seen.add(sanitized);
    out.push(sanitized);
  }

  return out.sort((a, b) => a.localeCompare(b));
}

export function profileSitemapAbsoluteUrl(slug: string): string | null {
  if (!isPublicIndexableProfileSlug(slug)) return null;
  const url = profileCanonicalUrl(slug);
  return isAllowedSitemapAbsoluteUrl(url) ? url : null;
}

export function isAllowedSitemapAbsoluteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.hostname.toLowerCase().startsWith("www.")) return false;
    if (parsed.pathname.includes("_")) return false;
    if (BLOCKED_SITEMAP_PATH.test(parsed.pathname)) return false;

    const origin = getSiteUrl();
    if (parsed.origin !== origin) return false;

    const profileMatch = /^\/profile\/([^/]+)\/?$/.exec(parsed.pathname);
    if (profileMatch) {
      const slug = decodeURIComponent(profileMatch[1]);
      return isPublicIndexableProfileSlug(slug);
    }

    return true;
  } catch {
    return false;
  }
}

export function filterSitemapEntries(
  entries: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  return entries.filter((entry) => isAllowedSitemapAbsoluteUrl(entry.url));
}

export function filterSitemapIndexLocs<T extends { loc: string }>(
  entries: T[],
): T[] {
  return entries.filter((entry) => isAllowedSitemapAbsoluteUrl(entry.loc));
}
