import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { formatExploreViews } from "@/lib/explore/exploreGrid";

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

/** Up to 3 ISO-style pills for grid cards (e.g. EN, ES). */
export function performerLanguagePills(performer: CrackPerformer): string[] {
  const fromCharacteristic = performer.characteristic?.languages ?? [];
  const fromTags = [
    ...(performer.characteristicsTags ?? []),
    ...(performer.autoTags ?? []),
  ].filter((t) => /lang|english|spanish|french|russian/i.test(t));

  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of [...fromCharacteristic, ...fromTags]) {
    const code = normalizeLanguageToken(raw);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
    if (out.length >= 3) break;
  }

  if (out.length === 0) out.push("EN");
  return out;
}

export function formatCardViewLabel(performer: CrackPerformer): string {
  const compact = formatExploreViews(performer);
  return `${compact} views`;
}
