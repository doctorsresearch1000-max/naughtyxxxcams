import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { pickCoverUrl } from "@/lib/crackrevenue/api";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";
import { imageUrlBaseKey } from "@/lib/media/imageDedupe";
import { performerProfileSlug } from "@/lib/profile/performerHandle";

export type AboutCard = {
  label: string;
  value: string;
  span: "full" | "half";
};

export type GalleryMediaItem = {
  id: string;
  src: string;
  viewsLabel: string;
  locked: boolean;
  tags: string[];
};

export type RecommendedProfile = {
  name: string;
  slug: string;
  avatar: string;
  countryCode: string;
  live: boolean;
  profilePath: string;
  affiliateUrl: string;
};

const ZODIAC_TAGS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

function formatViews(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const n = 12_000 + Math.abs(hash % 980_000);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatHeight(raw?: string): string {
  if (!raw?.trim()) return "—";
  const inches = Number.parseInt(raw, 10);
  if (!Number.isFinite(inches) || inches < 48 || inches > 84) return raw;
  const feet = Math.floor(inches / 12);
  const rem = inches % 12;
  const cm = Math.round(inches * 2.54);
  return `${feet}' ${rem}" (${cm}cm)`;
}

function findZodiac(tags: string[]): string | null {
  const lower = tags.map((t) => t.toLowerCase());
  return ZODIAC_TAGS.find((z) => lower.some((t) => t.includes(z))) ?? null;
}

function ageRange(age?: number): string {
  if (age == null) return "18+";
  if (age <= 19) return "18-19";
  if (age <= 29) return "20-29";
  if (age <= 39) return "30-39";
  if (age <= 49) return "40-49";
  return "50+";
}

function slugifyTag(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function buildAboutCards(
  performer: CrackPerformer,
  traits: string[],
): AboutCard[] {
  const c = performer.characteristic;
  const interests = traits.slice(0, 8).join(", ");
  const languages = c?.languages?.join(", ") ?? "English";
  const zodiac = findZodiac(traits);

  const grid: AboutCard[] = [
    { label: "Intereses", value: interests || "Live cam, chat privado", span: "full" },
    { label: "Idiomas", value: languages, span: "full" },
    { label: "Altura", value: formatHeight(c?.height), span: "half" },
    { label: "Zodiaco", value: zodiac ? capitalize(zodiac) : "—", span: "half" },
    { label: "Tipo de cuerpo", value: c?.bodyTypes?.[0] ?? "—", span: "half" },
    {
      label: "Tamaño de pecho",
      value: c?.bustSize ?? "—",
      span: "half",
    },
    { label: "Etnicidad", value: c?.ethnicities?.[0] ?? "—", span: "half" },
    { label: "Rango de edad", value: ageRange(c?.age), span: "half" },
  ];

  return grid;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function buildGalleryItems(
  gallery: string[],
  traits: string[],
): GalleryMediaItem[] {
  const tagSlugs = traits
    .map(slugifyTag)
    .filter((t) => t.length > 2)
    .slice(0, 12);

  const seen = new Set<string>();
  const sources: string[] = [];
  for (const raw of gallery) {
    const src = raw?.trim();
    if (!src) continue;
    const key = imageUrlBaseKey(src);
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push(src);
  }

  return sources.slice(0, 12).map((src, i) => ({
    id: `${imageUrlBaseKey(src)}-${i}`,
    src,
    viewsLabel: formatViews(`${src}-${i}`),
    locked: i > 0 && i % 3 === 2,
    tags: tagSlugs,
  }));
}

export function buildFollowersLabel(performer: CrackPerformer): string {
  const score = performer.systemScore ?? 0;
  const base = 18_000 + Math.round(score * 240_000);
  if (base >= 1_000_000) return `${(base / 1_000_000).toFixed(1)}M`;
  if (base >= 10_000) return `${(base / 1000).toFixed(1)}K`;
  return `${(base / 1000).toFixed(1)}K`;
}

export function buildProfileBadges(performer: CrackPerformer): string[] {
  const badges: string[] = [];
  if ((performer.systemScore ?? 0) > 0.85) badges.push("POPULAR PICK");
  if ((performer.stars ?? 0) >= 4 || (performer.systemScore ?? 0) > 0.92) {
    badges.push("BEST SELLER");
  }
  if (performer.live) badges.push("LIVE NOW");
  return badges.slice(0, 2);
}

export function toRecommendedProfile(
  performer: CrackPerformer,
): RecommendedProfile | null {
  const slug = performerProfileSlug(performer.nameClean || performer.name);
  if (!slug) return null;
  const avatar = pickCoverUrl(performer);
  if (!avatar) return null;
  return {
    name: performer.nameClean || performer.name || slug,
    slug,
    avatar,
    countryCode: performer.characteristic?.country ?? "INT",
    live: performer.live !== false,
    profilePath: `/profile/${slug}`,
    affiliateUrl: buildModelAffiliateUrl(performer),
  };
}
