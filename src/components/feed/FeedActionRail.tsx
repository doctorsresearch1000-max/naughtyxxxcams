"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { ConversionSlideSheet } from "@/components/conversion/ConversionSlideSheet";
import { LikeActionButton } from "@/components/feed/LikeActionButton";
import { FeedPerformerLink } from "@/components/feed/FeedPerformerLink";
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
  toggleBookmark,
  type SavedModelRef,
} from "@/lib/user/userLibrary";

type FeedActionRailProps = {
  feedKey: string;
  modelRef: SavedModelRef;
  posterUrl: string;
  profileHref?: string | null;
  profileLabel?: string;
  modelName: string;
  affiliateUrl: string;
  conversionReady: boolean;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
};

export function FeedActionRail({
  feedKey,
  modelRef,
  posterUrl,
  profileHref,
  profileLabel = "View profile",
  modelName,
  affiliateUrl,
  conversionReady,
  isActive,
  muted,
  onToggleMute,
}: FeedActionRailProps) {
  const { requireAuth, isAuthenticated } = useTelegramAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setSaved(isBookmarked(feedKey));
    }
  }, [feedKey, isAuthenticated]);

  useEffect(() => {
    const onLib = () => {
      if (isAuthenticated) setSaved(isBookmarked(feedKey));
    };
    window.addEventListener("nx-library-update", onLib);
    return () => window.removeEventListener("nx-library-update", onLib);
  }, [feedKey, isAuthenticated]);

  if (!isActive) return null;

  const onToggleSave = () => {
    if (!requireAuth("Sign in with Telegram to bookmark models")) return;
    const next = toggleBookmark(modelRef);
    setSaved(next);
  };

  const onChatAttempt = () => {
    if (conversionReady) {
      window.open(affiliateUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setSheetOpen(true);
  };

  return (
    <>
      <ConversionSlideSheet
        open={sheetOpen}
        modelName={modelName}
        affiliateUrl={affiliateUrl}
        onClose={() => setSheetOpen(false)}
      />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-[45] w-[4.75rem]">
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
            {profileHref ? (
              <FeedPerformerLink
                href={profileHref}
                ariaLabel={`View profile ${profileLabel}`}
                className="block h-12 w-12 overflow-hidden rounded-full border-2 border-[#39FF14] bg-black p-0.5 shadow-lg shadow-[#39FF14]/25 transition active:scale-95"
              >
                <FeedPoster
                  feedKey={`${feedKey}-avatar`}
                  posterUrl={posterUrl}
                  className="h-full w-full rounded-full object-cover"
                />
              </FeedPerformerLink>
            ) : (
              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#39FF14] bg-black p-0.5 shadow-lg shadow-[#39FF14]/25">
                <FeedPoster
                  feedKey={`${feedKey}-avatar`}
                  posterUrl={posterUrl}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            )}
            <button
              type="button"
              className="absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-[#39FF14] text-xs font-black text-black shadow-md"
              aria-label="Follow model"
            >
              +
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
