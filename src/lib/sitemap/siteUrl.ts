/** URL canónica del sitio (producción: naughtyxxxcams.com). */
export function getSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!fromEnv) {
    return "https://naughtyxxxcams.com";
  }

  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) {
    return fromEnv.replace(/\/$/, "");
  }

  return `https://${fromEnv.replace(/\/$/, "")}`;
}
