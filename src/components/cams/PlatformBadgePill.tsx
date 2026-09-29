import type { FeedPerformer } from "@/lib/feed/filterPerformers";

/** Corner pill — use pixel arbitrary sizes (Tailwind default theme has no h-4.5 / h-6.5). */
const PILL_CLASS =
  "pointer-events-none absolute bottom-1.5 right-1.5 left-auto top-auto z-10 m-0 inline-flex h-5 max-h-5 w-auto max-w-[min(42vw,5.5rem)] shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/85 px-1.5 py-0.5 backdrop-blur-sm md:h-[22px] md:max-h-[22px]";

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
        alt="Jerkmate"
        data-jerkmate-badge="true"
        className="block h-[13px] w-auto max-h-[13px] max-w-[4.25rem] object-contain object-left md:h-[15px] md:max-h-[15px] md:max-w-[4.75rem]"
        decoding="async"
      />
    </span>
  );
}
