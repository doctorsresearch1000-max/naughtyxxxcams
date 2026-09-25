import type { CrackPerformer } from "@/lib/crackrevenue/api";

/** API tag fields only — excludes hair/body to avoid false category matches. */
export function performerApiTags(performer: CrackPerformer): string[] {
  return [
    ...(performer.autoTags ?? []),
    ...(performer.characteristicsTags ?? []),
    ...(performer.customTags ?? []),
  ]
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

export function performerTagBlob(performer: CrackPerformer): string {
  return performerApiTags(performer).join(" ");
}

export function tagIncludes(performer: CrackPerformer, needle: string): boolean {
  const n = needle.toLowerCase();
  return performerApiTags(performer).some(
    (t) => t === n || t.includes(n) || n.includes(t),
  );
}

export function ethnicityIncludes(
  performer: CrackPerformer,
  fragment: string,
): boolean {
  const f = fragment.toLowerCase();
  return (performer.characteristic?.ethnicities ?? []).some((e) =>
    e.toLowerCase().includes(f),
  );
}

export function hairColorMatches(
  performer: CrackPerformer,
  ...variants: string[]
): boolean {
  const hair = performer.characteristic?.hairColor?.toLowerCase() ?? "";
  if (!hair) return false;
  return variants.some((v) => hair.includes(v.toLowerCase()));
}

export function bodyTypeMatches(
  performer: CrackPerformer,
  fragment: string,
): boolean {
  const f = fragment.toLowerCase();
  return (performer.characteristic?.bodyTypes ?? []).some((b) =>
    b.toLowerCase().includes(f),
  );
}

export function performerLanguages(performer: CrackPerformer): string[] {
  return (performer.characteristic?.languages ?? []).map((l) =>
    l.toLowerCase(),
  );
}

export function languageMatchesCode(
  performer: CrackPerformer,
  code: "en" | "es" | "fr",
): boolean {
  const langs = performerLanguages(performer);
  if (langs.length === 0) return false;

  const aliases: Record<string, string[]> = {
    en: ["en", "english", "eng"],
    es: ["es", "spanish", "esp", "spa"],
    fr: ["fr", "french", "fra"],
  };

  const wanted = aliases[code];
  return langs.some((l) =>
    wanted.some((w) => l === w || l.startsWith(w) || l.includes(w)),
  );
}

export function performerShortBio(performer: CrackPerformer): string {
  const name = performer.nameClean || performer.name || "This model";
  const age = performer.characteristic?.age;
  const lang = performer.characteristic?.languages?.[0];
  const bits = [
    age ? `${age} yrs` : null,
    lang ? `Speaks ${lang}` : null,
    performer.live !== false ? "Live now on Streamate" : null,
  ].filter(Boolean);
  return `Hey — I'm ${name}. ${bits.join(" · ")}. Tap chat when you're ready to go private.`;
}

export function performerDisplayTags(performer: CrackPerformer): string[] {
  const fromApi = performerApiTags(performer).slice(0, 8);
  const eth = performer.characteristic?.ethnicities?.[0];
  if (eth && !fromApi.includes(eth.toLowerCase())) {
    fromApi.unshift(eth.toLowerCase());
  }
  return fromApi;
}
