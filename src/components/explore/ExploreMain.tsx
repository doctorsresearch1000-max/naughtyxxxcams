import { ExplorePageClient } from "@/components/explore/ExplorePageClient";

type ExploreMainProps = {
  categorySlug: string | null;
};

export function ExploreMain({ categorySlug }: ExploreMainProps) {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-md overflow-y-auto bg-[#0d0d0f] px-3.5 pb-24 pt-3 text-white [-webkit-overflow-scrolling:touch] lg:max-w-[1800px] lg:px-6 lg:pb-12 lg:pt-5"
    >
      <ExplorePageClient categorySlug={categorySlug} />
    </main>
  );
}
