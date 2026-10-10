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

  if (safeCategories.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs text-zinc-400">
        No categories available right now. Please try again in a few
        minutes.
      </p>
    );
  }

  const cards = resolveExploreCategoryHubCards(masterPool, safeCategories);

  return <ExploreCategoryPremiumGrid cards={cards} />;
}
