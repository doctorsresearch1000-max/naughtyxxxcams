import faqPoolJson from "@/data/profile-faq-pool.json";
import { stableVariantIndex } from "@/lib/seo/seoVariants";

export type ProfileFaqPoolEntry = {
  id: string;
  question: string;
  answer: string;
};

export type ProfileFaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_POOL: ProfileFaqPoolEntry[] = faqPoolJson as ProfileFaqPoolEntry[];

const BANNED_JARGON_PATTERN =
  /\b(permalink|metadata|json-ld|hub|outbound|indexable|canonical|streamate room link|discovery hub|https protocol|sitemap|slug|router|api)\b/i;

function atHandle(handle: string): string {
  const clean = handle.trim().replace(/^@+/, "");
  return clean ? `@${clean}` : "@model";
}

function applyHandleTokens(text: string, handle: string): string {
  return text.replaceAll("@{handle}", handle).replace(/\s+/g, " ").trim();
}

/** Deterministic count between 4 and 6 inclusive. */
export function profileFaqCountForSeed(seed: string): number {
  return 4 + stableVariantIndex(`${seed}:faq-count`, 3);
}

/**
 * Deterministic unique FAQ indices for a profile (hash by slug / handle).
 */
export function selectProfileFaqIndices(
  seed: string,
  poolSize: number,
  count: number,
): number[] {
  const capped = Math.min(count, poolSize);
  const ranked = Array.from({ length: poolSize }, (_, index) => ({
    index,
    rank: stableVariantIndex(`${seed}:faq-rank:${index}`, 1_000_003),
  }));
  ranked.sort((a, b) => a.rank - b.rank);
  return ranked.slice(0, capped).map((entry) => entry.index);
}

export function buildProfileFaqItems(input: {
  name: string;
  handle: string;
  profileSlug: string;
}): ProfileFaqItem[] {
  const seed =
    input.profileSlug?.trim() ||
    input.handle.trim().replace(/^@+/, "") ||
    input.name.trim();
  const handle = atHandle(input.handle);
  const count = profileFaqCountForSeed(seed);
  const indices = selectProfileFaqIndices(seed, FAQ_POOL.length, count);

  const items: ProfileFaqItem[] = [];
  for (const index of indices) {
    const entry = FAQ_POOL[index];
    if (!entry) continue;

    const question = applyHandleTokens(entry.question, handle);
    const answer = applyHandleTokens(entry.answer, handle);

    if (BANNED_JARGON_PATTERN.test(`${question} ${answer}`)) {
      continue;
    }

    items.push({
      id: `${entry.id}-${seed}`,
      question,
      answer,
    });
  }

  return items;
}

export function getProfileFaqPoolSize(): number {
  return FAQ_POOL.length;
}
