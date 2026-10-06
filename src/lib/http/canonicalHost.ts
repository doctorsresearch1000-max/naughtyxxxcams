import { getSiteUrl } from "@/lib/sitemap/siteUrl";

/** Apex hostname for redirects and canonical URLs (no www). */
export function getCanonicalHostname(): string {
  try {
    const host = new URL(getSiteUrl()).hostname.toLowerCase();
    return host.replace(/^www\./, "");
  } catch {
    return "naughtyxxxcams.com";
  }
}

export function hostnameFromRequestHost(hostHeader: string | null): string {
  if (!hostHeader?.trim()) return "";
  return hostHeader.split(":")[0].trim().toLowerCase();
}

/** True when the request targets `www.{canonical}` and should 308 to apex. */
export function shouldRedirectWwwToApex(hostHeader: string | null): boolean {
  const host = hostnameFromRequestHost(hostHeader);
  if (!host.startsWith("www.")) return false;
  const apex = host.slice(4);
  return apex === getCanonicalHostname();
}

export function buildApexRedirectUrl(requestUrl: URL): URL {
  const target = new URL(requestUrl.toString());
  const apex = getCanonicalHostname();
  target.hostname = apex;
  target.protocol = "https:";
  target.port = "";
  return target;
}
