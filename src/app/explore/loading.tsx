import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";

export default function ExploreLoading() {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-md bg-[#0A0A0A] px-3 pb-24 pt-2 text-white"
    >
      <div className="mb-4 h-11 w-full animate-pulse rounded-full bg-[#1C1C1E]" />
      <ExplorePerformerGridSkeleton count={12} columns={3} />
    </main>
  );
}
