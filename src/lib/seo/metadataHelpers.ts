export const SEO_TITLE_MIN_LEN = 30;
export const SEO_TITLE_MAX_LEN = 60;
export const SEO_DESCRIPTION_MAX_LEN = 160;

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Trim to ~60 chars; pad short titles to at least 30 when possible. */
export function normalizeSeoTitle(
  raw: string,
  options?: { min?: number; max?: number },
): string {
  const min = options?.min ?? SEO_TITLE_MIN_LEN;
  const max = options?.max ?? SEO_TITLE_MAX_LEN;
  let title = normalizeWhitespace(raw);

  if (title.length > max) {
    const ellipsis = "…";
    let slice = title.slice(0, max - ellipsis.length);
    const breakAt = Math.max(slice.lastIndexOf(" — "), slice.lastIndexOf(" "));
    if (breakAt > (max - ellipsis.length) * 0.55) {
      slice = slice.slice(0, breakAt);
    }
    title = `${slice.trim()}${ellipsis}`;
  }

  if (title.length < min) {
    const pads = [
      " — Live HD Cams",
      " | NaughtyXxxCams",
      " — Adult Webcams",
    ];
    for (const pad of pads) {
      const candidate = `${title}${pad}`;
      if (candidate.length >= min && candidate.length <= max) {
        return candidate;
      }
    }
  }

  return title;
}

export function normalizeSeoDescription(
  raw: string,
  max = SEO_DESCRIPTION_MAX_LEN,
): string {
  const text = normalizeWhitespace(raw);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  nocache: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
  },
} as const;

export const NOINDEX_ROBOTS = {
  index: false,
  follow: false,
} as const;
