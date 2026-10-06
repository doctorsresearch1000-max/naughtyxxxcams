import { collectResolvableProfileSlugs } from "@/lib/crackrevenue/performerCatalog";

/**
 * Slugs únicos para `/profile/[handle]` — solo URLs que la ruta puede resolver.
 */
export async function collectPerformerProfileSlugs(): Promise<string[]> {
  try {
    return await collectResolvableProfileSlugs();
  } catch {
    return [];
  }
}
