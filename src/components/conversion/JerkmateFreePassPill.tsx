import { JERKMATE_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";

type JerkmateFreePassPillProps = {
  className?: string;
};

export function JerkmateFreePassPill({ className = "" }: JerkmateFreePassPillProps) {
  return (
    <a
      href={JERKMATE_TRACKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`pointer-events-auto flex max-w-[46vw] items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-md shadow-pink-500/20 transition-all hover:opacity-90 sm:max-w-none md:px-3.5 md:py-1.5 md:text-xs ${className}`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400 animate-pulse md:h-2 md:w-2"
        aria-hidden
      />
      <span className="truncate">🔥 Jerkmate FREE Pass</span>
    </a>
  );
}
