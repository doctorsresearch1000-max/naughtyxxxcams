import Link from "next/link";
import { ApiAvatar } from "@/components/media/ApiAvatar";
import type { FollowingNearbyItem } from "@/lib/following/followingPageData";

type LiveNearbyCarouselProps = {
  items: FollowingNearbyItem[];
};

export function LiveNearbyCarousel({ items }: LiveNearbyCarouselProps) {
  const visible = items.filter((item) => item.image?.trim());

  if (visible.length === 0) {
    return (
      <p className="text-xs text-neutral-500">
        No live story previews right now — check back shortly.
      </p>
    );
  }

  return (
    <div
      className="hide-scrollbar -mx-1 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-2 pl-0.5 pr-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {visible.map((item) => {
        const href = item.profilePath ?? item.affiliateUrl;
        const external = !item.profilePath;

        const avatar = (
          <div
            className={`relative rounded-full p-[2px] shadow-md ${
              item.isLive
                ? "bg-gradient-to-tr from-[#39FF14] via-[#00FF7F] to-emerald-400 shadow-[#39FF14]/25"
                : "bg-zinc-700/80"
            }`}
          >
            <div className="relative h-[3.75rem] w-[3.75rem] overflow-hidden rounded-full border-2 border-[#0A0A0A] bg-[#1C1C1E]">
              <ApiAvatar
                src={item.image}
                alt={item.label}
                fill
                sizes="60px"
                className="object-cover"
              />
            </div>
            {item.isLive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-[#0A0A0A] bg-[#39FF14] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-black">
                LIVE
              </span>
            )}
          </div>
        );

        const content = (
          <>
            {avatar}
            <span className="mt-2 max-w-[68px] truncate text-center text-[10px] font-semibold text-zinc-300">
              {item.label}
            </span>
          </>
        );

        if (external) {
          return (
            <a
              key={item.id}
              href={href}
              target="_blank"
              rel="nofollow noopener"
              className="flex shrink-0 flex-col items-center transition active:scale-[0.97]"
            >
              {content}
            </a>
          );
        }

        return (
          <Link
            key={item.id}
            href={href}
            className="flex shrink-0 flex-col items-center transition active:scale-[0.97]"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
