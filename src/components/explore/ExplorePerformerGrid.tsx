import Image from "next/image";
import Link from "next/link";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { pickCoverUrl } from "@/lib/crackrevenue/api";
import { filterFeedPerformers } from "@/lib/feed/filterPerformers";
import {
  performerDisplayHandle,
  performerProfilePath,
} from "@/lib/profile/performerHandle";

type ExplorePerformerGridProps = {
  performers: CrackPerformer[];
  emptyMessage?: string;
};

export function ExplorePerformerGrid({
  performers,
  emptyMessage = "No hay modelos en esta categoría ahora. Prueba otra etiqueta o vuelve en unos minutos.",
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
        const profilePath = performerProfilePath(
          performer.nameClean || performer.name,
        );
        const handle = performerDisplayHandle(
          performer.nameClean || performer.name,
        );
        const cover = performer.posterUrl || pickCoverUrl(performer);

        const inner = (
          <>
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
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <span className="mb-1 inline-flex items-center gap-1 rounded-md bg-pink-600/90 px-1.5 py-0.5 text-[9px] font-black text-white">
                LIVE
              </span>
              <p className="truncate text-sm font-bold text-white">{handle}</p>
            </div>
          </>
        );

        return profilePath ? (
          <Link
            key={performer.feedKey}
            href={profilePath}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-800/80 shadow-md"
          >
            {inner}
          </Link>
        ) : (
          <div
            key={performer.feedKey}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-800/80 shadow-md"
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}
