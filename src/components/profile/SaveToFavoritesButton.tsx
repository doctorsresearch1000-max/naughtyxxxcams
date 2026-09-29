"use client";

import { useEffect, useState } from "react";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { useSaveToCollection } from "@/components/collections/SaveToCollectionProvider";
import { uiStrings } from "@/lib/i18n/uiStrings";
import type { SavedModelRef } from "@/lib/user/userLibrary";
import { isBookmarked, toggleBookmark } from "@/lib/user/userLibrary";

type SaveToFavoritesButtonProps = {
  modelRef: SavedModelRef;
};

export function SaveToFavoritesButton({ modelRef }: SaveToFavoritesButtonProps) {
  const { isAuthenticated, requireAuth } = useTelegramAuth();
  const { openSaveModal } = useSaveToCollection();
  const feedKey = modelRef.feedKey;
  const [saved, setSaved] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const syncSaved = () => setSaved(isBookmarked(feedKey));

  useEffect(() => {
    syncSaved();
    const onUpdate = () => syncSaved();
    window.addEventListener("nx-library-update", onUpdate);
    return () => window.removeEventListener("nx-library-update", onUpdate);
  }, [feedKey]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => {
          if (!requireAuth("Sign in with Telegram to save models")) return;
          if (saved) {
            const next = toggleBookmark(modelRef);
            setSaved(next);
            setFlash(next ? null : "Removed");
            window.setTimeout(() => setFlash(null), 2000);
            return;
          }
          openSaveModal(modelRef, () => {
            setSaved(true);
            setFlash("Saved");
            window.setTimeout(() => setFlash(null), 2000);
          });
        }}
        className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
          saved
            ? "border-[var(--nx-action)]/50 bg-[var(--nx-action)]/10 text-[var(--nx-action)]"
            : "border-white/10 bg-[#1C1C1E] text-white"
        }`}
        aria-pressed={saved}
      >
        <span aria-hidden>{saved ? "♥" : "🔖"}</span>
        {saved ? "Saved" : uiStrings.saveFavorites}
      </button>
      {flash ? (
        <p
          className="text-center text-[11px] font-medium text-[var(--nx-action)]"
          role="status"
        >
          {flash}
        </p>
      ) : null}
      {!isAuthenticated ? (
        <button
          type="button"
          onClick={() =>
            requireAuth({
              title: "Sync with Telegram",
              description:
                "Collections are saved on this device. Sign in to sync across sessions.",
              ctaLabel: "Continue with Telegram",
            })
          }
          className="mx-auto block text-center text-[10px] font-medium text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline"
        >
          Stored on this device — sync with Telegram
        </button>
      ) : (
        <p className="text-center text-[10px] text-zinc-500">
          Synced with your Telegram session.
        </p>
      )}
    </div>
  );
}
