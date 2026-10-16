import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ISO 3166-1 alpha-2 codes blocked at the edge (datacenter / bot noise).
 * Extend via env or config only with explicit product approval.
 */
export const EDGE_BLOCKED_COUNTRY_CODES = new Set<string>(["SG"]);

/** Cloudflare: unknown country. Tor: T1. Do not treat as blocklist hits. */
const CF_SPECIAL_COUNTRY_CODES = new Set(["XX", "T1"]);

export function normalizeCountryCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (!code || CF_SPECIAL_COUNTRY_CODES.has(code)) return null;
  return code;
}

export function resolveCountryCodeFromHeaders(headers: Headers): string | null {
  const fromCf =
    headers.get("cf-ipcountry") ?? headers.get("CF-IPCountry");
  const normalized = normalizeCountryCode(fromCf);
  if (normalized) return normalized;
  return null;
}

export function resolveCountryCodeFromNextRequest(
  request: NextRequest,
): string | null {
  const fromHeaders = resolveCountryCodeFromHeaders(request.headers);
  if (fromHeaders) return fromHeaders;

  const geoCountry = (
    request as NextRequest & { geo?: { country?: string } }
  ).geo?.country;
  return normalizeCountryCode(geoCountry);
}

export function isEdgeBlockedCountry(code: string | null): boolean {
  return code !== null && EDGE_BLOCKED_COUNTRY_CODES.has(code);
}

/** Minimal 403 — no body, no-store (affiliate redirects never run). */
export function edgeBlockedCountryResponse(): NextResponse {
  return new NextResponse(null, {
    status: 403,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export function edgeBlockedCountryResponseIfNeeded(
  headers: Headers,
): NextResponse | null {
  const code = resolveCountryCodeFromHeaders(headers);
  return isEdgeBlockedCountry(code) ? edgeBlockedCountryResponse() : null;
}

export function edgeBlockedCountryResponseForRequest(
  request: NextRequest,
): NextResponse | null {
  const code = resolveCountryCodeFromNextRequest(request);
  return isEdgeBlockedCountry(code) ? edgeBlockedCountryResponse() : null;
}
