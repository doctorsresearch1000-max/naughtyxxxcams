"use client";

import { IconHeartFilled, IconHeartOutline } from "@/components/icons/LineIcons";
import { useFeedLikes } from "@/hooks/useFeedLikes";
import type { SavedModelRef } from "@/lib/user/userLibrary";

type LikeActionButtonProps = {
  feedKey: string;
  modelRef?: SavedModelRef;
  className?: string;
};

export function LikeActionButton({
  feedKey,
  modelRef,
  className = "",
}: LikeActionButtonProps) {
  const { liked, label, toggleLike, popping } = useFeedLikes(feedKey, modelRef);

  return (
    <button
      type="button"
      onClick={toggleLike}
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-transform active:scale-90 ${className}`}
    >
      <span
        className={`relative flex h-8 w-8 items-center justify-center transition-transform duration-200 ease-out ${
          popping ? "scale-110" : "scale-100"
        } ${liked ? "text-[#39FF14]" : "text-white"}`}
      >
        <span
          className={`absolute inset-0 rounded-full bg-[#39FF14]/25 blur-md transition-opacity duration-200 ${
            liked ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />
        <span className="relative">
          {liked ? (
            <IconHeartFilled size={26} />
          ) : (
            <IconHeartOutline size={26} strokeWidth={1.65} />
          )}
        </span>
      </span>
      <span
        className={`font-bold tabular-nums transition-colors duration-150 ${
          liked ? "text-[#39FF14]" : "text-zinc-200"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
