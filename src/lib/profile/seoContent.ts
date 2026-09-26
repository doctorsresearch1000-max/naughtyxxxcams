import {
  buildModelProfileSeoDescription,
  buildModelProfileSeoTitle,
} from "@/lib/seo/model-profile-metadata";
import { buildProfileFaqItems, type ProfileFaqItem } from "@/lib/profile/profileFaq";
import {
  buildProfileLanderH1,
  buildProfileLanderParagraphs,
} from "@/lib/profile/profileLanderContent";
import { PROFILE_COMPETITIVE_GAP_KEYWORDS } from "@/lib/profile/profileCompetitiveGaps";
import { pickVariant, stableVariantIndex } from "@/lib/seo/seoVariants";

export type ModelSEOInput = {
  name: string;
  handle: string;
  profileSlug: string;
  traits: string[];
  language: string;
  bodyType: string;
  age?: number;
  ethnicity?: string;
  country?: string;
  status?: "live" | "offline";
};

export type GeneratedProfileSEO = {
  title: string;
  intro: string;
  longDescription: string;
  metaDescription: string;
  landerH1: string;
  visibleHeading: string;
  visibleParagraphs: string[];
  highlightKeywords: string[];
  faqItems: ProfileFaqItem[];
};

const VISIBLE_HEADINGS = [
  "Why fans bookmark {name} ({handle}) on NaughtyXXXCams",
  "Discovery notes for {name} — HD cam, chat & gallery",
  "{handle} profile context: traits, room entry & updates",
] as const;

function primaryEthnicity(traits: string[], explicit?: string): string {
  if (explicit?.trim()) return explicit.trim();
  const fromTraits = traits.find((t) =>
    /latina|asian|ebony|caucasian|hispanic|indian|arab/i.test(t),
  );
  return fromTraits?.trim() || "International";
}

function topTags(traits: string[], limit = 6): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const trait of traits) {
    const key = trait.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(trait.trim());
    if (out.length >= limit) break;
  }
  return out;
}

function fillTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, value);
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

export function generateUniqueSEOContent(
  model: ModelSEOInput,
): GeneratedProfileSEO {
  const seed = model.profileSlug || model.handle;
  const ethnicity = primaryEthnicity(model.traits, model.ethnicity);
  const tags = topTags(model.traits);
  const tagPhrase = tags.length > 0 ? tags.join(", ") : "live cam, public chat";
  const liveWord = model.status === "live" ? "live now" : "offline profile";

  const landerVars = {
    name: model.name,
    handle: model.handle,
    ethnicity,
    language: model.language,
    bodyType: model.bodyType,
    liveWord,
  };

  const seoModel = {
    name: model.name,
    handle: model.handle,
    profileSlug: model.profileSlug,
    status: model.status,
  };

  const title = buildModelProfileSeoTitle(seoModel);
  const metaDescription = buildModelProfileSeoDescription(seoModel);
  const intro = metaDescription;

  const landerH1 = buildProfileLanderH1(landerVars);
  const visibleHeading = fillTemplate(
    pickVariant(`${seed}-h`, VISIBLE_HEADINGS),
    {
      name: model.name,
      handle: model.handle.startsWith("@")
        ? model.handle
        : `@${model.handle}`,
    },
  );

  const visibleParagraphs = buildProfileLanderParagraphs(seed, landerVars);

  const gapHighlights = PROFILE_COMPETITIVE_GAP_KEYWORDS.filter(
    (_, i) => stableVariantIndex(`${seed}-kw-${i}`, 3) === 0,
  ).slice(0, 8);

  const highlightKeywords = [
    `${model.name} live cam`,
    `${model.handle} profile`,
    ...gapHighlights.slice(0, 4),
    ...tags.slice(0, 3),
  ];

  const faqItems = buildProfileFaqItems({
    name: model.name,
    handle: model.handle,
    profileSlug: model.profileSlug,
  });

  const longDescription = [
    landerH1,
    ...visibleParagraphs,
    `Tags: ${tagPhrase}.`,
    `Canonical slug: /profile/${model.profileSlug}.`,
  ].join(" ");

  return {
    title,
    intro,
    longDescription,
    metaDescription,
    landerH1,
    visibleHeading,
    visibleParagraphs,
    highlightKeywords,
    faqItems,
  };
}

export function modelViewToSeoInput(
  model: {
    name: string;
    handle: string;
    profileSlug: string;
    traits: string[];
    language: string;
    bodyType: string;
    age?: number;
    country: string;
    status: "live" | "offline";
    performer?: {
      characteristic?: { ethnicities?: string[] };
    };
  },
): ModelSEOInput {
  const ethnicity = model.performer?.characteristic?.ethnicities?.[0];
  return {
    name: model.name,
    handle: model.handle,
    profileSlug: model.profileSlug,
    traits: model.traits,
    language: model.language,
    bodyType: model.bodyType,
    age: model.age,
    ethnicity,
    country: model.country,
    status: model.status,
  };
}
