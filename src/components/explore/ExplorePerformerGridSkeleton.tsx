import { EXPLORE_TUBE_GRID_CLASS } from "@/lib/explore/exploreTubeLayout";

export function ExplorePerformerGridSkeleton({
  count = 12,
}: {
  count?: number;
  columns?: number;
}) {
  return (
    <div
      className={EXPLORE_TUBE_GRID_CLASS}
      aria-busy="true"
      aria-label="Loading models"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-zinc-800/60 bg-[#141416]"
        >
          <div className="relative aspect-[3/4] animate-pulse bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950" />
          <div className="space-y-2 px-2 py-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-700/80" />
            <div className="h-3 w-full animate-pulse rounded bg-zinc-800/80" />
          </div>
        </div>
      ))}
    </div>
  );
}
