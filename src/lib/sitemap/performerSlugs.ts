import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";
import { performerProfileSlug } from "@/lib/profile/performerHandle";

const MAX_PAGES = 25;
const PAGE_SIZE = 100;

/**
 * Slugs únicos para `/profile/[handle]` desde performers Streamate (live + offline).
 */
export async function collectPerformerProfileSlugs(): Promise<string[]> {
  const slugs = new Set<string>();

  async function ingest(live: boolean) {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const data = await fetchStreamatePerformers({
        live,
        size: PAGE_SIZE,
        page,
      });
      const performers = data.performers ?? [];
      if (performers.length === 0) break;

      for (const performer of performers) {
        const slug = performerProfileSlug(
          performer.nameClean || performer.name,
        );
        if (slug) slugs.add(slug);
      }

      if (performers.length < PAGE_SIZE) break;
    }
  }

  await ingest(true);
  await ingest(false);

  return Array.from(slugs).sort((a, b) => a.localeCompare(b));
}
