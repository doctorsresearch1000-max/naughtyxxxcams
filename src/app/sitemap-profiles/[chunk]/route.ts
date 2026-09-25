import { buildProfileSitemapChunkEntries } from "@/lib/sitemap/buildProfileSitemap";
import { renderSitemapXml } from "@/lib/sitemap/renderSitemapXml";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control":
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
} as const;

type RouteContext = {
  params: Promise<{ chunk: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { chunk } = await context.params;
  const chunkIndex = Number.parseInt(chunk, 10);
  if (!Number.isFinite(chunkIndex) || chunkIndex < 0) {
    return new Response("Invalid chunk", { status: 400 });
  }

  const entries = await buildProfileSitemapChunkEntries(chunkIndex);
  const xml = renderSitemapXml(entries);

  return new Response(xml, {
    status: 200,
    headers: XML_HEADERS,
  });
}
