import Image from "next/image";
import { liveNearby } from "@/data/mock";

export function LiveNearbyCarousel() {
  return (
    <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4">
      {liveNearby.map((item) => (
        <button
          key={item.id}
          type="button"
          className="relative shrink-0 text-center"
          aria-label={`${item.username}${item.isLive ? " live" : ""}`}
        >
          <div
            className={`relative h-20 w-20 overflow-hidden rounded-full ${
              item.isLive
                ? "ring-2 ring-magenta ring-offset-2 ring-offset-night shadow-neon"
                : "ring-1 ring-white/20"
            }`}
          >
            <Image
              src={item.avatar}
              alt={item.username}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
            {item.isLive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-magenta px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                Live
              </span>
            )}
          </div>
          <p className="mt-2 max-w-[5rem] truncate text-[11px] text-slate-300">
            @{item.username}
          </p>
        </button>
      ))}
    </div>
  );
}
