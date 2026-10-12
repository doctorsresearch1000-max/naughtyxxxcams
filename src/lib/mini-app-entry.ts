const DEFAULT_MINI_APP_SHORT_NAME = "app";

/** Public Mini App deep link (`t.me/{bot}/{shortName}`) with web popup attribution. */
export function buildMiniAppEntryUrl(): string | null {
  const username =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() || "";
  if (!username) return null;

  const shortName =
    process.env.NEXT_PUBLIC_TELEGRAM_MINI_APP_SHORT_NAME?.trim() ||
    DEFAULT_MINI_APP_SHORT_NAME;

  const params = new URLSearchParams({
    utm_source: "naughty_web",
    utm_medium: "popup_30s",
  });

  return `https://t.me/${username}/${shortName}?${params.toString()}`;
}
