import type { MetadataRoute } from "next";
import { EXPLORE_CATEGORY_SLUGS } from "@/lib/explore/categorySlugs";
import { collectPerformerProfileSlugs } from "@/lib/sitemap/performerSlugs";
import { LEGAL_PAGE_PATHS } from "@/lib/site/legalContact";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
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
    ...LEGAL_PAGE_PATHS.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];

  const categoryRoutes: MetadataRoute.Sitemap = EXPLORE_CATEGORY_SLUGS.map(
    (cat) => ({
      url: `${baseUrl}/explore?cat=${cat}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    }),
  );

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
