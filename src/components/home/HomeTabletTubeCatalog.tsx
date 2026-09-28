"use client";

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
      className="mx-auto hidden min-h-[var(--feed-viewport-height,100dvh)] w-full max-w-md flex-1 overflow-y-auto bg-[#0d0d0f] pb-24 text-white [-webkit-overflow-scrolling:touch] md:block lg:hidden"
      data-home-tablet-tube="v1"
    >
      <div className="px-3.5 pt-3">
        <h1 className="text-lg font-black tracking-tight">Live cams</h1>
        <p className="text-[11px] text-zinc-500">
          Browse models · Tap for profile
        </p>
      </div>
      {!ready ? (
        <ExplorePerformerGridSkeleton />
      ) : (
        <ExploreTubeGrid performers={performers} />
      )}
    </main>
  );
}
