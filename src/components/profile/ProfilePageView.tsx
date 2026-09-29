"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { TelegramProfileConnect } from "@/components/auth/TelegramProfileConnect";
import { ProfileSponsorAdCard } from "@/components/profile/ProfileSponsorAdCard";
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

export function ProfilePageView() {
  const { user, isAuthenticated, login } = useTelegramAuth();
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
    <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
      <aside className="lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-[calc(var(--app-header-height,3.5rem)+1rem)] lg:space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">
              Profile
            </span>
            <header className="mt-1 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <div
                  className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-[#39FF14]/40 lg:h-20 lg:w-20"
                >
                  <Image
                    src={avatarSrc}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold lg:text-2xl">
                    {displayName}
                  </h1>
                  <p className="text-sm text-zinc-400">{handle}</p>
                </div>
              </div>
            </header>
          </div>

          <TelegramProfileConnect />

          <ProfileSponsorAdCard className="hidden lg:block" />
        </div>
      </aside>

      <div className="mt-6 space-y-8 lg:col-span-8 lg:mt-0 xl:col-span-9">
        <section aria-labelledby="activity-heading">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">
            Your activity
          </span>
          <h2
            id="activity-heading"
            className="mt-1 text-2xl font-black tracking-tight lg:text-3xl"
          >
            Continue Watching
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Pick up exactly where you left off.
          </p>
          <ContinueWatchingCard />
        </section>

        <section aria-label="Library">
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

        <ProfileSponsorAdCard className="lg:hidden" />
      </div>
    </div>
  );
}
