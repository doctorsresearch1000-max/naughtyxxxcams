/**
 * Responsive performer thumbnails (LCP / grid). Uses CDN transforms when available.
 */

const DEFAULT_WIDTHS = [320, 480, 640] as const;

function parseUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

/** Streamate / Crak image transform CDN. */
function isIcfTransformHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === "imagetransform.icfcdn.com" || h.endsWith(".icfcdn.com");
}

export function buildCdnImageUrl(
  rawUrl: string,
  width: number,
  format: "webp" | "jpeg" = "webp",
): string {
  const parsed = parseUrl(rawUrl);
  if (!parsed) return rawUrl;

  if (isIcfTransformHost(parsed.hostname)) {
    const next = new URL(parsed.href);
    next.searchParams.set("width", String(Math.round(width)));
    next.searchParams.set("format", format);
    next.searchParams.set("quality", "82");
    return next.toString();
  }

  const sep = parsed.search ? "&" : "?";
  return `${parsed.href}${sep}w=${Math.round(width)}`;
}

export type ResponsiveImageSources = {
  src: string;
  srcSet: string;
  sizes: string;
};

export function buildResponsiveCardImage(
  rawUrl: string,
  options?: {
    widths?: readonly number[];
    sizes?: string;
    format?: "webp" | "jpeg";
  },
): ResponsiveImageSources | null {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  const widths = options?.widths ?? DEFAULT_WIDTHS;
  const sizes = options?.sizes ?? "(max-width: 640px) 50vw, 16vw";
  const format = options?.format ?? "webp";

  const entries = widths.map((w) => ({
    w,
    url: buildCdnImageUrl(trimmed, w, format),
  }));

  const src = entries[Math.min(1, entries.length - 1)]?.url ?? trimmed;
  const srcSet = entries.map((e) => `${e.url} ${e.w}w`).join(", ");

  return { src, srcSet, sizes };
}
