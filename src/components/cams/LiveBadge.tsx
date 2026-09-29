import { uiStrings } from "@/lib/i18n/uiStrings";

type LiveBadgeProps = {
  className?: string;
  size?: "sm" | "md";
};

/** Unified LIVE pill (cards, stories, profile). */
export function LiveBadge({ className = "", size = "sm" }: LiveBadgeProps) {
  const text = size === "sm" ? "text-[9px]" : "text-[10px]";
  const pad = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-[var(--nx-live)] ${pad} ${text} font-black uppercase tracking-wide text-[var(--nx-live-fg)] shadow-sm ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--nx-live-fg)]" aria-hidden />
      {uiStrings.live}
    </span>
  );
}
