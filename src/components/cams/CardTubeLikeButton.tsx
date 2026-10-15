"use client";

import { IconHeartFilled, IconHeartOutline } from "@/components/icons/LineIcons";
import { useFeedLikes } from "@/hooks/useFeedLikes";

type CardTubeLikeButtonProps = {
  feedKey: string;
};

/** Desktop grid heart — localStorage toggle, pink active state. */
export function CardTubeLikeButton({ feedKey }: CardTubeLikeButtonProps) {
  const { liked, label, toggleLike, popping } = useFeedLikes(feedKey);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike();
      }}
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      className={`flex flex-col items-center gap-0.5 rounded-lg p-0.5 transition-transform active:scale-95 ${
        popping ? "scale-110" : "scale-100"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-colors ${
          liked
            ? "bg-pink-600 text-white hover:bg-rose-500"
            : "bg-black/55 text-white backdrop-blur-sm hover:bg-pink-600/85"
        }`}
      >
        {liked ? (
          <IconHeartFilled size={15} />
        ) : (
          <IconHeartOutline size={15} strokeWidth={1.75} />
        )}
      </span>
      <span
        className={`min-w-[1.75rem] rounded-md px-1 text-center text-[9px] font-bold tabular-nums leading-none ${
          liked ? "text-pink-400" : "text-zinc-300"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
