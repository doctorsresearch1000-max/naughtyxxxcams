export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import CrackWidget from "@/components/cams/CrackWidget";
import { ExploreCategoryGrid } from "@/components/explore/ExploreCategoryGrid";
import BottomNav from "@/components/layout/BottomNav";
import {
  dedupeCategories,
  fetchAllExploreCategories,
} from "@/lib/crackrevenue/categories";

export default async function ExplorePage() {
  let uniqueCategories: Awaited<ReturnType<typeof fetchAllExploreCategories>> =
    [];

  try {
    const categories = await fetchAllExploreCategories();
    uniqueCategories = dedupeCategories(categories);
  } catch {
    uniqueCategories = [];
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md overflow-y-auto bg-black px-4 pb-20 pt-4 text-white [-webkit-overflow-scrolling:touch]">
      <div className="mb-4 flex items-center gap-1 text-base font-black tracking-wider text-pink-500">
        <span>Naughty</span>
        <span className="rounded-md bg-pink-600 px-1.5 py-0.5 text-xs text-white">
          XXX
        </span>
      </div>

      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
        EXPLORA
      </span>
      <h1 className="mb-0.5 text-2xl font-black tracking-tight">Descubrir</h1>
      <p className="mb-4 text-xs text-zinc-400">
        Encuentra salas según tu categoría preferida
      </p>

      <div className="relative mb-5 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar modelos o etiquetas..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 transition-colors focus:border-pink-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-sm text-zinc-500">
            🔍
          </span>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-zinc-400 transition-colors hover:text-pink-500"
          aria-label="Filtros"
        >
          🎛️
        </button>
      </div>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-zinc-200">
            Categorías Populares
          </h2>
          <span className="text-xs font-semibold text-pink-500">
            {uniqueCategories.length} activas
          </span>
        </div>

        <ExploreCategoryGrid categories={uniqueCategories} />
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
              TENDENCIAS
            </span>
            <h2 className="text-lg font-black">Top Transmisiones</h2>
          </div>
          <span className="text-xs font-semibold text-pink-400">
            Streamate en vivo
          </span>
        </div>

        <CrackWidget
          cols={2}
          rows={4}
          number={8}
          ratio={0.75}
          useFeed={0}
          animateFeed={0}
          height="min-h-[500px]"
          providers="streamate"
        />
      </section>

      <BottomNav />
    </main>
  );
}
