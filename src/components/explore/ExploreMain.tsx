import { Suspense } from "react";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";

type ExploreMainProps = {
  categorySlug: string | null;
};

export function ExploreMain({ categorySlug }: ExploreMainProps) {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-none overflow-x-hidden overflow-y-auto bg-[#0d0d0f] px-2 pb-24 pt-2 text-white [-webkit-overflow-scrolling:touch] md:px-4 lg:pb-12"
    >
      <Suspense fallback={<ExplorePerformerGridSkeleton count={12} />}>
        <ExplorePageClient categorySlug={categorySlug} />
      </Suspense>
    </main>
  );
}
