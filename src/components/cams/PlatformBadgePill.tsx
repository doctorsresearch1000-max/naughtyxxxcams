import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { JerkmateLogoMark } from "@/components/cams/JerkmateLogoMark";

export const PLATFORM_BADGE_PILL_CLASS =
  "pointer-events-none absolute bottom-1.5 right-1.5 z-20 flex items-center justify-center rounded-full border border-black/5 bg-white px-2.5 py-1 shadow-sm";

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
      <JerkmateLogoMark className="h-3.5 w-auto object-contain" />
    </span>
  );
}
