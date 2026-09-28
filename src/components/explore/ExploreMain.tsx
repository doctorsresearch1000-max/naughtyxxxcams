import { Suspense } from "react";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";

type ExploreMainProps = {
  categorySlug: string | null;
};

export function ExploreMain({ categorySlug }: ExploreMainProps) {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-md overflow-y-auto bg-[#0d0d0f] px-3.5 pb-24 pt-3 text-white [-webkit-overflow-scrolling:touch] lg:max-w-[1800px] lg:px-4 lg:pb-12 lg:pt-2"
    >
      <Suspense fallback={<ExplorePerformerGridSkeleton count={12} />}>
        <ExplorePageClient categorySlug={categorySlug} />
      </Suspense>
    </main>
  );
}
