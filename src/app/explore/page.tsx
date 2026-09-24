export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Image from "next/image";
import CrackWidget from "@/components/cams/CrackWidget";
import BottomNav from "@/components/layout/BottomNav";

const customCategories = [
  {
    title: "LATINAS",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    count: "42 Live",
    gradient: "from-rose-600/80 via-pink-600/50 to-purple-900/80",
  },
  {
    title: "18-21",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    count: "28 Live",
    gradient: "from-fuchsia-600/70 via-pink-500/40 to-black/80",
  },
  {
    title: "MILF",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300",
    count: "35 Live",
    gradient: "from-purple-700/80 via-rose-600/50 to-black/90",
  },
  {
    title: "ASIÁTICAS",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    count: "19 Live",
    gradient: "from-pink-600/70 via-violet-600/40 to-black/85",
  },
  {
    title: "PAREJAS",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
    count: "14 Live",
    gradient: "from-rose-500/75 via-fuchsia-700/45 to-black/80",
  },
  {
    title: "VR CAMS",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    count: "8 Live",
    gradient: "from-cyan-500/30 via-purple-600/60 to-pink-600/70",
  },
];

export default function ExplorePage() {
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
          <button
            type="button"
            className="text-xs font-semibold text-pink-500"
          >
            Ver todas
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {customCategories.map((cat) => (
            <button
              key={cat.title}
              type="button"
              className="group relative h-28 w-full overflow-hidden rounded-2xl border border-zinc-800/80 shadow-md transition-all active:scale-95"
            >
              <Image
                src={cat.img}
                alt={cat.title}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} p-3 flex flex-col justify-end`}
              >
                <h3 className="text-sm font-black tracking-wide text-white">
                  {cat.title}
                </h3>
                <span className="text-[10px] font-semibold text-pink-300">
                  {cat.count}
                </span>
              </div>
            </button>
          ))}
        </div>
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
            En vivo ahora
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
        />
      </section>

      <BottomNav />
    </main>
  );
}
