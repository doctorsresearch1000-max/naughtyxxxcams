"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { stashPendingFollow } from "@/lib/auth/telegramPendingFollow";
import { ConversionSlideSheet } from "@/components/conversion/ConversionSlideSheet";
import { LikeActionButton } from "@/components/feed/LikeActionButton";
import { FeedPoster } from "@/components/feed/FeedPoster";
import {
  IconBookmarkOutline,
  IconCommentOutline,
  IconTelegram,
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
  profilePath?: string | null;
  modelName?: string;
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
  profilePath = null,
  modelName = "Model",
  affiliateUrl,
  isActive,
  muted,
  onToggleMute,
}: FeedActionRailProps) {
  const { requireAuth, isAuthenticated } = useTelegramAuth();
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const displayName =
    modelName?.replace(/^@+/, "").trim() || profileLabel.replace(/^@+/, "");

  const syncLibraryState = useCallback(() => {
    if (!isAuthenticated) {
      setSaved(false);
      setFollowing(false);
      return;
    }
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

  useEffect(() => {
    if (!isActive) {
      setChatSheetOpen(false);
    }
  }, [isActive]);

  const applyFollow = useCallback(() => {
    const next = toggleFollowing(modelRef);
    setFollowing(next);
  }, [modelRef]);

  if (!isActive) return null;

  const onToggleSave = () => {
    if (!requireAuth("Sign in with Telegram to bookmark models")) return;
    const next = toggleBookmark(modelRef);
    setSaved(next);
  };

  const onToggleFollow = () => {
    if (following) {
      if (!requireAuth("Inicia sesión para gestionar los modelos que sigues")) {
        return;
      }
      applyFollow();
      return;
    }

    if (!isAuthenticated) {
      stashPendingFollow(modelRef);
      requireAuth(
        {
          title: `Inicia sesión para seguir a ${displayName}`,
          description:
            "Guarda tus modelos favoritos y accede a ellos cuando vuelvas.",
          edgeAttached: true,
          ctaLabel: "Continuar con Telegram",
        },
        () => {
          if (!isFollowing(feedKey)) {
            const next = toggleFollowing(modelRef);
            setFollowing(next);
          } else {
            setFollowing(true);
          }
        },
      );
      return;
    }

    applyFollow();
  };

  const onChatAttempt = () => {
    setChatSheetOpen(true);
  };

  const onShareTelegram = () => {
    const handle = modelRef.nameClean || modelRef.name || profileLabel;
    const text = `Watch ${handle} live on NaughtyXXXCams`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      affiliateUrl,
    )}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        data-feed-action-rail="true"
        className="pointer-events-none absolute bottom-0 right-0 top-0 z-[45] w-[4.75rem]"
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-auto absolute right-3 flex flex-col items-center gap-4 touch-manipulation"
          style={{ bottom: "var(--feed-bottom-clearance)" }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleMute();
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 shadow-lg backdrop-blur-sm transition-colors active:scale-95 ${
              muted ? "text-white" : "text-[#39FF14]"
            }`}
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={!muted}
          >
            {muted ? (
              <IconVolumeOff size={22} strokeWidth={1.65} />
            ) : (
              <IconVolumeOn size={22} strokeWidth={1.65} />
            )}
          </button>

          <div className="relative mb-1">
            {profilePath ? (
              <Link
                href={profilePath}
                onClick={(e) => e.stopPropagation()}
                className="block h-12 w-12 overflow-hidden rounded-full border-2 border-[#39FF14] bg-black p-0.5 shadow-lg shadow-[#39FF14]/25 transition active:scale-95"
                aria-label={`View profile ${profileLabel}`}
              >
                <FeedPoster
                  feedKey={`${feedKey}-avatar`}
                  posterUrl={posterUrl}
                  className="h-full w-full rounded-full object-cover"
                />
              </Link>
            ) : (
              <span
                className="block h-12 w-12 overflow-hidden rounded-full border-2 border-[#39FF14] bg-black p-0.5 shadow-lg shadow-[#39FF14]/25"
                aria-hidden
              >
                <FeedPoster
                  feedKey={`${feedKey}-avatar`}
                  posterUrl={posterUrl}
                  className="h-full w-full rounded-full object-cover"
                />
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFollow();
              }}
              className={`absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-[11px] font-black shadow-md transition active:scale-95 ${
                following
                  ? "bg-[#39FF14] text-black"
                  : "bg-[#EC4899] text-white"
              }`}
              aria-label={
                following
                  ? `Unfollow ${profileLabel}`
                  : `Follow ${profileLabel}`
              }
              aria-pressed={following}
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
            </button>
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
            onClick={onShareTelegram}
            icon={<IconTelegram size={24} className="text-[#2AABEE]" />}
          />
        </div>
      </div>

      {chatSheetOpen ? (
        <ConversionSlideSheet
          open
          modelName={displayName}
          affiliateUrl={affiliateUrl}
          onClose={() => setChatSheetOpen(false)}
          edgeAttached
          title={`Want to chat with ${displayName}?`}
          description="Join her private chat and start talking to her."
          ctaLabel={`Chat with ${displayName}`}
        />
      ) : null}
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
