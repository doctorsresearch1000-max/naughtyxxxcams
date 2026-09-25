import { ExplorePageClient } from "@/components/explore/ExplorePageClient";

type ExploreMainProps = {
  categorySlug: string | null;
};

export function ExploreMain({ categorySlug }: ExploreMainProps) {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-md overflow-y-auto bg-[#0A0A0A] px-3 pb-24 pt-2 text-white [-webkit-overflow-scrolling:touch]"
    >
      <ExplorePageClient categorySlug={categorySlug} />
    </main>
  );
}
