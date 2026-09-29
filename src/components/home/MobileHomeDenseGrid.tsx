"use client";

import { HomeCatalogSectionTitle } from "@/components/home/HomeCatalogSectionTitle";
import { HomeTubeGrid } from "@/components/home/HomeTubeGrid";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import { CATALOG_PAGE_PADDING } from "@/lib/layout/catalogGridLayout";
import type { CrackPerformer } from "@/lib/crackrevenue/api";

type MobileHomeDenseGridProps = {
  performers: CrackPerformer[];
  ready: boolean;
};

export function MobileHomeDenseGrid({
  performers,
  ready,
}: MobileHomeDenseGridProps) {
  return (
    <main
      className={`${CATALOG_PAGE_PADDING} w-full overflow-x-hidden bg-black pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-white md:hidden`}
      data-home-mobile-dense="v7-jm-in-grid"
    >
      <HomeCatalogSectionTitle />

      {!ready ? (
        <ExplorePerformerGridSkeleton />
      ) : (
        <HomeTubeGrid performers={performers} />
      )}
    </main>
  );
}
