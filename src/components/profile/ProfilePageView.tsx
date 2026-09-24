"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { ContinueWatchingCard } from "@/components/profile/ContinueWatchingCard";
import {
  ProfileInteractionTabs,
  type ProfileInteractionTab,
} from "@/components/profile/ProfileInteractionTabs";
import { ProfileTabPanel } from "@/components/profile/ProfileTabPanel";
import {
  useBookmarkedModels,
  useFollowingModels,
  useHistoryEntries,
  useLikedModels,
  usePlaylists,
} from "@/hooks/useUserLibrary";
import { createPlaylist } from "@/lib/user/userLibrary";

const SPONSOR_BANNER_HREF =
  "https://t.ajrkmx3.com/214769/8780/0?file_id=598462&po=6533&aff_sub5=SF_006OG000004lmDN&aff_sub4=AT_0002";
const SPONSOR_BANNER_SRC =
  "https://www.imglnky.com/8780/PMKT-1157_DESIGN-16618_BannersWebinar_AmyPose_300100.gif";

export function ProfilePageView() {
  const { user, isAuthenticated, login, logout } = useTelegramAuth();
  const likes = useLikedModels();
  const bookmarks = useBookmarkedModels();
  const following = useFollowingModels();
  const history = useHistoryEntries();
  const playlists = usePlaylists();
  const [libraryTab, setLibraryTab] = useState<ProfileInteractionTab>("saved");

  const displayName = user?.first_name ?? "Guest";
  const handle = user?.username ? `@${user.username}` : "Not synced";

  const avatarSrc = useMemo(() => {
    if (user?.photo_url) return user.photo_url;
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.id ?? "guest"}`;
  }, [user]);

  const onCreatePlaylist = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    const name = window.prompt("Collection name", "Favorites");
    if (name) createPlaylist(name);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-black px-4 pb-24 pt-4 text-white">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">
        Profile
      </span>
      <header className="mt-1 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-[#39FF14]/40">
            <Image
              src={avatarSrc}
              alt={displayName}
              width={64}
              height={64}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">{displayName}</h1>
            <p className="text-sm text-zinc-400">{handle}</p>
          </div>
        </div>
      </header>

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#1C1C1E] p-3">
        {isAuthenticated ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Image
                src={avatarSrc}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
                unoptimized
              />
              <p className="text-xs text-zinc-300">Synced with Telegram</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-[#39FF14]/40"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-400">
              Connect Telegram to save likes, bookmarks, and collections.
            </p>
            <button
              type="button"
              onClick={login}
              className="shrink-0 rounded-full bg-[#2AABEE] px-4 py-2 text-xs font-bold text-white"
            >
              Telegram Login / Sync
            </button>
          </div>
        )}
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

      <section className="mt-8" aria-labelledby="activity-heading">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">
          Your activity
        </span>
        <h2 id="activity-heading" className="mt-1 text-2xl font-black tracking-tight">
          Continue Watching
        </h2>
        <p className="mb-4 text-sm text-zinc-500">
          Pick up exactly where you left off.
        </p>
        <ContinueWatchingCard />
      </section>

      <section className="mt-8" aria-label="Library">
        <ProfileInteractionTabs active={libraryTab} onChange={setLibraryTab} />
        <ProfileTabPanel
          tab={libraryTab}
          bookmarks={bookmarks}
          likes={likes}
          following={following}
          history={history}
          playlists={playlists}
          onNewCollection={onCreatePlaylist}
        />
      </section>
    </main>
  );
}
