import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { performerCardMetricLabel } from "@/lib/media/performerCardMetrics";

/** API tags like `langenglish`, `langspanish` — never show as card copy. */
export function isLanguageMetaTag(raw?: string | null): boolean {
  if (!raw?.trim()) return false;
  const t = raw.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!t) return false;
  if (t.startsWith("lang") && t.length > 4) return true;
  return (
    t === "english" ||
    t === "spanish" ||
    t === "french" ||
    t === "german" ||
    t === "language"
  );
}

const LANGUAGE_ALIASES: Record<string, string> = {
  en: "EN",
  english: "EN",
  es: "ES",
  spanish: "ES",
  español: "ES",
  fr: "FR",
  french: "FR",
  de: "DE",
  german: "DE",
  it: "IT",
  italian: "IT",
  pt: "PT",
  portuguese: "PT",
  ru: "RU",
  russian: "RU",
  pl: "PL",
  polish: "PL",
  uk: "UK",
  ukrainian: "UK",
  ro: "RO",
  romanian: "RO",
  nl: "NL",
  dutch: "NL",
  ja: "JA",
  japanese: "JA",
  zh: "ZH",
  chinese: "ZH",
};

function normalizeLanguageToken(raw: string): string | null {
  let token = raw.trim().toLowerCase();
  if (!token) return null;
  token = token.replace(/^lang/, "").replace(/[^a-z]/g, "");
  if (!token) return null;

  if (LANGUAGE_ALIASES[token]) return LANGUAGE_ALIASES[token];
  if (token.length === 2) return token.toUpperCase();
  if (token.length > 2 && LANGUAGE_ALIASES[token.slice(0, 5)]) {
    return LANGUAGE_ALIASES[token.slice(0, 5)];
  }
  for (const [key, code] of Object.entries(LANGUAGE_ALIASES)) {
    if (token.includes(key) || key.includes(token)) return code;
  }
  return token.slice(0, 2).toUpperCase();
}

/** ISO-style language code for cards — only from API `languages`, never raw tags. */
export function performerPrimaryLanguageCode(
  performer: CrackPerformer,
): string {
  const fromCharacteristic = performer.characteristic?.languages ?? [];
  for (const raw of fromCharacteristic) {
    if (isLanguageMetaTag(raw)) {
      const code = normalizeLanguageToken(raw);
      if (code) return code;
      continue;
    }
    const code = normalizeLanguageToken(raw);
    if (code) return code;
  }
  return "EN";
}

/** @deprecated Prefer {@link performerPrimaryLanguageCode} for card footers. */
export function performerLanguagePills(performer: CrackPerformer): string[] {
  return [performerPrimaryLanguageCode(performer)];
}

/** Username line for cam cards (never tag blobs like `langenglish`). */
export function camCardUsername(performer: CrackPerformer): string {
  const candidates = [
    performer.nameClean,
    performer.name,
    performer.itemId,
  ];
  for (const raw of candidates) {
    const clean = raw?.trim().replace(/^@+/, "").replace(/\s+/g, "");
    if (!clean || isLanguageMetaTag(clean)) continue;
    if (/^f$/i.test(clean)) continue;
    return clean;
  }
  return "model";
}

export function formatCardViewLabel(performer: CrackPerformer): string | null {
  const metric = performerCardMetricLabel(performer);
  if (!metric) return null;
  return metric;
}

/** Second line under cam cards: `450K views · EN`. */
export function formatCardMetaSubtitle(performer: CrackPerformer): string {
  const lang = performerPrimaryLanguageCode(performer);
  const views = formatCardViewLabel(performer);
  return views ? `${views} · ${lang}` : lang;
}
