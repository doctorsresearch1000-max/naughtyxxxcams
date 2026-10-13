import Link from "next/link";
import { ApiAvatar } from "@/components/media/ApiAvatar";
import { LiveBadge } from "@/components/cams/LiveBadge";
import {
  StoryAvatarRing,
  storyAvatarInnerClass,
} from "@/components/cams/StoryAvatarRing";
import type { FollowingNearbyItem } from "@/lib/following/followingPageData";

type LiveNearbyCarouselProps = {
  items: FollowingNearbyItem[];
};

const SCROLL_CLASS =
  "nx-chip-scroll hide-scrollbar -mx-0.5 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scroll-smooth px-0.5 py-4 lg:gap-4";

const AVATAR_INNER = storyAvatarInnerClass("circle");

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
    <section className="w-full overflow-visible" aria-label="Following stories">
      <div className={SCROLL_CLASS}>
        {visible.map((item) => {
          const href = item.profilePath ?? item.affiliateUrl;
          const external = !item.profilePath;

          const avatar = (
            <div className="flex w-[76px] shrink-0 snap-start flex-col items-center gap-2 lg:w-20 xl:w-24">
              <StoryAvatarRing shape="circle">
                <div className={AVATAR_INNER}>
                  <ApiAvatar
                    src={item.image}
                    alt={item.label}
                    fill
                    sizes="(max-width: 1280px) 80px, 96px"
                    className="object-cover object-top"
                  />
                  {item.isLive ? (
                    <span className="absolute bottom-1 right-1 z-10">
                      <LiveBadge
                        size="sm"
                        className="!px-1.5 !py-0.5 !text-[10px] !font-bold shadow-lg ring-1 ring-black/40"
                      />
                    </span>
                  ) : null}
                </div>
              </StoryAvatarRing>
              <span
                className="max-w-[90px] truncate text-center text-xs font-medium text-zinc-300"
              >
                {item.label}
              </span>
            </div>
          );

          const wrapperClass =
            "shrink-0 transition-transform duration-200 hover:scale-[1.02]";

          if (external) {
            return (
              <a
                key={item.id}
                href={href}
                target="_blank"
                rel="nofollow noopener"
                className={wrapperClass}
              >
                {avatar}
              </a>
            );
          }

          return (
            <Link key={item.id} href={href} className={wrapperClass}>
              {avatar}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
