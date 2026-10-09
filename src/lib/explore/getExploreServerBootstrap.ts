import type { CrackPerformer } from "@/lib/crackrevenue/api";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import type { ExploreCategoryConfig } from "@/lib/explore/categorySlugs";
import { resolveExploreCategory } from "@/lib/explore/exploreCatalog";
import {
  fetchCategoryPerformers,
  fetchExploreMasterPool,
} from "@/lib/explore/fetchCategoryPerformers";

export type ExploreServerBootstrap = {
  masterPool: CrackPerformer[];
  performers: CrackPerformer[];
  total: number;
  popularCategories: ExploreCategory[];
};

/** Server-side explore grid bootstrap for SSR internal links (SEO). */
export async function getExploreServerBootstrap(
  categorySlug: string | null,
): Promise<ExploreServerBootstrap> {
  const category: ExploreCategoryConfig | null =
    resolveExploreCategory(categorySlug);
  const masterPool = await fetchExploreMasterPool();
  const { performers, total } = await fetchCategoryPerformers(category, {
    masterPool,
  });
  return {
    masterPool,
    performers,
    total,
    popularCategories: [],
  };
}
