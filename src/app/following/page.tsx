export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Image from "next/image";
import { NaughtyLogo } from "@/components/brand/NaughtyLogo";
import BottomNav from "@/components/layout/BottomNav";

export default function FollowingPage() {
  const liveNearby = [
    {
      name: "Angela",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
    {
      name: "Selena",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    },
    {
      name: "Gaia",
      img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    },
    {
      name: "Violetta",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
    {
      name: "Zara",
      img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150",
    },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-black px-4 pb-20 pt-4 text-white">
      <NaughtyLogo size="sm" className="mb-5" />

      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
        TRANSMISIONES CERCANAS
      </span>
      <div className="no-scrollbar mb-6 mt-2 flex gap-3 overflow-x-auto">
        {liveNearby.map((item) => (
          <div key={item.name} className="flex shrink-0 flex-col items-center">
            <div className="relative rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 p-[2px] shadow-md shadow-pink-500/20">
              <Image
                src={item.img}
                alt={item.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border-2 border-black object-cover"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-black bg-pink-600 px-1.5 py-0.5 text-[8px] font-black uppercase text-white">
                LIVE
              </span>
            </div>
            <span className="mt-2 max-w-[65px] truncate text-[10px] font-medium text-zinc-300">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
        SIGUIENDO
      </span>
      <div className="mb-1 mt-1 flex items-center justify-between">
        <h1 className="text-2xl font-black">Tus Modelos</h1>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-xs text-pink-400 transition-colors hover:border-pink-500/50"
          aria-label="Refresh"
        >
          🔄
        </button>
      </div>
      <p className="mb-4 text-xs text-zinc-400">
        1 de tus modelos está transmitiendo ahora
      </p>

      <div className="mb-3 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-950/60 px-2.5 py-0.5 text-[10px] font-bold text-pink-400">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-pink-500" />
          • LIVE · 1
        </span>
        <span className="text-[11px] text-zinc-500">Actualizado ahora</span>
      </div>

      <div className="relative mb-6 h-64 w-52 overflow-hidden rounded-3xl border border-pink-500/30 shadow-lg shadow-pink-950/30">
        <Image
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
          alt="@Bonny_Brok"
          fill
          sizes="208px"
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black via-black/20 to-black/40 p-3">
          <span className="flex w-fit items-center gap-1 rounded-md bg-pink-600 px-2 py-0.5 text-[9px] font-black text-white shadow">
            ((o)) EN VIVO
          </span>
          <div>
            <h3 className="text-base font-extrabold text-white">@Bonny_Brok</h3>
            <p className="text-[10px] font-semibold text-pink-400">
              STREAMATE · Ver directo
            </p>
          </div>
        </div>
      </div>

      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        Desconectadas
      </span>
      <div className="mt-2 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
        <div className="flex items-center gap-3">
          <Image
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100"
            alt="@404hotfound"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h4 className="text-xs font-bold text-white">@404hotfound</h4>
            <p className="text-[10px] text-zinc-500">Offline</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          Perfil
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
