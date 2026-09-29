import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { JerkmateLogoMark } from "@/components/cams/JerkmateLogoMark";

export const PLATFORM_BADGE_PILL_CLASS =
  "pointer-events-none absolute bottom-1.5 right-1.5 z-10 flex items-center justify-center overflow-hidden rounded border border-white/10 bg-black/80 px-2 py-1 backdrop-blur-xs";

type PlatformBadgePillProps = {
  performer: FeedPerformer;
  className?: string;
};

/** Jerkmate logo watermark — model catalog cards only (not sponsored ad slots). */
export function PlatformBadgePill({
  performer,
  className = "",
}: PlatformBadgePillProps) {
  return (
    <span
      className={`${PLATFORM_BADGE_PILL_CLASS} ${className}`}
      data-platform-badge="jerkmate"
      data-feed-key={performer.feedKey}
    >
      <JerkmateLogoMark />
    </span>
  );
}
