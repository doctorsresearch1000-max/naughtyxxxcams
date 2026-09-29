import type { FeedPerformer } from "@/lib/feed/filterPerformers";

type PlatformBadgePillProps = {
  performer: FeedPerformer;
  className?: string;
};

/** Stripchat-scale Jerkmate watermark — model cards only. */
export function PlatformBadgePill({
  performer,
  className = "",
}: PlatformBadgePillProps) {
  return (
    <span
      className={`absolute bottom-1.5 right-1.5 left-auto top-auto z-10 m-0 flex h-5 w-auto shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/85 px-2 py-0.5 backdrop-blur-xs pointer-events-none md:h-5.5 ${className}`}
      data-platform-badge="jerkmate"
      data-feed-key={performer.feedKey}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/jerkmate.png"
        className="block h-3.5 w-auto object-contain md:h-4"
        alt="Jerkmate"
        width={64}
        height={14}
        decoding="async"
      />
    </span>
  );
}
