export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Image from "next/image";
import { continueWatching, profileUser } from "@/data/mock";

export default function ProfilePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-black px-4 pb-8 pt-4 text-white">
      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
        PERFIL
      </span>
      <header className="mt-1 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-pink-500/50">
            <Image
              src={profileUser.avatar}
              alt={profileUser.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">{profileUser.name}</h1>
            <p className="text-sm text-zinc-400">{profileUser.handle}</p>
          </div>
        </div>
      </header>

      <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image
              src={profileUser.avatar}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
            <p className="text-xs text-zinc-300">Signed in with Telegram</p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-pink-500/40"
          >
            Log out
          </button>
        </div>
      </section>

      <section
        className="mt-5 overflow-hidden rounded-2xl border border-pink-500/40 bg-gradient-to-br from-pink-600/30 via-purple-900/40 to-black p-4 shadow-lg shadow-pink-950/30"
        aria-label="Sponsored"
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-pink-300">
          Patrocinado
        </p>
        <h2 className="mt-1 text-lg font-black leading-tight">
          JERKMATE IS FREE
        </h2>
        <p className="mt-2 text-xs text-zinc-200">
          Oferta neón: acceso instantáneo a la prueba premium.
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-pink-600/30"
        >
          Reclamar acceso
        </button>
      </section>

      <section className="mt-6" aria-labelledby="activity-heading">
        <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
          TU ACTIVIDAD
        </span>
        <h2 id="activity-heading" className="mt-1 text-lg font-black">
          Continuar viendo
        </h2>
        <p className="mb-3 text-xs text-zinc-400">
          Retoma justo donde lo dejaste
        </p>

        <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90">
          <div className="relative h-36 w-full">
            <Image
              src={continueWatching.image}
              alt={`@${continueWatching.username}`}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <p className="font-bold">@{continueWatching.username}</p>
              <p className="text-[11px] text-zinc-300">
                Last watched {continueWatching.lastWatched}
              </p>
            </div>
          </div>
          <div className="p-3">
            <button
              type="button"
              className="w-full rounded-full border border-zinc-700 bg-zinc-800 py-3 text-sm font-bold text-white hover:border-pink-500/40"
            >
              Resume Watching
            </button>
          </div>
        </article>
      </section>

    </main>
  );
}
