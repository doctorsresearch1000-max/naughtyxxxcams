"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Playlist, SavedModelRef } from "@/lib/user/userLibrary";
import {
  createPlaylist,
  saveModelToCollection,
} from "@/lib/user/userLibrary";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type AddToCollectionModalProps = {
  open: boolean;
  modelRef: SavedModelRef | null;
  playlists: Playlist[];
  onClose: () => void;
  onSaved?: () => void;
  /** Profile “new collection” without a model — only shows create flow */
  createOnly?: boolean;
};

export function AddToCollectionModal({
  open,
  modelRef,
  playlists,
  onClose,
  onSaved,
  createOnly = false,
}: AddToCollectionModalProps) {
  const [creating, setCreating] = useState(createOnly);
  const [newName, setNewName] = useState("Favorites");

  useEffect(() => {
    if (!open) return;
    setCreating(createOnly);
    setNewName("Favorites");
  }, [open, createOnly]);

  if (!open) return null;

  const label = modelRef
    ? performerDisplayHandle(
        modelRef.nameClean || modelRef.name || "Model",
      )
    : null;

  const onPick = (playlistId: string) => {
    if (!modelRef) return;
    saveModelToCollection(playlistId, modelRef);
    onSaved?.();
    onClose();
  };

  const onCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const pl = createPlaylist(trimmed);
    if (modelRef) {
      saveModelToCollection(pl.id, modelRef);
      onSaved?.();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-collection-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-800 px-4 py-3">
          <h2
            id="add-collection-title"
            className="text-base font-bold text-white"
          >
            {createOnly ? "New collection" : "Add to a collection"}
          </h2>
          {label ? (
            <p className="mt-0.5 truncate text-sm text-zinc-400">{label}</p>
          ) : null}
        </div>

        {creating ? (
          <div className="space-y-3 p-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/60"
              autoFocus
            />
            <div className="flex gap-2 pt-1">
              {!createOnly ? (
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300"
                >
                  Back
                </button>
              ) : null}
              <button
                type="button"
                onClick={onCreate}
                className="flex-1 rounded-xl bg-pink-600 py-2.5 text-sm font-bold text-white"
              >
                Create
              </button>
            </div>
          </div>
        ) : (
          <div className="max-h-[min(50vh,360px)] overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 text-sm font-bold text-white"
            >
              <span className="text-lg leading-none">+</span>
              Create new collection
            </button>
            {playlists.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-zinc-500">
                No collections yet — create one above.
              </p>
            ) : (
              <ul className="space-y-1">
                {playlists.map((pl) => {
                  const thumb = pl.items[0]?.posterUrl;
                  return (
                    <li key={pl.id}>
                      <button
                        type="button"
                        onClick={() => onPick(pl.id)}
                        disabled={!modelRef}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-zinc-900 disabled:opacity-50"
                      >
                        <div
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800"
                        >
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-zinc-600">
                              +
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {pl.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {pl.items.length} saved
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <div className="border-t border-zinc-800 p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-zinc-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
