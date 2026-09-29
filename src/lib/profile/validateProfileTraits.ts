import { filterRoomTitle } from "@/lib/cams/roomTitleFilter";

const BLOCKED_TRAIT_TERMS = [
  "teen",
  "underage",
  "gc_18_19",
  "gc_20_29",
] as const;

export function sanitizeProfileTraits(
  traits: string[],
  context: { profileSlug: string },
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of traits) {
    const t = raw?.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;

    if (BLOCKED_TRAIT_TERMS.some((b) => key.includes(b))) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.info(
          `[traits] dropped blocked term "${t}" on /profile/${context.profileSlug}`,
        );
      }
      continue;
    }

    if (!filterRoomTitle(t)) {
      const looksLikeTag = key.length < 14 && !/\s/.test(key);
      if (looksLikeTag && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.info(
          `[traits] short tag kept for chips: "${t}" (${context.profileSlug})`,
        );
      }
    }

    seen.add(key);
    out.push(t);
  }

  return out;
}
