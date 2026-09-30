import type { ExploreCategoryConfig } from "@/lib/explore/categorySlugs";
import { pickVariant } from "@/lib/seo/seoVariants";
import {
  normalizeSeoDescription,
  normalizeSeoTitle,
} from "@/lib/seo/metadataHelpers";

const DEFAULT_TITLE_VARIANTS = [
  "Live Cam Models & HD Shows",
  "Discover Adult Webcam Models",
  "Browse Verified Live Cams",
] as const;

const DEFAULT_DESC_VARIANTS = [
  "Browse trending live cam models in HD, filter by category, and open official Streamate rooms from NaughtyXxxCams.",
  "Mobile-first discovery for adult webcam shows: verified performers, category hubs, and saved favorites.",
  "Find live nude cams and private chat entry points on NaughtyXxxCams — complementary Streamate directory.",
] as const;

export type ExploreSeoCopy = {
  title: string;
  description: string;
  h1: string;
  bodyBlurb: string;
};

export function generateExploreSeoCopy(
  category: ExploreCategoryConfig | null,
): ExploreSeoCopy {
  if (!category) {
    const seed = "explore-default";
    const title = normalizeSeoTitle(
      pickVariant(seed, DEFAULT_TITLE_VARIANTS),
    );
    return {
      title,
      description: normalizeSeoDescription(
        pickVariant(seed, DEFAULT_DESC_VARIANTS),
      ),
      h1: "Explore Live Cam Models",
      bodyBlurb:
        "Welcome to the NaughtyXxxCams discovery hub. Scroll live performers, filter by tags and categories, and open HD Streamate rooms in one tap. Save favorites on your profile and return when models go online. All listings link to authorized partner rooms with age-verified 18+ performers.",
    };
  }

  const seed = `explore-cat-${category.slug}`;
  const title = normalizeSeoTitle(
    category.seoTitle.replace(/\s*\|\s*NaughtyXXXCams\s*$/i, "").trim() ||
      `${category.label} Live Cams`,
  );
  const description = normalizeSeoDescription(
    `${category.seoDescription} Browse ${category.label.toLowerCase()} models streaming now on NaughtyXxxCams.`,
  );

  const labelLower = category.label.toLowerCase();
  const bodyBlurb = `Welcome to the ${category.label} live cams section on NaughtyXxxCams. Here you can browse ${labelLower} performers currently streaming in HD, compare traits and gallery previews, and jump into public chat or private shows through official Streamate links. Use filters and tags to narrow results, follow models you like, and check back when new ${labelLower} talent goes live. ${category.seoDescription}`;

  return {
    title,
    description,
    h1: `Explore ${category.label} Cams`,
    bodyBlurb,
  };
}
