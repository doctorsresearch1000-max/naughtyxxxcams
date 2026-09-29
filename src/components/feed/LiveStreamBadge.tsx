"use client";

import type { CrackPerformer } from "@/lib/crackrevenue/api";

type LiveStreamBadgeProps = {
  performer: CrackPerformer;
  feedKey: string;
  visible: boolean;
};

export function LiveStreamBadge({
  performer,
  visible,
}: LiveStreamBadgeProps) {
  if (!visible) return null;

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
    </div>
  );
}
