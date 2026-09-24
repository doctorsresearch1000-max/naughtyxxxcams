import Image from "next/image";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";

const GRADIENTS = [
  "from-rose-600/80 via-pink-600/50 to-purple-900/80",
  "from-fuchsia-600/70 via-pink-500/40 to-black/80",
  "from-purple-700/80 via-rose-600/50 to-black/90",
  "from-pink-600/70 via-violet-600/40 to-black/85",
  "from-rose-500/75 via-fuchsia-700/45 to-black/80",
  "from-cyan-500/30 via-purple-600/60 to-pink-600/70",
];

type ExploreCategoryGridProps = {
  categories: ExploreCategory[];
};

export function ExploreCategoryGrid({ categories }: ExploreCategoryGridProps) {
  const safeCategories = Array.isArray(categories) ? categories : [];

  if (safeCategories.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs text-zinc-400">
        No hay categorías disponibles en este momento. Vuelve a intentarlo en unos
        segundos.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {safeCategories.map((cat, index) => (
        <button
          key={cat?.id ?? `category-${index}`}
          type="button"
          className="group relative h-28 w-full overflow-hidden rounded-2xl border border-zinc-800/80 shadow-md transition-all active:scale-95"
        >
          {cat.coverUrl ? (
            <Image
              src={cat.coverUrl}
              alt={cat.title}
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900 to-purple-950" />
          )}
          <div
            className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t p-3 ${GRADIENTS[index % GRADIENTS.length]}`}
          >
            <h3 className="text-sm font-black tracking-wide text-white">
              {cat?.title ?? "CATEGORY"}
            </h3>
            <span className="text-[10px] font-semibold text-pink-300">
              {cat?.liveCount ?? 0} Live
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
