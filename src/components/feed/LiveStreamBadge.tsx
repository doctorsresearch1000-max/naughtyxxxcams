"use client";

import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  estimateViewerCount,
  formatViewerCount,
} from "@/lib/feed/viewerCount";

type LiveStreamBadgeProps = {
  performer: CrackPerformer;
  feedKey: string;
  visible: boolean;
};

export function LiveStreamBadge({
  performer,
  feedKey,
  visible,
}: LiveStreamBadgeProps) {
  if (!visible) return null;

  const viewers = formatViewerCount(estimateViewerCount(performer, feedKey));
  const isLive = performer.live !== false;

  return (
    <div
      className="pointer-events-none absolute left-3 top-[max(0.5rem,env(safe-area-inset-top,0px))] z-[28] flex items-center gap-2"
      aria-live="polite"
    >
      {isLive ? (
        <span
          className="inline-flex items-center gap-1.5 rounded-md bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF14] opacity-70" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[#39FF14]" />
          </span>
          Live
        </span>
      ) : null}
      <span
        className="inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="text-neutral-300"
        >
          <path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        </svg>
        {viewers}
      </span>
    </div>
  );
}
