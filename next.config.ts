import type { NextConfig } from "next";
import { EXPLORE_CATEGORY_SLUGS } from "./src/lib/explore/categorySlugs";
import {
  API_ROUTE_CACHE_CONTROL,
  PROFILE_PAGE_CACHE_CONTROL,
} from "./src/lib/http/profilePageCache";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: API_ROUTE_CACHE_CONTROL,
          },
        ],
      },
      {
        source: "/profile/:handle((?!playlists)[^/]+)",
        headers: [
          {
            key: "Cache-Control",
            value: PROFILE_PAGE_CACHE_CONTROL,
          },
          {
            key: "CDN-Cache-Control",
            value: PROFILE_PAGE_CACHE_CONTROL,
          },
        ],
      },
      {
        source: "/profile/:handle((?!playlists)[^/]+)/:intent",
        headers: [
          {
            key: "Cache-Control",
            value: PROFILE_PAGE_CACHE_CONTROL,
          },
          {
            key: "CDN-Cache-Control",
            value: PROFILE_PAGE_CACHE_CONTROL,
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
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
        source: "/:path*",
        has: [{ type: "host", value: "www.naughtyxxxcams.com" }],
        destination: "https://naughtyxxxcams.com/:path*",
        permanent: true,
      },
      {
        source: "/sitemap",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/telegram",
        destination: "/profile",
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
        hostname: "**.icfcdn.com",
      },
      {
        protocol: "https",
        hostname: "hybridclient.naiadsystems.com",
      },
      {
        protocol: "https",
        hostname: "www.imglnky.com",
      },
    ],
  },
};

export default nextConfig;
