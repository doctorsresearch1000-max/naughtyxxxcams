import Image from "next/image";
import Link from "next/link";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { pickCoverUrl } from "@/lib/crackrevenue/api";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import { formatExploreViews } from "@/lib/explore/exploreGrid";
import {
  performerDisplayHandle,
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";

type ExploreSlushyGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

function EyeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="opacity-90"
    >
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ExploreSlushyGrid({
  performers,
  emptyMessage = "No hay resultados. Prueba otro filtro o búsqueda.",
}: ExploreSlushyGridProps) {
  const cards = filterFeedPerformers(performers);

  if (cards.length === 0) {
    return (
      <p className="rounded-2xl bg-[#1C1C1E] p-4 text-center text-xs leading-relaxed text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {cards.map((performer) => {
        const profilePath = performerProfilePathFromPerformer(performer);
        const handle = performerDisplayHandle(
          performer.nameClean || performer.name,
        );
        const cover = performer.posterUrl || pickCoverUrl(performer);
        const views = formatExploreViews(performer);

        const inner = (
          <>
            {cover ? (
              <Image
                src={cover}
                alt={handle}
                fill
                sizes="33vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-pink-900/80 to-purple-950" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent" />
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 text-[10px] font-bold text-white drop-shadow-md">
              <EyeIcon />
              <span>{views}</span>
            </div>
          </>
        );

        const className =
          "relative aspect-[3/5] overflow-hidden rounded-[18px] bg-[#1C1C1E]";

        return profilePath ? (
          <Link key={performer.feedKey} href={profilePath} className={className}>
            {inner}
          </Link>
        ) : (
          <div key={performer.feedKey} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
