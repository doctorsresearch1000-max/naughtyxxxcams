import type { Metadata } from "next";
import { profileCanonicalUrl } from "@/lib/seo/canonical";
import { pickVariant } from "@/lib/seo/seoVariants";
import {
  INDEXABLE_ROBOTS,
  NOINDEX_ROBOTS,
  normalizeSeoDescription,
  normalizeSeoTitle,
  SEO_DESCRIPTION_MAX_LEN,
  SEO_TITLE_MAX_LEN,
} from "@/lib/seo/metadataHelpers";

/** Max recommended length for SERP titles (programmatic trim). */
export const MODEL_PROFILE_TITLE_MAX = SEO_TITLE_MAX_LEN;

/** Meta description soft cap. */
export const MODEL_PROFILE_DESCRIPTION_MAX = SEO_DESCRIPTION_MAX_LEN;

export const PROFILE_INTENT_ROUTES = ["vip", "leaks"] as const;
export type ProfileIntentRoute = (typeof PROFILE_INTENT_ROUTES)[number];

export type ModelProfileSeoModel = {
  name: string;
  /** Display handle, with or without leading `@`. */
  handle: string;
  profileSlug: string;
  status?: "live" | "offline";
};

export function isProfileIntentRoute(
  value: string | undefined | null,
): value is ProfileIntentRoute {
  if (!value) return false;
  return (PROFILE_INTENT_ROUTES as readonly string[]).includes(
    value.toLowerCase(),
  );
}

export function isModelProfileLive(model: ModelProfileSeoModel): boolean {
  return model.status !== "offline";
}

function atUsername(handle: string): string {
  const clean = handle.trim().replace(/^@+/, "");
  return clean ? `@${clean}` : "@model";
}

function bareUsername(handle: string): string {
  return handle.trim().replace(/^@+/, "") || "model";
}

function fillSeoTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, value);
  }
  return out.replace(/\s+/g, " ").trim();
}

/** Guaranteed SERP-safe fallback when templates or API data are thin. */
export function buildModelProfileFallbackTitle(model: ModelProfileSeoModel): string {
  const name = model.name.trim() || bareUsername(model.handle);
  return normalizeSeoTitle(`${name} Live Cam & Profile — NaughtyXxxCams`);
}

export function buildModelProfileFallbackDescription(
  model: ModelProfileSeoModel,
): string {
  const name = model.name.trim() || bareUsername(model.handle);
  return normalizeSeoDescription(
    `Watch ${name} live on NaughtyXxxCams. View photos, bio, and live stream schedule.`,
  );
}

/** @deprecated use normalizeSeoTitle */
export function truncateModelProfileTitle(
  title: string,
  max = MODEL_PROFILE_TITLE_MAX,
): string {
  return normalizeSeoTitle(title, { max });
}

const LIVE_TITLE_TEMPLATES = [
  "{name} Live Cam & Profile — NaughtyXxxCams",
  "{name} Live Now — HD Cam & Chat",
  "Watch {name} Live — Cam Profile",
] as const;

const OFFLINE_TITLE_TEMPLATES = [
  "{name} Cam Profile & Gallery — NaughtyXxxCams",
  "{name} Photos & Live Alerts — NaughtyXxxCams",
] as const;

const LIVE_DESCRIPTION_TEMPLATES = [
  "Watch {name} live on NaughtyXxxCams. View photos, bio, and live stream schedule.",
  "{name} ({handle}) streams in HD on NaughtyXxxCams — public chat, traits, and official room links.",
  "Free live cam profile for {name} ({handle}) with gallery, bio, and Streamate room access.",
] as const;

const OFFLINE_DESCRIPTION_TEMPLATES = [
  "Browse {name} ({handle}) photos and profile on NaughtyXxxCams. Get alerts when she goes live.",
  "{name}'s official hub ({handle}) — gallery, traits, and HD cam metadata on NaughtyXxxCams.",
] as const;

const VIP_TITLE_SUFFIX = " — VIP Access";
const LEAKS_TITLE_SUFFIX = " — Media Hub";

function intentTitleSuffix(intent: ProfileIntentRoute | null): string {
  if (intent === "vip") return VIP_TITLE_SUFFIX;
  if (intent === "leaks") return LEAKS_TITLE_SUFFIX;
  return "";
}

export function buildModelProfileSeoTitle(
  model: ModelProfileSeoModel,
  intent: ProfileIntentRoute | null = null,
): string {
  const seed = model.profileSlug || bareUsername(model.handle);
  const handle = atUsername(model.handle);
  const name = model.name.trim() || bareUsername(model.handle);
  const vars = { name, handle };

  let base: string;
  try {
    base = isModelProfileLive(model)
      ? fillSeoTemplate(
          pickVariant(`${seed}-live-title`, LIVE_TITLE_TEMPLATES),
          vars,
        )
      : fillSeoTemplate(
          pickVariant(`${seed}-offline-title`, OFFLINE_TITLE_TEMPLATES),
          vars,
        );
  } catch {
    base = buildModelProfileFallbackTitle(model);
  }

  if (!base.trim()) {
    base = buildModelProfileFallbackTitle(model);
  }

  const withIntent = intent
    ? `${base}${intentTitleSuffix(intent)}`.replace(/\s+/g, " ").trim()
    : base;

  return normalizeSeoTitle(withIntent);
}

export function buildModelProfileSeoDescription(
  model: ModelProfileSeoModel,
  intent: ProfileIntentRoute | null = null,
): string {
  const seed = model.profileSlug || bareUsername(model.handle);
  const handle = atUsername(model.handle);
  const name = model.name.trim() || bareUsername(model.handle);
  const vars = { name, handle };

  let description: string;
  try {
    description = isModelProfileLive(model)
      ? fillSeoTemplate(
          pickVariant(`${seed}-live-desc`, LIVE_DESCRIPTION_TEMPLATES),
          vars,
        )
      : fillSeoTemplate(
          pickVariant(`${seed}-offline-desc`, OFFLINE_DESCRIPTION_TEMPLATES),
          vars,
        );
  } catch {
    description = buildModelProfileFallbackDescription(model);
  }

  if (!description.trim()) {
    description = buildModelProfileFallbackDescription(model);
  }

  if (intent === "vip") {
    description = `${description} VIP private room options via the official profile.`;
  } else if (intent === "leaks") {
    description = `${description} Gallery highlights; see canonical profile for primary SEO.`;
  }

  return normalizeSeoDescription(description);
}

export function buildModelProfileRobots(
  intent: ProfileIntentRoute | null,
): Metadata["robots"] {
  if (intent === "vip" || intent === "leaks") {
    return { index: false, follow: true };
  }
  return { ...INDEXABLE_ROBOTS };
}

export function buildModelProfileNextMetadata(
  model: ModelProfileSeoModel,
  options?: {
    intent?: ProfileIntentRoute | null;
    bannerUrl?: string | null;
  },
): Metadata {
  const intent = options?.intent ?? null;
  const canonical = profileCanonicalUrl(model.profileSlug);
  const title = buildModelProfileSeoTitle(model, intent);
  const description = buildModelProfileSeoDescription(model, intent);

  return {
    title: { absolute: title },
    description,
    robots: buildModelProfileRobots(intent),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: options?.bannerUrl?.trim()
        ? [{ url: options.bannerUrl.trim() }]
        : undefined,
    },
  };
}

export function buildModelProfileNotFoundMetadata(): Metadata {
  return {
    title: { absolute: "Model Profile Not Found — NaughtyXxxCams" },
    description:
      "This performer profile is unavailable. Browse live models on NaughtyXxxCams.",
    robots: { ...NOINDEX_ROBOTS },
  };
}
