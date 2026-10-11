/**
 * Legacy affiliate/SEO spam paths (single segment, e.g. /blowjobs-near-me).
 * These are not part of the Next.js app — return 410 Gone so GSC drops them.
 */
const ALLOWED_ROOT_SEGMENTS = new Set([
  "explore",
  "following",
  "profile",
  "category",
  "contact",
  "telegram",
  "terms",
  "privacy",
  "guides",
  "affiliates",
  "dmca",
  "report",
  "auth",
  "usc-2257",
]);

/** Paths with a file extension (sitemap.xml, robots.txt, icon.png, …). */
function hasStaticExtension(segment: string): boolean {
  return /\.[a-z0-9]{2,8}$/i.test(segment);
}

export function isLegacyRootSpamPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/") return false;

  const segments = normalized.split("/").filter(Boolean);
  if (segments.length !== 1) return false;

  const seg = segments[0].toLowerCase();
  if (ALLOWED_ROOT_SEGMENTS.has(seg)) return false;
  if (hasStaticExtension(seg)) return false;

  return true;
}
