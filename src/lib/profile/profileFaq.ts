import { pickVariant, stableVariantIndex } from "@/lib/seo/seoVariants";

export type ProfileFaqItem = {
  question: string;
  answer: string;
};

const FAQ_QUESTION_POOL = [
  "What are the best free live chat sex chat platforms for {handle}?",
  "Where can I find no-cost adult video chat groups featuring {handle}?",
  "How can I find safe and reliable free sex chat services online with {handle}?",
  "Are there anonymous adult chat applications without subscription for {handle}?",
  "Which apps offer free adult chat rooms with video options for {handle}?",
  "How do I access free sex chat services without creating an account for {handle}?",
  "Is {handle} available for free live video sex chat on mobile?",
  "Does {name} ({handle}) support cam to cam sex chat in public rooms?",
  "Where is the official {handle} live sex chat online permalink?",
  "Can I watch {name} on adult webcam sites without paying upfront?",
  "What makes {handle} different from generic adult chat roulette sites?",
  "How do I get alerts when {handle} starts a live sex show?",
  "Is the {handle} profile on NaughtyXXXCams the same as random sexcam chats?",
  "Can I save {name} ({handle}) to favorites for faster live chat sex chat access?",
  "Does {handle} offer free cam shows before private upgrades?",
  "How safe is the Streamate room linked from {handle}?",
  "Can couples livesex fans still discover {handle} on this hub?",
  "Where do {handle} gallery photos and Telegram-style updates live?",
  "Is {name} listed among the best cam sites for {handle} discovery?",
  "How do I switch from {handle} to similar free live cam models?",
] as const;

const FAQ_ANSWER_TEMPLATES = [
  "NaughtyXXXCams routes {handle} to an authorized Streamate room with clear public chat entry — a focused alternative to noisy directory pages.",
  "Use this official {name} ({handle}) permalink for HD preview, traits, and one-tap room access without hunting third-party lists.",
  "The {handle} hub highlights verified metadata, gallery media, and live status so you can choose free public chat before any upgrade.",
  "Save {handle} on NaughtyXXXCams to get faster return visits, favorites sync, and mobile-friendly player entry when {name} goes live.",
  "Compared with anonymous roulette-style apps, {handle} keeps discovery tied to a single trusted performer profile and outbound room link.",
  "You can browse {name} ({handle}) photos and updates here first, then join live video chat when the LIVE badge is active.",
] as const;

function fillFaqTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, value);
  }
  return out.replace(/\s+/g, " ").trim();
}

function atHandle(handle: string): string {
  const clean = handle.trim().replace(/^@+/, "");
  return clean ? `@${clean}` : "@model";
}

export function profileFaqCountForSeed(seed: string): number {
  return 4 + stableVariantIndex(`${seed}-faq-n`, 3);
}

export function buildProfileFaqItems(input: {
  name: string;
  handle: string;
  profileSlug: string;
}): ProfileFaqItem[] {
  const seed = input.profileSlug || input.handle;
  const count = profileFaqCountForSeed(seed);
  const vars = { name: input.name.trim(), handle: atHandle(input.handle) };
  const poolLen = FAQ_QUESTION_POOL.length;
  const start = stableVariantIndex(`${seed}-faq-start`, poolLen);

  const items: ProfileFaqItem[] = [];
  for (let i = 0; i < count; i += 1) {
    const qTemplate = FAQ_QUESTION_POOL[(start + i) % poolLen];
    const question = fillFaqTemplate(qTemplate, vars);
    const answer = fillFaqTemplate(
      pickVariant(`${seed}-faq-a-${i}`, FAQ_ANSWER_TEMPLATES),
      vars,
    );
    items.push({ question, answer });
  }

  return items;
}
