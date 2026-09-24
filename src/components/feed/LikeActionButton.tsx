"use client";

import { useFeedLikes } from "@/hooks/useFeedLikes";

type LikeActionButtonProps = {
  feedKey: string;
  className?: string;
};

export function LikeActionButton({ feedKey, className = "" }: LikeActionButtonProps) {
  const { liked, label, toggleLike, popping } = useFeedLikes(feedKey);

  return (
    <button
      type="button"
      onClick={toggleLike}
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-transform active:scale-90 ${className}`}
    >
      <span
        className={`relative text-2xl transition-transform duration-300 ease-out ${
          popping ? "scale-125" : "scale-100"
        } ${liked ? "text-[#39FF14]" : "text-white"}`}
      >
        <span
          className={`absolute inset-0 rounded-full bg-[#39FF14]/30 blur-md transition-opacity duration-300 ${
            liked ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />
        <span className="relative">{liked ? "❤️" : "🤍"}</span>
      </span>
      <span
        className={`font-bold tabular-nums transition-colors duration-200 ${
          liked ? "text-[#39FF14]" : "text-zinc-300"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
