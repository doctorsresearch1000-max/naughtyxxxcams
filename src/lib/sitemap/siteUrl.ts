/** URL canónica del sitio (producción: apex non-www). */
export function getSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!fromEnv) {
    return "https://naughtyxxxcams.com";
  }

  const withScheme = fromEnv.startsWith("http://") || fromEnv.startsWith("https://")
    ? fromEnv
    : `https://${fromEnv}`;

  try {
    const url = new URL(withScheme);
    if (url.hostname.toLowerCase().startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
    }
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.origin;
  } catch {
    return "https://naughtyxxxcams.com";
  }
}
