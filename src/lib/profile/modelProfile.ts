import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  pickCoverUrl,
  pickProfileBannerUrl,
} from "@/lib/crackrevenue/api";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";
import { findPerformerByProfileSlug } from "@/lib/crackrevenue/performerLookup";
import { resolveWidgetLandingId } from "@/lib/crackrevenue/config";
import {
  buildAboutCards,
  buildFollowersLabel,
  buildGalleryItems,
  buildProfileBadges,
  type AboutCard,
  type GalleryMediaItem,
} from "@/lib/profile/profilePresentation";
import { dedupeImageUrls } from "@/lib/media/imageDedupe";
import { performerProfileSlug } from "@/lib/profile/performerHandle";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&q=80";

export type ModelProfileView = {
  name: string;
  displayName: string;
  handle: string;
  profileSlug: string;
  status: "live" | "offline";
  platform: string;
  age?: number;
  bodyType: string;
  language: string;
  country: string;
  avatar: string;
  bannerUrl: string;
  gallery: string[];
  galleryItems: GalleryMediaItem[];
  traits: string[];
  traitSlugs: string[];
  aboutCards: AboutCard[];
  followersLabel: string;
  badges: string[];
  bio: string;
  crakLandingId: string;
  affiliateUrl: string;
  performer?: CrackPerformer;
};

function displayName(p: CrackPerformer): string {
  if (p.nameClean?.trim()) return p.nameClean.trim();
  if (p.name?.trim()) return p.name.trim();
  return "Model";
}

function collectTraits(p: CrackPerformer): string[] {
  const buckets = [
    ...(p.characteristicsTags ?? []),
    ...(p.autoTags ?? []),
    ...(p.customTags ?? []),
    ...(p.characteristic?.ethnicities ?? []),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of buckets) {
    const t = tag?.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out.length > 0 ? out : ["live cam", "verified", "streamate"];
}

function inferBodyType(p: CrackPerformer, traits: string[]): string {
  const fromApi = p.characteristic?.bodyTypes?.[0];
  if (fromApi?.trim()) return fromApi.trim();

  const lower = traits.map((t) => t.toLowerCase());
  if (lower.some((t) => t.includes("curvy") || t.includes("bbw"))) {
    return "Curvaceous";
  }
  if (lower.some((t) => t.includes("petite") || t.includes("skinny"))) {
    return "Petite";
  }
  if (lower.some((t) => t.includes("athletic") || t.includes("muscular"))) {
    return "Athletic";
  }
  return "Alluring";
}

function toViewModel(
  p: CrackPerformer,
  handleSlug: string,
): ModelProfileView {
  const name = displayName(p);
  const traits = collectTraits(p);
  const avatar = pickCoverUrl(p) ?? FALLBACK_AVATAR;
  const bannerUrl = pickProfileBannerUrl(p) ?? avatar;
  const thumb = p.thumbnailUrl?.trim();
  const snap = p.liveSnapshotURL?.trim();
  const gallery = dedupeImageUrls(
    [bannerUrl, avatar, thumb, snap].filter(
      (url): url is string => typeof url === "string" && url.length > 0,
    ),
  );

  const landingId = resolveWidgetLandingId();
  const slug =
    handleSlug ||
    performerProfileSlug(p.nameClean || p.name) ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, "");

  const traitSlugs = traits
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ""))
    .filter(Boolean);

  return {
    name,
    displayName: name.toUpperCase(),
    handle: `@${slug}`,
    profileSlug: slug,
    status: p.live === false ? "offline" : "live",
    platform: "streamate",
    age: p.characteristic?.age,
    bodyType: inferBodyType(p, traits),
    language: p.characteristic?.languages?.[0] ?? "English",
    country: p.characteristic?.country ?? "INT",
    avatar,
    bannerUrl,
    gallery: gallery.length > 0 ? gallery : [avatar],
    galleryItems: buildGalleryItems(
      gallery.length > 0 ? gallery : [avatar],
      traits,
    ),
    traits,
    traitSlugs,
    aboutCards: buildAboutCards(p, traits),
    followersLabel: buildFollowersLabel(p),
    badges: buildProfileBadges(p),
    bio: `¡Hola! Soy ${name}. Me encanta conectar en vivo, charlar contigo y crear momentos únicos en mi sala Streamate. ¿Entras? 💚`,
    crakLandingId: landingId,
    affiliateUrl: buildModelAffiliateUrl(p),
    performer: p,
  };
}

export async function resolveModelProfile(
  handleParam: string,
): Promise<ModelProfileView | null> {
  const slug = performerProfileSlug(handleParam) ?? "";
  if (!slug) return null;

  const match = await findPerformerByProfileSlug(slug);
  if (!match) return null;

  return toViewModel(match, slug);
}
