export function ExplorePerformerGridSkeleton({
  count = 6,
  columns = 2,
}: {
  count?: number;
  columns?: 2 | 3;
}) {
  const gridClass =
    columns === 3 ? "grid grid-cols-3 gap-1.5 sm:gap-2" : "grid grid-cols-2 gap-3";
  const aspectClass = columns === 3 ? "aspect-[3/5]" : "aspect-[3/4]";
  const radiusClass = columns === 3 ? "rounded-[18px]" : "rounded-2xl";

  return (
    <div
      className={gridClass}
      aria-busy="true"
      aria-label="Loading models"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`relative ${aspectClass} overflow-hidden ${radiusClass} border border-zinc-800/60 bg-[#1C1C1E]`}
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950" />
          <div className="absolute bottom-2 left-2 right-2 space-y-2">
            <div className="h-4 w-12 animate-pulse rounded-md bg-zinc-700/80" />
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-700/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
