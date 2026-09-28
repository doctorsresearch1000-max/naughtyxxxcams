"use client";

import { JerkmateHomeWideBanner } from "@/components/conversion/JerkmateHomeWideBanner";
import { HomeCatalogSectionTitle } from "@/components/home/HomeCatalogSectionTitle";
import { ExploreTubeGrid } from "@/components/explore/ExploreTubeGrid";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import { CATALOG_PAGE_PADDING } from "@/lib/layout/catalogGridLayout";
import type { CrackPerformer } from "@/lib/crackrevenue/api";

type HomeTabletTubeCatalogProps = {
  performers: CrackPerformer[];
  ready: boolean;
};

/** Tablet (768–1023px): tube grid without category pills. */
export function HomeTabletTubeCatalog({
  performers,
  ready,
}: HomeTabletTubeCatalogProps) {
  return (
    <main
      className={`${CATALOG_PAGE_PADDING} hidden min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto bg-black pb-20 text-white md:block lg:hidden`}
      data-home-tablet-tube="v3-camb3"
    >
      <HomeCatalogSectionTitle />
      <JerkmateHomeWideBanner />
      {!ready ? (
        <ExplorePerformerGridSkeleton />
      ) : (
        <ExploreTubeGrid performers={performers} />
      )}
    </main>
  );
}
