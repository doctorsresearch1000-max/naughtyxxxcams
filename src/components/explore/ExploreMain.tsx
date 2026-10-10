import { Suspense } from "react";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import { ExploreSeoCrawlBlock } from "@/components/explore/ExploreSeoCrawlBlock";
import type { ExploreServerBootstrap } from "@/lib/explore/getExploreServerBootstrap";

type ExploreMainProps = {
  categorySlug: string | null;
  bootstrap: ExploreServerBootstrap | null;
};

/** Slushy mobile column + wide desktop grid; SEO in sr-only crawl block. */
const EXPLORE_MAIN_CLASS =
  "mx-auto min-h-screen w-full max-w-md overflow-x-hidden overflow-y-auto bg-[#0d0d0f] px-3.5 pb-24 pt-3 text-white [-webkit-overflow-scrolling:touch] lg:max-w-[1800px] lg:px-4 lg:pb-12 lg:pt-2";

export function ExploreMain({ categorySlug, bootstrap }: ExploreMainProps) {
  return (
    <main className={EXPLORE_MAIN_CLASS}>
      <ExploreSeoCrawlBlock
        categorySlug={categorySlug}
        bootstrap={bootstrap}
      />

      <Suspense fallback={<ExplorePerformerGridSkeleton count={12} />}>
        <ExplorePageClient categorySlug={categorySlug} bootstrap={bootstrap} />
      </Suspense>
    </main>
  );
}
