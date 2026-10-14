import { cache } from "react";
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
import { isLanguageMetaTag } from "@/lib/media/performerCardMeta";
import { performerProfileSlug } from "@/lib/profile/performerHandle";
import { sanitizeProfileTraits } from "@/lib/profile/validateProfileTraits";

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
  /** True when Crak/Streamate lookup failed — static pSEO shell. */
  catalogFallback?: boolean;
};

const FALLBACK_AVATAR = "/icon.png";

function slugToPresentableName(slug: string): string {
  const parts = slug.split("-").filter(Boolean);
  if (parts.length === 0) return "Model";
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildFallbackPerformerStub(
  slug: string,
  name: string,
): CrackPerformer {
  return {
    name,
    nameClean: name,
    itemId: slug,
    live: false,
    characteristic: {
      languages: ["English"],
      country: "INT",
      ethnicities: ["International"],
      bodyTypes: ["Alluring"],
    },
  };
}

/** Static profile shell when performers-ext has no row for this slug. */
export function buildCatalogFallbackProfile(
  handleParam: string,
): ModelProfileView | null {
  const slug = performerProfileSlug(handleParam);
  if (!slug) return null;

  const name = slugToPresentableName(slug);
  const traits = sanitizeProfileTraits(
    ["live cam", "HD stream", "international", "streamate"],
    { profileSlug: slug },
  );
  const traitSlugs = traits
    .map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ""))
    .filter(Boolean);
  const stub = buildFallbackPerformerStub(slug, name);
  const avatar = FALLBACK_AVATAR;
  const gallery = [avatar];

  return {
    name,
    displayName: name.toUpperCase(),
    handle: `@${slug}`,
    profileSlug: slug,
    status: "offline",
    platform: "streamate",
    bodyType: "Alluring",
    language: "English",
    country: "INT",
    avatar,
    bannerUrl: avatar,
    gallery,
    galleryItems: buildGalleryItems(gallery, traits),
    traits,
    traitSlugs,
    aboutCards: buildAboutCards(stub, traits),
    followersLabel: "Catalog",
    badges: [],
    bio: `${name} on NaughtyXxxCams — browse photos, traits, and live cam discovery. Check back for HD stream availability.`,
    crakLandingId: resolveWidgetLandingId(),
    affiliateUrl: buildModelAffiliateUrl(stub),
    catalogFallback: true,
  };
}

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
    if (isLanguageMetaTag(t) || /^f$/i.test(t)) continue;
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
  const slug =
    handleSlug ||
    performerProfileSlug(p.nameClean || p.name) ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const traits = sanitizeProfileTraits(collectTraits(p), {
    profileSlug: slug,
  });
  const avatar = pickCoverUrl(p) ?? "";
  const bannerUrl = pickProfileBannerUrl(p) ?? avatar;
  const thumb = p.thumbnailUrl?.trim();
  const snap = p.liveSnapshotURL?.trim();
  const gallery = dedupeImageUrls(
    [bannerUrl, avatar, thumb, snap].filter(
      (url): url is string => typeof url === "string" && url.length > 0,
    ),
  );

  const landingId = resolveWidgetLandingId();

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
    bio: `Hey! I'm ${name}. I love going live, chatting with you, and creating unique moments in my Streamate room. Come say hi 💚`,
    crakLandingId: landingId,
    affiliateUrl: buildModelAffiliateUrl(p),
    performer: p,
  };
}

async function resolveModelProfileUncached(
  handleParam: string,
): Promise<ModelProfileView | null> {
  const slug = performerProfileSlug(handleParam) ?? "";
  if (!slug) return null;

  try {
    const match = await findPerformerByProfileSlug(slug);
    if (match) {
      return toViewModel(match, slug);
    }
  } catch {
    /* upstream timeout / network — serve catalog fallback */
  }

  return buildCatalogFallbackProfile(handleParam);
}

/** Deduped per request (generateMetadata + page). */
export const resolveModelProfile = cache(resolveModelProfileUncached);
