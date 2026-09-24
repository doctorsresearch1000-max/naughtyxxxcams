export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import CrackWidget from "@/components/cams/CrackWidget";
import { NaughtyLogo } from "@/components/brand/NaughtyLogo";
import BottomNav from "@/components/layout/BottomNav";

export default function ExplorePage() {
  const categories = [
    "EN VIVO",
    "18-21",
    "LATINAS",
    "MILF",
    "ASIÁTICAS",
    "PAREJAS",
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-black px-4 pb-20 pt-4 text-white">
      <NaughtyLogo size="sm" className="mb-4" />

      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
        EXPLORA
      </span>
      <h1 className="mb-0.5 text-2xl font-black tracking-tight">Descubrir</h1>
      <p className="mb-4 text-xs text-zinc-400">
        Salas de transmisión según tu gusto
      </p>

      <div className="relative mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar modelos o tags..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 transition-colors focus:border-pink-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-sm text-zinc-500">
            🔍
          </span>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5 text-sm text-zinc-400 transition-colors hover:text-pink-500"
          aria-label="Filters"
        >
          🎛️
        </button>
      </div>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {categories.map((cat, i) => (
          <button
            key={cat}
            type="button"
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
              i === 0
                ? "border border-pink-400/30 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white shadow-lg shadow-pink-600/30"
                : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
              TENDENCIAS
            </span>
            <h2 className="text-lg font-black">Top Transmisiones</h2>
          </div>
          <span className="text-xs font-semibold text-pink-400">12 en vivo</span>
        </div>

        <CrackWidget
          cols={3}
          rows={3}
          number={9}
          ratio={0.75}
          useFeed={0}
          animateFeed={0}
          height="min-h-[420px]"
        />
      </section>

      <BottomNav />
    </main>
  );
}
