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
  visibleHeading: string;
  visibleParagraphs: string[];
  highlightKeywords: string[];
};

const TITLE_TEMPLATES = [
  "{name}{age} — {ethnicity} Nude Live Cam & VIP Private Show | NaughtyXXXCams",
  "{name} ({handle}) Exclusive HD Webcam — {country} Adult Chat | NaughtyXXXCams",
  "Watch {name} Live{age} — {ethnicity} Sex Cam & Private Room | NaughtyXXXCams",
  "{name}{age} Streamate Profile — Exclusive Pics, VIP Chat & Live Nude | Naughty",
  "{name} — {ethnicity} Live Adult Webcam{age} & Private Cam Pack | NaughtyXXXCams",
] as const;

const META_INTROS = [
  "Watch {name} ({handle}) live: {ethnicity} nude cam, VIP private chat, and exclusive gallery on NaughtyXXXCams.",
  "{name}{age} — HD {ethnicity} sex cam, private show entry, and verified Streamate room via NaughtyXXXCams.",
  "High-intent {name} profile: live adult webcam, exclusive content pack, {language} chat — NaughtyXXXCams hub.",
] as const;

const VISIBLE_HEADINGS = [
  "{name} — live nude cam, VIP private chat & exclusive media",
  "Watch {name}{age}: {ethnicity} HD webcam & private show access",
  "{name} ({handle}) — adult live chat, exclusive pics & Streamate room",
] as const;

const INTENT_MODIFIERS = [
  "private VIP cam session",
  "exclusive nude live stream",
  "HD adult webcam chat",
  "verified private show entry",
  "exclusive photo & clip pack",
  "1-on-1 live sex chat",
] as const;

const FORMAT_HOOKS = [
  "free chat gateway",
  "mobile HD player",
  "official Streamate permalink",
  "trait-tagged discovery",
  "save & alert profile",
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

function formatCountry(country?: string): string | null {
  const c = country?.trim();
  if (!c || c === "INT" || c === "—") return null;
  return c;
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

function ageSuffix(age?: number): string {
  if (typeof age !== "number" || age < 18) return "";
  return `, ${age}`;
}

function ageShort(age?: number): string {
  if (typeof age !== "number" || age < 18) return "";
  return ` ${age}`;
}

export function generateUniqueSEOContent(
  model: ModelSEOInput,
): GeneratedProfileSEO {
  const seed = model.profileSlug || model.handle;
  const ethnicity = primaryEthnicity(model.traits, model.ethnicity);
  const country = formatCountry(model.country) ?? "Global";
  const tags = topTags(model.traits);
  const tagPhrase = tags.length > 0 ? tags.join(", ") : "live cam, nude chat, VIP";
  const traitsList = model.traits.join(", ");
  const liveWord = model.status === "live" ? "live now" : "offline profile";

  const vars = {
    name: model.name,
    handle: model.handle,
    ethnicity,
    country,
    language: model.language,
    bodyType: model.bodyType,
    age: ageSuffix(model.age),
    ageShort: ageShort(model.age),
  };

  const modifier = pickVariant(
    `${seed}-mod`,
    INTENT_MODIFIERS,
  );
  const formatHook = pickVariant(`${seed}-fmt`, FORMAT_HOOKS);

  const title = fillTemplate(pickVariant(seed, TITLE_TEMPLATES), vars);

  const intro = fillTemplate(pickVariant(`${seed}-intro`, META_INTROS), vars);

  const metaDescription = `${intro} ${modifier}, ${formatHook}, tags: ${tagPhrase}.`
    .replace(/\s+/g, " ")
    .slice(0, 160);

  const visibleHeading = fillTemplate(
    pickVariant(`${seed}-h`, VISIBLE_HEADINGS),
    vars,
  );

  const variantIdx = stableVariantIndex(seed, 3);

  const visibleParagraphs: string[] = [
    `${model.name} (${model.handle}) — ${ethnicity} Streamate performer, ${model.bodyType}, speaks ${model.language}, ${liveWord}. NaughtyXXXCams surfaces ${modifier}, ${formatHook}, and high-intent discovery for users searching private adult webcam experiences (complementary hub; distinct from generic cam directories).`,
    `Profile attributes: ${country}${typeof model.age === "number" ? ` · age ${model.age}` : ""} · tags: ${tagPhrase}. Explore exclusive gallery media, authorized private room links, and VIP-style chat entry tailored to ${model.name}'s live brand.`,
    variantIdx === 0
      ? `Long-tail focus: "${model.name} nude live cam", "${ethnicity} private show", "${model.name} VIP chat" — this official permalink consolidates crawlable metadata, trait filters, and Streamate room access on NaughtyXXXCams.`
      : variantIdx === 1
        ? `Search intent coverage: watch ${model.name} live, ${ethnicity} HD sex cam, exclusive pics pack, and 1-on-1 adult chat — structured for CTR with verified traits (${traitsList}).`
        : `${model.name}'s NaughtyXXXCams profile targets direct discovery: live nude webcam, private VIP session keywords, and ${ethnicity} category long-tail without duplicating third-party directory titles.`,
  ];

  const longDescription = [
    visibleHeading,
    ...visibleParagraphs,
    `Canonical slug: /profile/${model.profileSlug}.`,
  ].join(" ");

  const highlightKeywords = [
    `${model.name} live cam`,
    `${ethnicity} nude webcam`,
    "private VIP chat",
    "exclusive gallery pack",
    ...tags.slice(0, 4),
  ];

  return {
    title: title.slice(0, 120),
    intro,
    longDescription,
    metaDescription,
    visibleHeading,
    visibleParagraphs,
    highlightKeywords,
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
