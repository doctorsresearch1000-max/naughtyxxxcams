import type { MetadataRoute } from "next";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Serializa entradas al formato sitemap.org (compatible con Google). */
export type SitemapIndexLoc = {
  loc: string;
  lastmod?: Date | string;
};

export function renderSitemapIndexXml(entries: SitemapIndexLoc[]): string {
  const items = entries
    .map((entry) => {
      const loc = escapeXml(entry.loc);
      const lastmod =
        entry.lastmod instanceof Date
          ? entry.lastmod.toISOString()
          : entry.lastmod
            ? new Date(entry.lastmod).toISOString()
            : null;
      return `<sitemap>
<loc>${loc}</loc>${lastmod ? `\n<lastmod>${lastmod}</lastmod>` : ""}
</sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`;
}

export function renderSitemapXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const loc = escapeXml(entry.url);
      const lastmod =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified
            ? new Date(entry.lastModified).toISOString()
            : null;
      const changefreq = entry.changeFrequency
        ? `<changefreq>${entry.changeFrequency}</changefreq>`
        : "";
      const priority =
        entry.priority != null
          ? `<priority>${entry.priority}</priority>`
          : "";

      return `<url>
<loc>${loc}</loc>${lastmod ? `\n<lastmod>${lastmod}</lastmod>` : ""}${changefreq ? `\n${changefreq}` : ""}${priority ? `\n${priority}` : ""}
</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
