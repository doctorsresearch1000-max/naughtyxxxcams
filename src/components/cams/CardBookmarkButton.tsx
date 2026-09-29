"use client";

import { useCallback, useEffect, useState } from "react";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { useSaveToCollection } from "@/components/collections/SaveToCollectionProvider";
import { IconHeartFilled, IconHeartOutline } from "@/components/icons/LineIcons";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { savedModelRefFromPerformer } from "@/lib/user/savedModelRef";
import { isBookmarked, toggleBookmark } from "@/lib/user/userLibrary";

type CardBookmarkButtonProps = {
  performer: FeedPerformer;
  className?: string;
};

/**
 * Heart on grid cards — same bookmark + collection modal flow as profile.
 */
export function CardBookmarkButton({
  performer,
  className = "absolute left-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm",
}: CardBookmarkButtonProps) {
  const { requireAuth } = useTelegramAuth();
  const { openSaveModal } = useSaveToCollection();
  const modelRef = savedModelRefFromPerformer(performer);
  const feedKey = modelRef.feedKey;

  const [saved, setSaved] = useState(() => isBookmarked(feedKey));

  const syncSaved = useCallback(() => {
    setSaved(isBookmarked(feedKey));
  }, [feedKey]);

  useEffect(() => {
    syncSaved();
    const onUpdate = () => syncSaved();
    window.addEventListener("nx-library-update", onUpdate);
    return () => window.removeEventListener("nx-library-update", onUpdate);
  }, [syncSaved]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth("Sign in with Telegram to save models")) return;
    if (saved) {
      const next = toggleBookmark(modelRef);
      setSaved(next);
      return;
    }
    openSaveModal(modelRef, () => setSaved(true));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={saved ? "Remove from saved" : "Save to collection"}
      aria-pressed={saved}
    >
      {saved ? (
        <IconHeartFilled size={16} className="text-[var(--nx-action)]" />
      ) : (
        <IconHeartOutline size={16} className="text-white" strokeWidth={1.5} />
      )}
    </button>
  );
}
