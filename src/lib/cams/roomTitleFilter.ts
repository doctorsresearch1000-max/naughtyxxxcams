import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { isLanguageMetaTag } from "@/lib/media/performerCardMeta";

export const ROOM_TITLE_MAX_LENGTH = 72;

const BLOCKED_SUBSTRINGS = [
  "langenglish",
  "langspanish",
  "streamate",
  "jerkmate",
  "crakrevenue",
  "affiliate",
  "landing",
  "beautiful",
  "brown hair",
  "blonde",
  "brunette",
  "teen",
  "milf",
  "latina",
  "asian",
  "ebony",
] as const;

/** CrakRevenue age bucket tokens (e.g. gc_18_19). */
const AGE_BUCKET_PATTERN = /^gc_\d/i;

const GENERIC_TAG_PATTERN =
  /^[a-z0-9]+(?:\s[a-z0-9]+){0,3}$/i;

function looksLikeRawTag(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower.includes("_")) return true;
  if (AGE_BUCKET_PATTERN.test(lower)) return true;
  if (/^gc[_-]/.test(lower)) return true;
  if (BLOCKED_SUBSTRINGS.some((t) => lower === t || lower.includes(t))) {
    return true;
  }
  if (lower.length < 12 && GENERIC_TAG_PATTERN.test(lower)) {
    const words = lower.split(/\s+/);
    if (words.length <= 3 && !/[.!?]/.test(lower)) return true;
  }
  return false;
}

export function filterRoomTitle(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (isLanguageMetaTag(trimmed)) return null;
  if (looksLikeRawTag(trimmed)) return null;

  const oneLine = trimmed.replace(/\s+/g, " ");
  if (oneLine.length < 10) return null;

  if (oneLine.length > ROOM_TITLE_MAX_LENGTH) {
    return `${oneLine.slice(0, ROOM_TITLE_MAX_LENGTH - 1)}…`;
  }
  return oneLine;
}

/** Only use long custom tags that read like a room subject (not catalog tags). */
export function resolveRoomTitle(performer: CrackPerformer): string | null {
  const candidates = [
    ...(performer.customTags ?? []),
    ...(performer.autoTags ?? []).filter((t) => t.length >= 18),
  ];

  for (const c of candidates) {
    const filtered = filterRoomTitle(c);
    if (filtered) return filtered;
  }
  return null;
}
