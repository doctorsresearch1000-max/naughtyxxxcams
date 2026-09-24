import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
