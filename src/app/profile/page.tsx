import Image from "next/image";
import { continueWatching, profileUser } from "@/data/mock";

export default function ProfilePage() {
  return (
    <main className="min-h-dvh bg-night px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-cyan/40">
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
            <p className="text-sm text-slate-400">{profileUser.handle}</p>
            <p className="mt-1 text-xs text-cyan/90">Signed in with Telegram</p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-magenta/40 hover:text-magenta"
        >
          Log out
        </button>
      </header>

      <section
        className="mt-6 overflow-hidden rounded-2xl border border-magenta/40 bg-gradient-to-br from-magenta/25 via-surface to-cyan/20 p-4 shadow-neon"
        aria-label="Sponsored promotion"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-200/80">
          Sponsored
        </p>
        <h2 className="mt-1 text-lg font-black leading-tight">
          Jerkmate — Free premium trial tonight
        </h2>
        <p className="mt-2 text-sm text-slate-200/90">
          Neon-exclusive offer: instant access, no card required for the first session.
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-magenta py-3 text-sm font-extrabold text-white shadow-neon"
        >
          Claim free access
        </button>
      </section>

      <section className="mt-8" aria-labelledby="continue-heading">
        <h2 id="continue-heading" className="mb-3 text-lg font-extrabold">
          Continue Watching
        </h2>
        <article className="overflow-hidden rounded-2xl border border-cyan/20 bg-surface">
          <div className="relative h-40 w-full">
            <Image
              src={continueWatching.image}
              alt={`Continue ${continueWatching.username}`}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="font-bold">@{continueWatching.username}</p>
              <p className="text-xs text-slate-300">
                Last watched {continueWatching.lastWatched}
              </p>
            </div>
          </div>
          <div className="p-4">
            <button
              type="button"
              className="w-full rounded-xl border border-cyan/40 bg-cyan/10 py-3 text-sm font-extrabold text-cyan shadow-neon-cyan"
            >
              Resume Watching
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
