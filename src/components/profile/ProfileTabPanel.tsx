"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProfileInteractionTab } from "@/components/profile/ProfileInteractionTabs";
import type { HistoryEntry, Playlist, SavedModelRef } from "@/lib/user/userLibrary";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type ProfileTabPanelProps = {
  tab: ProfileInteractionTab;
  bookmarks: SavedModelRef[];
  likes: SavedModelRef[];
  history: HistoryEntry[];
  playlists: Playlist[];
  onNewCollection: () => void;
};

function ModelThumbGrid({
  items,
  emptyLabel,
}: {
  items: SavedModelRef[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">{emptyLabel}</p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const label = performerDisplayHandle(
          item.nameClean || item.name || "Model",
        );
        const href = item.profilePath || "/";
        return (
          <li key={item.feedKey}>
            <Link
              href={href}
              className="block overflow-hidden rounded-2xl bg-[#1C1C1E]"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={item.posterUrl}
                  alt={label}
                  fill
                  sizes="200px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="truncate px-2.5 py-2 text-xs font-semibold text-white">
                {label}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function CollectionCard({ playlist }: { playlist: Playlist }) {
  const count = playlist.items.length;
  const thumbs = playlist.items.slice(0, 4);

  return (
    <Link
      href={`/profile/playlists/${playlist.id}`}
      className="block overflow-hidden rounded-2xl bg-[#1C1C1E]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
        {thumbs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <span className="text-2xl">+</span>
          </div>
        ) : thumbs.length === 1 ? (
          <Image
            src={thumbs[0].posterUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-black">
            {thumbs.map((item) => (
              <div key={item.feedKey} className="relative min-h-0">
                <Image
                  src={item.posterUrl}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-bold text-white">{playlist.name}</p>
        <p className="text-xs text-zinc-500">
          {count} saved
        </p>
      </div>
    </Link>
  );
}

export function ProfileTabPanel({
  tab,
  bookmarks,
  likes,
  history,
  playlists,
  onNewCollection,
}: ProfileTabPanelProps) {
  const modelsFromHistory = history.filter(
    (h, i, arr) => arr.findIndex((x) => x.feedKey === h.feedKey) === i,
  );

  if (tab === "saved") {
    return (
      <div className="mt-4 space-y-4">
        <button
          type="button"
          onClick={onNewCollection}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2A2A2E] py-3.5 text-sm font-semibold text-white transition active:scale-[0.99]"
        >
          <span className="text-lg leading-none">+</span>
          New collection
        </button>
        {playlists.length > 0 ? (
          <div className="space-y-3">
            {playlists.map((pl) => (
              <CollectionCard key={pl.id} playlist={pl} />
            ))}
          </div>
        ) : null}
        {bookmarks.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Bookmarked
            </p>
            <ModelThumbGrid
              items={bookmarks}
              emptyLabel="No saved models yet."
            />
          </div>
        ) : playlists.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">
            Save streams from the feed or create a collection.
          </p>
        ) : null}
      </div>
    );
  }

  if (tab === "likes") {
    return (
      <div className="mt-4">
        <ModelThumbGrid
          items={likes}
          emptyLabel="No likes yet — tap the heart on a live stream."
        />
      </div>
    );
  }

  if (tab === "models") {
    const merged = [...bookmarks, ...likes].filter(
      (item, i, arr) => arr.findIndex((x) => x.feedKey === item.feedKey) === i,
    );
    return (
      <div className="mt-4">
        <ModelThumbGrid
          items={merged}
          emptyLabel="Models you save or like will appear here."
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <ModelThumbGrid
        items={modelsFromHistory}
        emptyLabel="Your watch history will show up here."
      />
    </div>
  );
}
