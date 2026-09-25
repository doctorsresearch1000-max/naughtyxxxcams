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

function primaryEthnicity(traits: string[], explicit?: string): string {
  if (explicit?.trim()) return explicit.trim();
  const fromTraits = traits.find((t) =>
    /latina|asian|ebony|caucasian|hispanic|indian|arab/i.test(t),
  );
  return fromTraits?.trim() || "International";
}

function topTags(traits: string[], limit = 4): string[] {
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

export function generateUniqueSEOContent(model: ModelSEOInput) {
  const ethnicity = primaryEthnicity(model.traits, model.ethnicity);
  const country = formatCountry(model.country);
  const tags = topTags(model.traits);
  const tagPhrase = tags.length > 0 ? tags.join(", ") : "live cam, chat";
  const agePart =
    typeof model.age === "number" && model.age >= 18
      ? `${model.age} `
      : "";
  const liveLabel = model.status === "live" ? "Live Now" : "Profile";
  const regionPart = country ? `${country} · ` : "";

  const title = `${model.name}${agePart ? `, ${model.age}` : ""} — ${ethnicity} ${liveLabel} Streamate Room | NaughtyXXXCams`;

  const intro = `${regionPart}${model.name} (${model.handle}) on NaughtyXXXCams: ${ethnicity} Streamate performer, ${model.language}, ${model.bodyType}. Tags: ${tagPhrase}. Verified gallery, traits, and authorized room links — save this profile for ${liveLabel.toLowerCase()} alerts.`;

  const traitsList = model.traits.join(", ");

  const longDescription = `${model.name} is a verified Streamate performer profile on NaughtyXXXCams (${model.profileSlug}). Attributes include ${ethnicity}${country ? `, based in ${country}` : ""}, languages: ${model.language}, body type: ${model.bodyType}${typeof model.age === "number" ? `, age ${model.age}` : ""}. Discovery tags: ${traitsList}. This permalink consolidates live status, gallery media, and partner chat entry points in one crawlable hub.`;

  return {
    title,
    intro,
    longDescription,
    metaDescription: intro.slice(0, 160),
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
