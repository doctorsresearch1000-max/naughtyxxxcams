import type { NextConfig } from "next";
import { EXPLORE_CATEGORY_SLUGS } from "./src/lib/explore/categorySlugs";

const nextConfig: NextConfig = {
  async redirects() {
    const legacyExploreCategoryRedirects = EXPLORE_CATEGORY_SLUGS.map(
      (slug) => ({
        source: "/explore",
        has: [{ type: "query", key: "cat", value: slug }],
        destination: `/explore/${slug}`,
        permanent: true,
      }),
    );

    return [
      {
        source: "/sitemap",
        destination: "/sitemap.xml",
        permanent: true,
      },
      ...legacyExploreCategoryRedirects,
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemap-profiles.xml",
        destination: "/sitemap-profiles/0",
      },
      {
        source: "/sitemap-profiles-:chunk.xml",
        destination: "/sitemap-profiles/:chunk",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "imagetransform.icfcdn.com",
      },
      {
        protocol: "https",
        hostname: "www.imglnky.com",
      },
    ],
  },
};

export default nextConfig;
