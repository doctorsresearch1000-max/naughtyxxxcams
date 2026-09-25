import { buildExploreSitemapEntries } from "@/lib/sitemap/buildExploreSitemap";
import { renderSitemapXml } from "@/lib/sitemap/renderSitemapXml";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control":
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
} as const;

export async function GET(): Promise<Response> {
  const entries = buildExploreSitemapEntries();
  const xml = renderSitemapXml(entries);

  return new Response(xml, {
    status: 200,
    headers: XML_HEADERS,
  });
}
