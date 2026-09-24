import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  fetchStreamatePerformers,
  pickCoverUrl,
} from "@/lib/crackrevenue/api";
import { resolveWidgetLandingId } from "@/lib/crackrevenue/config";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&q=80";

export type ModelProfileView = {
  name: string;
  handle: string;
  status: "live" | "offline";
  platform: string;
  age?: number;
  bodyType: string;
  language: string;
  country: string;
  avatar: string;
  gallery: string[];
  traits: string[];
  crakLandingId: string;
  affiliateUrl: string;
  performer?: CrackPerformer;
};

function slugifyHandle(raw: string): string {
  return decodeURIComponent(raw)
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function performerSlug(p: CrackPerformer): string {
  const base = p.nameClean || p.name || "";
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "");
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
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out.length > 0 ? out : ["live cam", "verified", "streamate"];
}

function inferBodyType(traits: string[]): string {
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

function buildAffiliateUrl(landingId: string): string {
  return `https://go.crakrevenue.com/?landing_id=${encodeURIComponent(landingId)}`;
}

function toViewModel(
  p: CrackPerformer,
  handleSlug: string,
): ModelProfileView {
  const name = displayName(p);
  const traits = collectTraits(p);
  const avatar = pickCoverUrl(p) ?? FALLBACK_AVATAR;
  const thumb = p.thumbnailUrl?.trim();
  const snap = p.liveSnapshotURL?.trim();
  const gallery = Array.from(
    new Set(
      [avatar, thumb, snap].filter(
        (url): url is string => typeof url === "string" && url.length > 0,
      ),
    ),
  );

  const landingId = resolveWidgetLandingId();

  return {
    name,
    handle: `@${handleSlug || performerSlug(p)}`,
    status: p.live === false ? "offline" : "live",
    platform: "streamate",
    bodyType: inferBodyType(traits),
    language: "English",
    country: "INT",
    avatar,
    gallery: gallery.length > 0 ? gallery : [avatar],
    traits,
    crakLandingId: landingId,
    affiliateUrl: buildAffiliateUrl(landingId),
    performer: p,
  };
}

export async function resolveModelProfile(
  handleParam: string,
): Promise<ModelProfileView | null> {
  const slug = slugifyHandle(handleParam);
  if (!slug) return null;

  const { performers } = await fetchStreamatePerformers({
    live: true,
    size: 100,
    page: 1,
  });

  let match =
    performers.find((p) => performerSlug(p) === slug) ??
    performers.find((p) => performerSlug(p).includes(slug)) ??
    performers.find((p) => slug.includes(performerSlug(p)));

  if (!match) {
    const offline = await fetchStreamatePerformers({
      live: false,
      size: 100,
      page: 1,
    });
    const pool = offline.performers;
    match =
      pool.find((p) => performerSlug(p) === slug) ??
      pool.find((p) => performerSlug(p).includes(slug)) ??
      pool.find((p) => slug.includes(performerSlug(p)));
  }

  if (!match) return null;

  return toViewModel(match, slug);
}
