import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/sitemap/buildSitemap";

/** Evita prerender estático en OpenNext/Cloudflare (ruta siempre vía Worker). */
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries();
}
