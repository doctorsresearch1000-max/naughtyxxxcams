/** Slug URL para `/profile/[handle]` (sin @, minúsculas, solo alfanumérico). */
export function performerProfileSlug(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  const slug = decodeURIComponent(raw)
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  return slug.length > 0 ? slug : null;
}

export function performerProfilePath(raw?: string | null): string | null {
  const slug = performerProfileSlug(raw);
  return slug ? `/profile/${slug}` : null;
}

export function performerDisplayHandle(raw?: string | null): string {
  const name = raw?.trim();
  if (!name) return "@modelo";
  const clean = name.replace(/^@+/, "").replace(/\s+/g, "");
  return `@${clean}`;
}
