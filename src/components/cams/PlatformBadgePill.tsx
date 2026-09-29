import type { FeedPerformer } from "@/lib/feed/filterPerformers";

const PILL_CLASS =
  "absolute bottom-1.5 right-1.5 left-auto top-auto z-10 m-0 bg-black/85 backdrop-blur-xs border border-white/15 rounded-full px-2.5 py-1 flex items-center justify-center h-6.5 md:h-7 w-auto shrink-0 pointer-events-none";

type PlatformBadgePillProps = {
  performer: FeedPerformer;
};

/** Jerkmate watermark — compact corner pill on model grid cards only. */
export function PlatformBadgePill({ performer }: PlatformBadgePillProps) {
  return (
    <span
      className={PILL_CLASS}
      data-platform-badge="jerkmate"
      data-feed-key={performer.feedKey}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/jerkmate.png"
        className="h-4.5 md:h-5 w-auto object-contain block"
        alt="Jerkmate"
        decoding="async"
      />
    </span>
  );
}
