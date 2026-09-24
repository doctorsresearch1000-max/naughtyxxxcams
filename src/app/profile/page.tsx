export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Image from "next/image";
import Link from "next/link";
import { ContinueWatchingCard } from "@/components/profile/ContinueWatchingCard";
import { profileUser } from "@/data/mock";

const SPONSOR_BANNER_HREF =
  "https://t.ajrkmx3.com/214769/8780/0?file_id=598462&po=6533&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0002";
const SPONSOR_BANNER_SRC =
  "https://www.imglnky.com/8780/PMKT-1157_DESIGN-16618_BannersWebinar_AmyPose_300100.gif";

export default function ProfilePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#0A0A0A] px-4 pb-24 pt-4 text-white">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">
        Profile
      </span>
      <header className="mt-1 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-[#39FF14]/40">
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

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#1C1C1E] p-3">
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
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-[#39FF14]/40"
          >
            Log out
          </button>
        </div>
      </section>

      <section className="mt-5 flex justify-center" aria-label="Sponsored offer">
        <Link
          href={SPONSOR_BANNER_HREF}
          target="_blank"
          rel="nofollow noopener sponsored"
          className="block overflow-hidden rounded-2xl ring-1 ring-white/10 transition active:scale-[0.99]"
        >
          <Image
            src={SPONSOR_BANNER_SRC}
            alt="Sponsored live cam offer"
            width={300}
            height={100}
            unoptimized
            className="h-auto w-full max-w-[300px]"
          />
        </Link>
      </section>

      <section className="mt-6" aria-labelledby="activity-heading">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">
          Your activity
        </span>
        <h2 id="activity-heading" className="mt-1 text-lg font-black">
          Continue watching
        </h2>
        <p className="mb-3 text-xs text-zinc-400">Pick up right where you left off</p>

        <ContinueWatchingCard />
      </section>
    </main>
  );
}
