import Link from "next/link";
import { ApiAvatar } from "@/components/media/ApiAvatar";
import { LiveBadge } from "@/components/cams/LiveBadge";
import { StoryAvatarRing } from "@/components/cams/StoryAvatarRing";
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
      className="nx-chip-scroll hide-scrollbar -mx-1 flex min-h-[108px] snap-x snap-mandatory gap-3.5 overflow-x-auto overflow-y-visible scroll-smooth pb-2 pl-0.5 pr-3 lg:min-h-[116px] lg:gap-4"
    >
      {visible.map((item) => {
        const href = item.profilePath ?? item.affiliateUrl;
        const external = !item.profilePath;

        const avatar = (
          <StoryAvatarRing>
            <div className="relative h-[3.75rem] w-[3.75rem] overflow-hidden rounded-full border-2 border-[#0A0A0A] bg-[#1C1C1E]">
              <ApiAvatar
                src={item.image}
                alt={item.label}
                fill
                sizes="60px"
                className="object-cover"
              />
              {item.isLive ? (
                <span className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/80 to-transparent pb-0.5 pt-2">
                  <LiveBadge className="scale-[0.72] origin-bottom" />
                </span>
              ) : null}
            </div>
          </StoryAvatarRing>
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
