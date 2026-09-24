import Image from "next/image";
import Link from "next/link";
import type { FollowingLiveCard } from "@/lib/following/followingPageData";
import { performerDisplayHandle } from "@/lib/profile/performerHandle";

type FollowingLiveGridProps = {
  cards: FollowingLiveCard[];
};

export function FollowingLiveGrid({ cards }: FollowingLiveGridProps) {
  const visible = cards.filter((c) => c.image?.trim());
  if (visible.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
      {visible.map((card) => {
        const handle = performerDisplayHandle(card.username);
        return (
          <article
            key={card.id}
            className="group relative aspect-[3/4] overflow-hidden rounded-[22px] bg-[#1C1C1E] shadow-[0_8px_32px_rgba(0,0,0,0.45)] ring-1 ring-white/5 transition duration-300 active:scale-[0.99]"
          >
            <Image
              src={card.image}
              alt={handle}
              fill
              sizes="(max-width: 448px) 46vw, 200px"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/50" />
            <a
              href={card.affiliateUrl}
              target="_blank"
              rel="nofollow noopener"
              className="absolute inset-0 z-0"
              aria-label={`Watch live ${handle}`}
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
              <span className="flex w-fit items-center gap-1 rounded-lg bg-[#39FF14] px-2 py-0.5 text-[9px] font-black tracking-wide text-black shadow-lg shadow-[#39FF14]/30">
                ((o)) EN VIVO
              </span>
              <div className="space-y-1">
                {card.profilePath ? (
                  <Link
                    href={card.profilePath}
                    className="pointer-events-auto relative z-10 block text-sm font-extrabold text-white"
                  >
                    {handle}
                  </Link>
                ) : (
                  <h3 className="text-sm font-extrabold text-white">{handle}</h3>
                )}
                <span className="inline-flex text-[10px] font-bold text-[#39FF14]">
                  STREAMATE · Watch live
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
