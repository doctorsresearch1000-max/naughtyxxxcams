import { Suspense } from "react";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { ExplorePerformerGrid } from "@/components/explore/ExplorePerformerGrid";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import { resolveExploreCategory } from "@/lib/explore/exploreCatalog";
import type { ExploreServerBootstrap } from "@/lib/explore/getExploreServerBootstrap";
import { generateExploreSeoCopy } from "@/lib/seo/exploreSeoContent";

type ExploreMainProps = {
  categorySlug: string | null;
  bootstrap: ExploreServerBootstrap | null;
};

export function ExploreMain({ categorySlug, bootstrap }: ExploreMainProps) {
  const category = resolveExploreCategory(categorySlug);
  const seo = generateExploreSeoCopy(category);
  const hasServerGrid =
    Boolean(bootstrap?.performers?.length && bootstrap.performers.length > 0);

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-none overflow-x-hidden overflow-y-auto bg-[#0d0d0f] px-2 pb-24 pt-2 text-white [-webkit-overflow-scrolling:touch] md:px-4 lg:pb-12"
    >
      <header className="px-2 pb-3 pt-1 md:px-0">
        <h1 className="text-2xl font-bold capitalize tracking-tight text-white">
          {seo.h1}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
          {seo.bodyBlurb}
        </p>
      </header>

      {hasServerGrid ? (
        <section
          className="mb-4 px-0.5"
          aria-label="Live model directory"
          data-explore-ssr-grid="v1"
        >
          <ExplorePerformerGrid performers={bootstrap!.performers} />
        </section>
      ) : null}

      <Suspense fallback={<ExplorePerformerGridSkeleton count={12} />}>
        <ExplorePageClient
          categorySlug={categorySlug}
          bootstrap={bootstrap}
          hidePerformerGrid={hasServerGrid}
        />
      </Suspense>
    </main>
  );
}
