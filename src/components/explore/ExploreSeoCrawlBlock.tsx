import Link from "next/link";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  EXPLORE_CATEGORY_MAP,
  EXPLORE_CATEGORY_SLUGS,
} from "@/lib/explore/categorySlugs";
import type { ExploreServerBootstrap } from "@/lib/explore/getExploreServerBootstrap";
import { explorePathForCategorySlug } from "@/lib/explore/paths";
import { resolveExploreCategory } from "@/lib/explore/exploreCatalog";
import {
  performerDisplayHandle,
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";
import { generateExploreSeoCopy } from "@/lib/seo/exploreSeoContent";

const PROFILE_LINK_CAP = 32;

type ExploreSeoCrawlBlockProps = {
  categorySlug: string | null;
  bootstrap: ExploreServerBootstrap | null;
};

/**
 * SEO-only block: visible H1/copy + plain profile/category links for crawlers.
 * Does not affect Slushy UI (sr-only).
 */
export function ExploreSeoCrawlBlock({
  categorySlug,
  bootstrap,
}: ExploreSeoCrawlBlockProps) {
  const category = resolveExploreCategory(categorySlug);
  const seo = generateExploreSeoCopy(category);
  const performers = pickCrawlPerformers(bootstrap);

  return (
    <section
      className="sr-only"
      aria-label="Explore directory"
      data-explore-seo-crawl="v1"
    >
      <h1>{seo.h1}</h1>
      <p>{seo.bodyBlurb}</p>

      <nav aria-label="Explore categories">
        <ul>
          <li>
            <Link href="/explore">All live models</Link>
          </li>
          {EXPLORE_CATEGORY_SLUGS.map((slug) => (
            <li key={slug}>
              <Link href={explorePathForCategorySlug(slug)}>
                {EXPLORE_CATEGORY_MAP[slug].label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {performers.length > 0 ? (
        <nav aria-label="Featured model profiles">
          <ul>
            {performers.map((performer) => {
              const path = performerProfilePathFromPerformer(performer);
              if (!path) return null;
              const label = performerDisplayHandle(
                performer.nameClean || performer.name,
              );
              return (
                <li key={performer.itemId ?? path}>
                  <Link href={path}>{label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </section>
  );
}

function pickCrawlPerformers(
  bootstrap: ExploreServerBootstrap | null,
): CrackPerformer[] {
  if (!bootstrap) return [];
  const pool = bootstrap.performers.length
    ? bootstrap.performers
    : bootstrap.masterPool;
  const seen = new Set<string>();
  const out: CrackPerformer[] = [];

  for (const performer of pool) {
    const path = performerProfilePathFromPerformer(performer);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    out.push(performer);
    if (out.length >= PROFILE_LINK_CAP) break;
  }

  return out;
}
