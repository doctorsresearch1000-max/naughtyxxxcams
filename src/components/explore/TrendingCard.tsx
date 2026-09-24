import Image from "next/image";
import type { ExploreModel } from "@/data/mock";
import { formatViewers } from "@/data/mock";

type TrendingCardProps = {
  model: ExploreModel;
};

export function TrendingCard({ model }: TrendingCardProps) {
  return (
    <article className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-cyan/15 bg-surface">
      <Image
        src={model.image}
        alt={`${model.username} live`}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
      <span className="absolute left-2 top-2 rounded-md bg-magenta px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-neon">
        {model.tag}
      </span>
      <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
        👁 {formatViewers(model.viewers)}
      </span>
      <p className="absolute bottom-2 left-2 right-2 truncate text-sm font-bold">
        @{model.username}
      </p>
    </article>
  );
}
