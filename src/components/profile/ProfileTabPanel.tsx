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
  following: SavedModelRef[];
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

function CollectionSquareTile({ playlist }: { playlist: Playlist }) {
  const count = playlist.items.length;
  const latest = playlist.items[0];

  return (
    <Link
      href={`/profile/playlists/${playlist.id}`}
      className="flex aspect-square flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 p-2"
    >
      <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-lg bg-zinc-950">
        {latest?.posterUrl ? (
          <Image
            src={latest.posterUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 45vw, 120px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-zinc-600">
            +
          </div>
        )}
      </div>
      <div className="pt-2">
        <p className="truncate text-xs font-bold text-white">{playlist.name}</p>
        <p className="text-[10px] text-zinc-500">{count} saved</p>
      </div>
    </Link>
  );
}

export function ProfileTabPanel({
  tab,
  bookmarks,
  likes,
  following,
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
          className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
        >
          <span className="text-lg leading-none">+</span>
          New collection
        </button>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {playlists.map((pl) => (
              <CollectionSquareTile key={pl.id} playlist={pl} />
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-zinc-500">
            Save streams from the feed or create a collection.
          </p>
        )}
        {bookmarks.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              All saved
            </p>
            <ModelThumbGrid
              items={bookmarks}
              emptyLabel="No saved models yet."
            />
          </div>
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
    const merged = [...following, ...bookmarks, ...likes].filter(
      (item, i, arr) => arr.findIndex((x) => x.feedKey === item.feedKey) === i,
    );
    return (
      <div className="mt-4">
        <ModelThumbGrid
          items={merged}
          emptyLabel="Tap a model avatar on the feed to follow and add them here."
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
