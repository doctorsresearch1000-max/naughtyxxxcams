"use client";

import { useState } from "react";
import { ConversionSlideSheet } from "@/components/conversion/ConversionSlideSheet";
import { LikeActionButton } from "@/components/feed/LikeActionButton";
import { FeedPerformerLink } from "@/components/feed/FeedPerformerLink";
import { FeedPoster } from "@/components/feed/FeedPoster";

type FeedActionRailProps = {
  feedKey: string;
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
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!isActive) return null;

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
            onClick={onToggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 text-base shadow-lg backdrop-blur-sm"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
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
              className="absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-[#39FF14] to-[#00FF7F] text-xs font-black text-black shadow-md"
              aria-label="Follow"
            >
              +
            </button>
          </div>

          <LikeActionButton feedKey={feedKey} />
          <ActionButton icon="💬" label="Chat" onClick={onChatAttempt} />
          <ActionButton icon="⭐" label="Save" />
          <ActionButton icon="🚀" label="Share" variant="circle" />
        </div>
      </div>
    </>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  variant?: "default" | "circle";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-white transition-transform active:scale-90"
    >
      {variant === "circle" ? (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#39FF14] to-[#00FF7F] text-base text-black shadow-lg shadow-[#39FF14]/30">
          {icon}
        </div>
      ) : (
        <span className="text-2xl">{icon}</span>
      )}
      <span className="font-bold text-zinc-300">{label}</span>
    </button>
  );
}
