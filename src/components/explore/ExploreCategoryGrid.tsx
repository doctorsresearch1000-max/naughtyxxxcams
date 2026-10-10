"use client";

import type { CrackPerformer } from "@/lib/crackrevenue/api";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import { ExploreCategoryPremiumGrid } from "@/components/explore/ExploreCategoryPremiumGrid";
import { resolveExploreCategoryHubCards } from "@/lib/explore/exploreCategoryHubCards";

type ExploreCategoryGridProps = {
  categories: ExploreCategory[];
  masterPool?: CrackPerformer[];
};

export function ExploreCategoryGrid({
  categories,
  masterPool = [],
}: ExploreCategoryGridProps) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const cards = resolveExploreCategoryHubCards(masterPool, safeCategories);

  return (
    <ExploreCategoryPremiumGrid
      cards={
        cards.length > 0
          ? cards
          : resolveExploreCategoryHubCards(masterPool, [])
      }
    />
  );
}
