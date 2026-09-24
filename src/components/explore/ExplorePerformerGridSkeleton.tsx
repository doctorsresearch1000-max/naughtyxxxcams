export function ExplorePerformerGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3"
      aria-busy="true"
      aria-label="Cargando modelos"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/80"
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
