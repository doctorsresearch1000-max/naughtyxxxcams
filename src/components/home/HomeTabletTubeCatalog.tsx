"use client";

import { JerkmateHomeWideBanner } from "@/components/conversion/JerkmateHomeWideBanner";
import { HomeCatalogSeoFooter } from "@/components/home/HomeCatalogSeoFooter";
import { ExploreTubeGrid } from "@/components/explore/ExploreTubeGrid";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
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
      className="mx-auto hidden min-h-0 w-full max-w-md flex-1 overflow-y-auto bg-black pb-24 text-white [-webkit-overflow-scrolling:touch] md:block lg:hidden"
      data-home-tablet-tube="v2"
    >
      <JerkmateHomeWideBanner />
      {!ready ? (
        <ExplorePerformerGridSkeleton />
      ) : (
        <>
          <ExploreTubeGrid performers={performers} />
          <HomeCatalogSeoFooter />
        </>
      )}
    </main>
  );
}
