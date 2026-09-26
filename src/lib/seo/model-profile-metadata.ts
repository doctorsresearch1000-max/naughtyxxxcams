import type { Metadata } from "next";
import { profileCanonicalUrl } from "@/lib/seo/canonical";
import { pickVariant } from "@/lib/seo/seoVariants";

/** Max recommended length for SERP titles (programmatic trim). */
export const MODEL_PROFILE_TITLE_MAX = 70;

/** Meta description soft cap. */
export const MODEL_PROFILE_DESCRIPTION_MAX = 160;

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

function currentSeoYear(): string {
  return String(new Date().getFullYear());
}

function atUsername(handle: string): string {
  const clean = handle.trim().replace(/^@+/, "");
  return clean ? `@${clean}` : "@model";
}

function bareUsername(handle: string): string {
  return handle.trim().replace(/^@+/, "") || "model";
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Strict trim for titles (~70 chars) without awkward mid-word cuts when possible. */
export function truncateModelProfileTitle(
  title: string,
  max = MODEL_PROFILE_TITLE_MAX,
): string {
  const normalized = normalizeWhitespace(title);
  if (normalized.length <= max) return normalized;

  const ellipsis = "…";
  const budget = max - ellipsis.length;
  let slice = normalized.slice(0, budget);

  const lastSpace = slice.lastIndexOf(" ");
  const lastDash = slice.lastIndexOf(" - ");
  const breakAt = Math.max(lastDash, lastSpace);
  if (breakAt > budget * 0.55) {
    slice = slice.slice(0, breakAt);
  }

  return `${slice.trim()}${ellipsis}`;
}

function truncateModelProfileDescription(
  description: string,
  max = MODEL_PROFILE_DESCRIPTION_MAX,
): string {
  const normalized = normalizeWhitespace(description);
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}…`;
}

const LIVE_TITLE_TEMPLATES = [
  "🔴 {name} Live Cam Online - Free Broadcast & Chat {handle} {year}",
  "🔴 {name} Live Now — HD Public Cam Room & Free Chat {handle} {year}",
  "🔴 Watch {name} Streaming Live — Interactive Cam & Chat {handle} {year}",
  "🔴 {name} On Air — Free Live Broadcast & Public Chat {handle} {year}",
] as const;

const OFFLINE_TITLE_TEMPLATES = [
  "📸 {name} ({handle}) Telegram Gallery & Updates {year} - Cam HD",
  "📸 {name} ({handle}) Photo Gallery, Telegram & Cam HD {year}",
  "📸 {name} ({handle}) — Telegram Updates & HD Gallery {year}",
] as const;

const LIVE_DESCRIPTION_TEMPLATES = [
  "Watch {name} ({handle}) streaming live on NaughtyXXXCams — free public chat, HD cam room, and real-time interaction. Join the broadcast now.",
  "{name} is live now on NaughtyXXXCams: HD webcam, open chat with viewers, and instant room access via {handle}. Tap in for the interactive show.",
  "Free live cam with {name} ({handle}) — public HD stream, chat-friendly room, and Streamate-powered broadcast on NaughtyXXXCams.",
  "Catch {name} live: interactive webcam, public chat, and HD streaming on NaughtyXXXCams. Official profile for {handle} with room entry in one tap.",
] as const;

const OFFLINE_DESCRIPTION_TEMPLATES = [
  "Browse {name} ({handle}) photos, clips, and Telegram gallery updates on NaughtyXXXCams. HD cam profile, traits, and alerts when she goes live.",
  "{name}'s official hub ({handle}) — curated gallery, video highlights, Telegram-style updates, and Streamate room links on NaughtyXXXCams.",
  "Explore {name} ({handle}): photo gallery, profile media, Telegram updates, and HD cam metadata. Save the profile for live alerts on NaughtyXXXCams.",
] as const;

const VIP_TITLE_SUFFIX = " — VIP Cam Access";
const LEAKS_TITLE_SUFFIX = " — Exclusive Media";

function fillSeoTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, value);
  }
  return normalizeWhitespace(out);
}

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
  const year = currentSeoYear();
  const handle = atUsername(model.handle);
  const vars = {
    name: model.name.trim() || bareUsername(model.handle),
    handle,
    year,
  };

  const base = isModelProfileLive(model)
    ? fillSeoTemplate(pickVariant(`${seed}-live-title`, LIVE_TITLE_TEMPLATES), vars)
    : fillSeoTemplate(
        pickVariant(`${seed}-offline-title`, OFFLINE_TITLE_TEMPLATES),
        vars,
      );

  const withIntent = intent
    ? normalizeWhitespace(`${base}${intentTitleSuffix(intent)}`)
    : base;

  return truncateModelProfileTitle(withIntent);
}

export function buildModelProfileSeoDescription(
  model: ModelProfileSeoModel,
  intent: ProfileIntentRoute | null = null,
): string {
  const seed = model.profileSlug || bareUsername(model.handle);
  const handle = atUsername(model.handle);
  const vars = {
    name: model.name.trim() || bareUsername(model.handle),
    handle,
  };

  let description = isModelProfileLive(model)
    ? fillSeoTemplate(
        pickVariant(`${seed}-live-desc`, LIVE_DESCRIPTION_TEMPLATES),
        vars,
      )
    : fillSeoTemplate(
        pickVariant(`${seed}-offline-desc`, OFFLINE_DESCRIPTION_TEMPLATES),
        vars,
      );

  if (intent === "vip") {
    description = `${description} VIP-style private room entry and premium cam options via the official NaughtyXXXCams profile.`;
  } else if (intent === "leaks") {
    description = `${description} Exclusive gallery highlights and media discovery — indexed only for on-site navigation; see canonical profile for primary SEO.`;
  }

  return truncateModelProfileDescription(description);
}

export function buildModelProfileRobots(
  intent: ProfileIntentRoute | null,
): Metadata["robots"] {
  if (intent === "vip" || intent === "leaks") {
    return { index: false, follow: true };
  }
  return { index: true, follow: true };
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
    title,
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
