import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { JerkmateLogoMark } from "@/components/cams/JerkmateLogoMark";

export const PLATFORM_BADGE_PILL_CLASS =
  "pointer-events-none absolute bottom-1.5 right-1.5 z-20 flex items-center justify-center rounded border border-white/10 bg-black/80 px-2 py-1 backdrop-blur-xs";

type PlatformBadgePillProps = {
  performer?: FeedPerformer | null;
  /** Native Jerkmate ad / promo slot (no performer record). */
  jerkmate?: boolean;
  className?: string;
};

/** @deprecated Catalog cards always use the Jerkmate logo watermark (no STREAMATE text). */
export function isJerkmatePlatformContext(
  performer?: FeedPerformer | null,
  jerkmateSlot = false,
): boolean {
  if (jerkmateSlot) return true;
  if (!performer) return false;
  const src = performer.systemSource?.trim().toLowerCase() ?? "";
  if (src.includes("jerk")) return true;
  const key = performer.feedKey?.trim().toLowerCase() ?? "";
  if (key.includes("jerkmate")) return true;
  const room = performer.roomUrl?.trim().toLowerCase() ?? "";
  return room.includes("jerkmate");
}

/**
 * Bottom-right platform watermark for grid cards.
 * Always renders the Jerkmate logo asset — never plain "STREAMATE" text
 * (API `systemSource: streamate` is intentionally not shown as copy).
 */
export function PlatformBadgePill({
  performer,
  jerkmate = false,
  className = "",
}: PlatformBadgePillProps) {
  if (!jerkmate && !performer) return null;

  return (
    <span
      className={`${PLATFORM_BADGE_PILL_CLASS} ${className}`}
      data-platform-badge="jerkmate"
    >
      <JerkmateLogoMark className="h-3.5 w-auto object-contain" />
    </span>
  );
}
