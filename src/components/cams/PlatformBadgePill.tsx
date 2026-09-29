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
  if (room.includes("jerkmate")) return true;

  return false;
}

function catalogProviderTextLabel(performer: FeedPerformer): string | null {
  const src = performer.systemSource?.trim();
  if (!src) return null;
  const lower = src.toLowerCase();
  if (lower.includes("jerk")) return null;
  const cleaned = src.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return cleaned.length > 0 ? cleaned : null;
}

export function PlatformBadgePill({
  performer,
  jerkmate = false,
  className = "",
}: PlatformBadgePillProps) {
  const showJerkmateLogo = isJerkmatePlatformContext(performer, jerkmate);

  if (showJerkmateLogo) {
    return (
      <span
        className={`${PLATFORM_BADGE_PILL_CLASS} ${className}`}
        data-platform-badge="jerkmate"
      >
        <JerkmateLogoMark />
      </span>
    );
  }

  if (!performer) return null;

  const label = catalogProviderTextLabel(performer);
  if (!label) return null;

  return (
    <span
      className={`${PLATFORM_BADGE_PILL_CLASS} ${className}`}
      data-platform-badge="provider"
    >
      <span className="text-[9px] font-extrabold uppercase text-zinc-200">
        {label}
      </span>
    </span>
  );
}
