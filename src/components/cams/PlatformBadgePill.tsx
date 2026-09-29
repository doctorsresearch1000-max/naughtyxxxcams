import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { JERKMATE_LOGO_SRC } from "@/components/cams/JerkmateLogoMark";

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
      className={`absolute bottom-1.5 right-1.5 left-auto top-auto z-10 flex h-5.5 w-auto items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/85 px-2 py-0.5 backdrop-blur-xs pointer-events-none md:h-6 ${className}`}
      data-platform-badge="jerkmate"
      data-feed-key={performer.feedKey}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={JERKMATE_LOGO_SRC}
        className="block h-4 w-auto object-contain md:h-4.5"
        alt="Jerkmate"
        width={64}
        height={16}
        decoding="async"
      />
    </span>
  );
}
