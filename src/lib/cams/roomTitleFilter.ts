import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { isLanguageMetaTag } from "@/lib/media/performerCardMeta";

/** Blocked substrings in room titles (lowercase match). */
export const ROOM_TITLE_BLOCKED_TERMS = [
  "langenglish",
  "langspanish",
  "streamate",
  "jerkmate",
  "crakrevenue",
  "affiliate",
  "landing",
] as const;

export const ROOM_TITLE_MAX_LENGTH = 72;

function isBlockedRoomTitle(text: string): boolean {
  const lower = text.toLowerCase();
  return ROOM_TITLE_BLOCKED_TERMS.some((term) => lower.includes(term));
}

export function filterRoomTitle(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (isLanguageMetaTag(trimmed)) return null;
  if (isBlockedRoomTitle(trimmed)) return null;
  const oneLine = trimmed.replace(/\s+/g, " ");
  if (oneLine.length > ROOM_TITLE_MAX_LENGTH) {
    return `${oneLine.slice(0, ROOM_TITLE_MAX_LENGTH - 1)}…`;
  }
  return oneLine;
}

export function resolveRoomTitle(performer: CrackPerformer): string | null {
  const candidates = [
    performer.customTags?.[0],
    performer.autoTags?.find((t) => t.length >= 8 && t.length <= 80),
  ];
  for (const c of candidates) {
    const filtered = filterRoomTitle(c);
    if (filtered) return filtered;
  }
  return null;
}
