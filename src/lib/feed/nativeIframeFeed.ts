/**
 * Performers-ext `iframeFeedURL` validation.
 * Feed cards must use native Streamate hybrid players — never affiliate landings
 * or redirect widgets (Jerkmate, t.camsk7, etc.).
 */

const BLOCKED_EMBED_MARKERS = [
  "jerkmate",
  "go.crakrevenue",
  "crakrevenue.com/go",
  "camsk7.com",
  "t.camsk7",
  "/landing",
  "landing_id",
  "aff_sub",
  "file_id=",
] as const;

/** Host suffixes that may host a real in-page video player (not a click-out promo). */
const NATIVE_PLAYER_HOST_RULES: ReadonlyArray<{
  hostSuffix: string;
  pathPrefix?: string;
  requireQuery?: readonly string[];
}> = [
  {
    hostSuffix: "naiadsystems.com",
    pathPrefix: "/purecam",
    requireQuery: ["performer", "performerid"],
  },
  {
    hostSuffix: "streamate.com",
    pathPrefix: "/embed",
  },
  {
    hostSuffix: "streamate.net",
    pathPrefix: "/embed",
  },
  {
    hostSuffix: "streamateaccess.com",
  },
];

function parseHttpsUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return null;
    return parsed;
  } catch {
    return null;
  }
}

function hrefLooksBlocked(hrefLower: string): boolean {
  return BLOCKED_EMBED_MARKERS.some((marker) => hrefLower.includes(marker));
}

function hostMatchesSuffix(host: string, suffix: string): boolean {
  const h = host.toLowerCase();
  const s = suffix.toLowerCase();
  return h === s || h.endsWith(`.${s}`);
}

function queryHasAnyIdentityParam(url: URL, keys: readonly string[]): boolean {
  for (const key of keys) {
    const value = url.searchParams.get(key)?.trim();
    if (value) return true;
  }
  return false;
}

/** Affiliate room / tracking URL — must never be used as iframe `src`. */
export function isAffiliateOrLandingUrl(raw: string): boolean {
  const parsed = parseHttpsUrl(raw);
  if (!parsed) return true;
  const href = parsed.href.toLowerCase();
  if (hrefLooksBlocked(href)) return true;
  if (hostMatchesSuffix(parsed.hostname, "camsk7.com")) return true;
  return false;
}

/**
 * True when performers-ext returned a native hybrid / embed player URL suitable
 * for a direct cross-origin iframe (pointerdown unlock inside Crak/Streamate).
 */
export function isNativeEmbeddableIframeFeedUrl(raw: string): boolean {
  const parsed = parseHttpsUrl(raw);
  if (!parsed) return false;

  const href = parsed.href.toLowerCase();
  if (hrefLooksBlocked(href)) return false;

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  for (const rule of NATIVE_PLAYER_HOST_RULES) {
    if (!hostMatchesSuffix(host, rule.hostSuffix)) continue;
    if (rule.pathPrefix && !path.startsWith(rule.pathPrefix.toLowerCase())) {
      continue;
    }
    if (
      rule.requireQuery &&
      !queryHasAnyIdentityParam(parsed, rule.requireQuery)
    ) {
      continue;
    }
    return true;
  }

  return false;
}

export function pickNativeIframeFeedUrl(
  performer: { iframeFeedURL?: string; roomUrl?: string },
): string | null {
  const feed = performer.iframeFeedURL?.trim() ?? "";
  if (!feed || !isNativeEmbeddableIframeFeedUrl(feed)) return null;

  const room = performer.roomUrl?.trim() ?? "";
  if (room && feed === room) return null;
  if (room && isAffiliateOrLandingUrl(feed)) return null;

  return feed;
}

export function performerHasNativeEmbedFeed(performer: {
  live?: boolean;
  iframeFeedURL?: string;
  roomUrl?: string;
  systemSource?: string;
}): boolean {
  if (performer.live === false) return false;
  if (
    typeof performer.systemSource === "string" &&
    performer.systemSource.trim().toLowerCase() !== "streamate"
  ) {
    return false;
  }
  return pickNativeIframeFeedUrl(performer) !== null;
}
