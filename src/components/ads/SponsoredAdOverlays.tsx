type SponsoredAdOverlaysProps = {
  badge?: "AD" | "SPONSORED";
  showLive?: boolean;
};

export function SponsoredAdOverlays({
  badge = "SPONSORED",
  showLive = true,
}: SponsoredAdOverlaysProps) {
  return (
    <>
      <span
        className="absolute left-1.5 top-1.5 z-10 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-200"
      >
        {badge}
      </span>
      {showLive ? (
        <span
          className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 rounded-md bg-pink-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-pink-300 motion-safe:animate-pulse"
            aria-hidden
          />
          LIVE
        </span>
      ) : null}
    </>
  );
}

export function SponsoredFreePromoLine({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-wide text-pink-400 ${className}`}
    >
      FREE PROMO
    </p>
  );
}
