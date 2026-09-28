import Image from "next/image";
import Link from "next/link";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { pickCoverUrl } from "@/lib/crackrevenue/api";
import { CamCardMeta } from "@/components/cams/CamCardMeta";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import {
  performerDisplayHandle,
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";

type ExplorePerformerGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

export function ExplorePerformerGrid({
  performers,
  emptyMessage = "No models in this category right now. Try another tag or check back soon.",
}: ExplorePerformerGridProps) {
  const cards = filterFeedPerformers(performers);

  if (cards.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs leading-relaxed text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((performer) => {
        const profilePath = performerProfilePathFromPerformer(performer);
        const handle = performerDisplayHandle(
          performer.nameClean || performer.name,
        );
        const cover = performer.posterUrl || pickCoverUrl(performer);

        const thumb = (
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900 shadow-md">
            {cover ? (
              <Image
                src={cover}
                alt={handle}
                fill
                sizes="50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-pink-900 to-purple-950" />
            )}
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-pink-600/90 px-1.5 py-0.5 text-[9px] font-black text-white">
              LIVE
            </span>
          </div>
        );

        const card = (
          <div className="group min-w-0">
            {thumb}
            <div className="px-1 pb-1 pt-1.5">
              <CamCardMeta performer={performer} variant="tube" />
            </div>
          </div>
        );

        return profilePath ? (
          <Link key={performer.feedKey} href={profilePath} className="block">
            {card}
          </Link>
        ) : (
          <div key={performer.feedKey}>{card}</div>
        );
      })}
    </div>
  );
}
