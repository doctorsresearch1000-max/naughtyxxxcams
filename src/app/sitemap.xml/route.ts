import { buildSitemapIndexEntries } from "@/lib/sitemap/buildSitemapIndex";
import { renderSitemapIndexXml } from "@/lib/sitemap/renderSitemapXml";

export const revalidate = 3600;

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control":
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
} as const;

/**
 * Sitemap index: explore hub + chunked profile urlsets.
 * Explicit route for OpenNext / Cloudflare Workers.
 */
export async function GET(): Promise<Response> {
  const entries = await buildSitemapIndexEntries();
  const xml = renderSitemapIndexXml(entries);

  return new Response(xml, {
    status: 200,
    headers: XML_HEADERS,
  });
}
