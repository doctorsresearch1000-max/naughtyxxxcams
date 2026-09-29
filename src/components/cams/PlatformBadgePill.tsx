import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { JerkmateLogoMark } from "@/components/cams/JerkmateLogoMark";

export const PLATFORM_BADGE_PILL_CLASS =
  "pointer-events-none absolute bottom-1.5 right-1.5 z-10 flex h-6 w-auto items-center justify-center rounded border border-white/15 bg-black/85 px-1.5 py-0.5 backdrop-blur-xs";

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
