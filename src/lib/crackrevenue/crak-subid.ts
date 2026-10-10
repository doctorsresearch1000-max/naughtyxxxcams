/**
 * Persistent CrakRevenue sub-ID for all monetized outbound URLs.
 * @see https://www.crakrevenue.com — `subid` on smartlinks / go links / tracking domains.
 */
export const CRAK_SUBID_PARAM = "subid";
export const CRAK_SUBID_VALUE = "naughtyxxxcams_com";

const CRAK_AFFILIATE_HOST_SUFFIXES = [
  "crakrevenue.com",
  "ajrkmx5.com",
] as const;

/** True when the URL is a known CrakRevenue / Crak tracking host. */
export function isCrakRevenueAffiliateUrl(raw: string): boolean {
  const trimmed = raw?.trim();
  if (!trimmed) return false;

  try {
    const { hostname } = new URL(trimmed);
    const host = hostname.toLowerCase();
    return CRAK_AFFILIATE_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return /(?:^|\/\/)(?:[\w-]+\.)*crakrevenue\.com|ajrkmx5\.com/i.test(
      trimmed,
    );
  }
}

type WithCrakSubidOptions = {
  /**
   * When true, append `subid` even on non-Crak hosts (e.g. Jerkmate room URLs from the feed).
   * Use for URLs built exclusively as affiliate exits.
   */
  always?: boolean;
};

/**
 * Adds or overwrites `subid=naughtyxxxcams_com` without changing host or path.
 */
export function withCrakSubid(
  raw: string,
  options?: WithCrakSubidOptions,
): string {
  const trimmed = raw?.trim();
  if (!trimmed) return trimmed;

  const shouldTag =
    options?.always === true || isCrakRevenueAffiliateUrl(trimmed);
  if (!shouldTag) return trimmed;

  try {
    const url = new URL(trimmed);
    url.searchParams.set(CRAK_SUBID_PARAM, CRAK_SUBID_VALUE);
    return url.toString();
  } catch {
    return trimmed;
  }
}

/** Alias for affiliate builders — always stamp subid on monetized exits. */
export function ensureAffiliateSubid(url: string): string {
  return withCrakSubid(url, { always: true });
}
