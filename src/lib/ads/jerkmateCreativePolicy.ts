/**
 * Jerkmate local creatives policy.
 *
 * Incident: a phone screenshot of `app/error.tsx` (“Loading chunk …” /
 * “Connection closed”) was committed under `public/ads/jerkmate` and rotated
 * as an in-grid ad — visually identical to a real route failure.
 */

/** Never serve again (basename without extension). */
export const JERKMATE_BLOCKED_CREATIVE_IDS = new Set<string>([
  "65e41014-5b2d-4c35-9475-b1d1d38016bd",
]);

export function jerkmateCreativeIdFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.(jpe?g|gif|webp|png)$/i, "");
}

export function isBlockedJerkmateCreative(path: string): boolean {
  return JERKMATE_BLOCKED_CREATIVE_IDS.has(jerkmateCreativeIdFromPath(path));
}

export function filterSafeJerkmateCreatives(
  paths: readonly string[],
): string[] {
  return paths.filter((p) => !isBlockedJerkmateCreative(p));
}
