import {
  getProfileHandleFromPathname,
  isIndexableProfileHandlePath,
} from "./profileHandlePath";

/** Public edge cache for resolvable model profile HTML (when upstream returns 200). */
export const PROFILE_PAGE_CACHE_CONTROL =
  "public, s-maxage=300, stale-while-revalidate=3600";

export const PROFILE_NOT_FOUND_CACHE_CONTROL =
  "private, no-store, max-age=0, must-revalidate";

export const API_ROUTE_CACHE_CONTROL =
  "private, no-store, max-age=0, must-revalidate";

/** `/profile/{handle}` and `/profile/{handle}/{intent}` (not playlists hub). */
export function isPublicProfileHtmlPath(pathname: string): boolean {
  return getProfileHandleFromPathname(pathname) !== null;
}

export { isIndexableProfileHandlePath };
