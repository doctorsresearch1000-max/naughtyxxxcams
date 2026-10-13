/** Shared slug rules (must match `performerProfileSlug` / `sanitizeModelSlug`). */
export const CANONICAL_PROFILE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function sanitizeModelSlug(raw) {
  if (!raw?.trim()) return null;
  const slug = decodeURIComponent(String(raw))
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : null;
}

export function isPublicIndexableProfileSlug(slug) {
  if (!slug || typeof slug !== "string") return false;
  const trimmed = slug.trim();
  if (!trimmed || trimmed.includes("_")) return false;
  if (trimmed !== trimmed.toLowerCase()) return false;
  const sanitized = sanitizeModelSlug(trimmed);
  if (!sanitized || sanitized !== trimmed) return false;
  return CANONICAL_PROFILE_SLUG_PATTERN.test(sanitized);
}

export function profileCanonicalPath(slug) {
  if (!isPublicIndexableProfileSlug(slug)) return null;
  return `/profile/${slug}`;
}
