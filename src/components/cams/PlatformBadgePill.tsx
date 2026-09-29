import type { FeedPerformer } from "@/lib/feed/filterPerformers";

const PILL_CLASS =
  "absolute bottom-1.5 right-1.5 z-10 flex items-center justify-center rounded border border-white/10 bg-black/80 px-2 py-1 backdrop-blur-xs";

type PlatformBadgePillProps = {
  performer?: FeedPerformer | null;
  /** Native Jerkmate ad slot (no performer record). */
  jerkmate?: boolean;
  className?: string;
};

function providerTextLabel(performer: FeedPerformer): string {
  const src = performer.systemSource?.trim();
  if (!src) return "STREAMATE";
  const lower = src.toLowerCase();
  if (lower === "jerkmate") return "JERKMATE";
  const cleaned = src.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return cleaned || "STREAMATE";
}

export function PlatformBadgePill({
  performer,
  jerkmate = false,
  className = "",
}: PlatformBadgePillProps) {
  const isJerkmate =
    jerkmate ||
    performer?.systemSource?.trim().toLowerCase() === "jerkmate";

  if (isJerkmate) {
    return (
      <span className={`${PILL_CLASS} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/jerkmate.png"
          className="h-3.5 w-auto object-contain"
          alt="Jerkmate"
          width={72}
          height={14}
        />
      </span>
    );
  }

  const label = performer ? providerTextLabel(performer) : "STREAMATE";

  return (
    <span className={`${PILL_CLASS} ${className}`}>
      <span className="text-[9px] font-extrabold uppercase text-zinc-200">
        {label}
      </span>
    </span>
  );
}
