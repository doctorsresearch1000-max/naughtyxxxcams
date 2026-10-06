const PROFILE_HANDLE_ONLY = /^\/profile\/([^/]+)$/;
const PROFILE_HANDLE_PREFIX = /^\/profile\/([^/]+)/;

const RESERVED_PROFILE_SEGMENTS = new Set(["playlists"]);

/**
 * First path segment after `/profile/` when it denotes a model handle.
 * Excludes `/profile`, `/profile/playlists/*`, and other reserved segments.
 */
export function getProfileHandleFromPathname(pathname: string): string | null {
  const match = PROFILE_HANDLE_PREFIX.exec(pathname);
  if (!match) return null;

  const segment = match[1];
  if (!segment || RESERVED_PROFILE_SEGMENTS.has(segment)) return null;

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** True for `/profile/{handle}` only (not intent sub-routes). */
export function isIndexableProfileHandlePath(pathname: string): boolean {
  const match = PROFILE_HANDLE_ONLY.exec(pathname);
  if (!match) return false;
  const handle = match[1];
  if (!handle || RESERVED_PROFILE_SEGMENTS.has(handle)) return false;
  return true;
}
