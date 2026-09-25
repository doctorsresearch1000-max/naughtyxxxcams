"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { openAffiliateOutbound } from "@/lib/crackrevenue/jerkmateAffiliate";
import { LikeActionButton } from "@/components/feed/LikeActionButton";
import { FeedPoster } from "@/components/feed/FeedPoster";
import {
  IconBookmarkOutline,
  IconCommentOutline,
  IconShareOutline,
  IconVolumeOff,
  IconVolumeOn,
} from "@/components/icons/LineIcons";
import {
  isBookmarked,
  isFollowing,
  toggleBookmark,
  toggleFollowing,
  type SavedModelRef,
} from "@/lib/user/userLibrary";

type FeedActionRailProps = {
  feedKey: string;
  modelRef: SavedModelRef;
  posterUrl: string;
  profileLabel?: string;
  affiliateUrl: string;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
};

export function FeedActionRail({
  feedKey,
  modelRef,
  posterUrl,
  profileLabel = "Model",
  affiliateUrl,
  isActive,
  muted,
  onToggleMute,
}: FeedActionRailProps) {
  const { requireAuth, isAuthenticated } = useTelegramAuth();
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);

  const syncLibraryState = useCallback(() => {
    if (!isAuthenticated) return;
    setSaved(isBookmarked(feedKey));
    setFollowing(isFollowing(feedKey));
  }, [feedKey, isAuthenticated]);

  useEffect(() => {
    syncLibraryState();
  }, [syncLibraryState]);

  useEffect(() => {
    const onLib = () => syncLibraryState();
    window.addEventListener("nx-library-update", onLib);
    return () => window.removeEventListener("nx-library-update", onLib);
  }, [syncLibraryState]);

  if (!isActive) return null;

  const onToggleSave = () => {
    if (!requireAuth("Sign in with Telegram to bookmark models")) return;
    const next = toggleBookmark(modelRef);
    setSaved(next);
  };

  const onToggleFollow = () => {
    if (!requireAuth("Sign in with Telegram to follow models")) return;
    const next = toggleFollowing(modelRef);
    setFollowing(next);
  };

  const onChatAttempt = () => {
    openAffiliateOutbound(affiliateUrl);
  };

  return (
    <>
      <div
        data-feed-action-rail="true"
        className="pointer-events-none absolute bottom-0 right-0 top-0 z-[45] w-[4.75rem]"
      >
        <div className="pointer-events-auto absolute bottom-4 right-3 flex flex-col items-center gap-4">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleMute();
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 shadow-lg backdrop-blur-sm transition-colors active:scale-95 ${
              muted ? "text-white" : "text-[#39FF14]"
            }`}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <IconVolumeOff size={22} strokeWidth={1.65} />
            ) : (
              <IconVolumeOn size={22} strokeWidth={1.65} />
            )}
          </button>

          <div className="relative mb-1">
            <button
              type="button"
              onClick={onToggleFollow}
              className="block h-12 w-12 overflow-hidden rounded-full border-2 border-[#39FF14] bg-black p-0.5 shadow-lg shadow-[#39FF14]/25 transition active:scale-95"
              aria-label={
                following
                  ? `Unfollow ${profileLabel}`
                  : `Follow ${profileLabel}`
              }
              aria-pressed={following}
            >
              <FeedPoster
                feedKey={`${feedKey}-avatar`}
                posterUrl={posterUrl}
                className="h-full w-full rounded-full object-cover"
              />
            </button>
            <span
              className={`pointer-events-none absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-[11px] font-black shadow-md ${
                following
                  ? "bg-[#39FF14] text-black"
                  : "bg-[#EC4899] text-white"
              }`}
              aria-hidden
            >
              {following ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5 10 17.5 19 7.5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                "+"
              )}
            </span>
          </div>

          <LikeActionButton feedKey={feedKey} modelRef={modelRef} />
          <RailAction
            label="Chat"
            onClick={onChatAttempt}
            icon={<IconCommentOutline size={26} strokeWidth={1.65} />}
          />
          <RailAction
            label="Save"
            onClick={onToggleSave}
            active={saved}
            icon={
              <IconBookmarkOutline
                size={26}
                strokeWidth={1.65}
                className={saved ? "text-[#39FF14]" : "text-white"}
              />
            }
          />
          <RailAction
            label="Share"
            icon={<IconShareOutline size={24} strokeWidth={1.65} />}
          />
        </div>
      </div>
    </>
  );
}

function RailAction({
  label,
  onClick,
  icon,
  active = false,
}: {
  label: string;
  onClick?: () => void;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white transition-transform active:scale-90"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center ${
          active ? "text-[#39FF14]" : "text-white"
        }`}
      >
        {icon}
      </span>
      <span
        className={`font-bold ${active ? "text-[#39FF14]" : "text-zinc-200"}`}
      >
        {label}
      </span>
    </button>
  );
}
