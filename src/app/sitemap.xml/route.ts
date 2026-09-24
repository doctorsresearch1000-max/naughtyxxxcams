import { buildSitemapEntries } from "@/lib/sitemap/buildSitemap";
import { renderSitemapXml } from "@/lib/sitemap/renderSitemapXml";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/**
 * Ruta explícita para Cloudflare Workers (OpenNext): garantiza `/sitemap.xml`
 * aunque el metadata route nativo no esté en el manifiesto desplegado.
 */
export async function GET(): Promise<Response> {
  const entries = await buildSitemapEntries();
  const xml = renderSitemapXml(entries);

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
