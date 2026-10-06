/** Public edge cache for resolvable model profile HTML (when upstream returns 200). */
export const PROFILE_PAGE_CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=3600";

const PROFILE_HANDLE_PATH = /^\/profile\/([^/]+)$/;

/** `/profile/{handle}` but not `/profile` hub or nested routes. */
export function isIndexableProfileHandlePath(pathname: string): boolean {
  const match = PROFILE_HANDLE_PATH.exec(pathname);
  if (!match) return false;
  const handle = match[1];
  if (!handle || handle === "playlists") return false;
  return true;
}
