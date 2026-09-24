import type { MetadataRoute } from "next";
import { collectPerformerProfileSlugs } from "@/lib/sitemap/performerSlugs";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";

export const revalidate = 3600;

const EXPLORE_CATEGORY_SLUGS = [
  "latinas",
  "verified",
  "milf",
  "petite",
  "cosplay",
  "couples",
  "trans",
  "alt",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/following`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/telegram`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap =
    EXPLORE_CATEGORY_SLUGS.map((cat) => ({
      url: `${baseUrl}/explore?cat=${cat}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    }));

  let profileRoutes: MetadataRoute.Sitemap = [];

  try {
    const slugs = await collectPerformerProfileSlugs();
    profileRoutes = slugs.map((slug) => ({
      url: `${baseUrl}/profile/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75,
    }));
  } catch {
    profileRoutes = [];
  }

  return [...staticRoutes, ...categoryRoutes, ...profileRoutes];
}
