"use client";

import { useEffect, useState } from "react";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { uiStrings } from "@/lib/i18n/uiStrings";
import {
  isProfileFavorited,
  toggleProfileFavorite,
} from "@/lib/user/cardFollowStorage";

type SaveToFavoritesButtonProps = {
  profileSlug: string;
};

export function SaveToFavoritesButton({
  profileSlug,
}: SaveToFavoritesButtonProps) {
  const { isAuthenticated, requireAuth } = useTelegramAuth();
  const [saved, setSaved] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    setSaved(isProfileFavorited(profileSlug));
    const onUpdate = () => setSaved(isProfileFavorited(profileSlug));
    window.addEventListener("nx-favorites-update", onUpdate);
    return () => window.removeEventListener("nx-favorites-update", onUpdate);
  }, [profileSlug]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => {
          const next = toggleProfileFavorite(profileSlug);
          setSaved(next);
          setFlash(next ? "Saved locally" : "Removed");
          window.setTimeout(() => setFlash(null), 2000);
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
        <p className="text-center text-[11px] font-medium text-[var(--nx-action)]" role="status">
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
                "Favorites are saved on this device. Sign in to sync across sessions.",
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
